# Architecture du Module IA

## Vue d'ensemble

Le module IA repose sur l'API Claude (Anthropic) et couvre trois fonctions principales :

1. **Fiche de Poste Parsing** : extraction structurée des critères depuis un appel d'offre / fiche de poste PDF/DOCX
2. **CV Parsing** : extraction structurée des données candidat depuis un CV PDF/DOCX
3. **Matching** : scoring sémantique candidat ↔ fiche de poste avec explications

## Pipeline de traitement

### Étape 1a — Parsing de la Fiche de Poste (Appel d'Offre)

Quand une ESN reçoit un appel d'offre client (PDF, DOCX, email), le recruteur l'uploade sur la mission. L'IA analyse le document et en extrait les critères structurés :

**Extraction texte :** PDF → `pdf-parse`, DOCX → `mammoth`

**Prompt Claude API :**

```
Système : Tu es un expert en recrutement IT avec 15 ans d'expérience en ESN.
Analyse cette fiche de poste / appel d'offre et extrais les critères en JSON strict.

Champs à extraire :
- title: titre du poste
- description: description détaillée de la mission
- requiredSkills: [{ name, level (1-4), isMandatory: bool }]
- seniority: JUNIOR | MID | SENIOR | LEAD | ARCHITECT
- minExperience: nombre d'années minimum
- location: lieu de la mission
- remotePolicy: ON_SITE | HYBRID | FULL_REMOTE
- budget: TJM ou budget indicatif (si mentionné)
- startDate: date de démarrage souhaitée
- duration: durée de la mission
- certifications: [{ name, isMandatory: bool }]
- languages: [{ name, level, isMandatory: bool }]
- eliminatoryCriteria: critères éliminatoires identifiés
- projectContext: contexte du projet / équipe
```

Les critères extraits sont :
- **Sauvegardés** dans la table `JobDescription` (champs `extracted*`)
- **Auto-convertis** en `RequiredSkill[]` sur la mission
- **Présentés** au recruteur pour validation/ajustement

Le recruteur a toujours le dernier mot : il peut modifier les critères extraits avant de lancer le matching.

### Étape 1b — Parsing du CV Candidat

Le CV uploadé (PDF ou DOCX) est converti en texte brut :
- PDF → `pdf-parse` (extraction native) ou OCR si scanné
- DOCX → `mammoth` (conversion en texte)

### Étape 2 — Extraction IA du CV (Claude API)

Le texte brut est envoyé à Claude avec un prompt structuré qui demande une extraction JSON :

```
Système : Tu es un expert en recrutement IT avec 15 ans d'expérience.
Analyse ce CV et extrais les informations suivantes en JSON strict.

Champs à extraire :
- identity: { firstName, lastName, email, phone, location }
- skills: [{ name, level (1-4), yearsOfExperience, category }]
- experiences: [{ company, title, startDate, endDate, technologies[], description }]
- education: [{ school, degree, field, year }]
- certifications: [{ name, issuer, year }]
- languages: [{ name, level }]
- summary: résumé professionnel en 2 phrases
- seniorityEstimate: JUNIOR | MID | SENIOR | LEAD | ARCHITECT
```

### Étape 3 — Normalisation des compétences

Les skills extraits sont normalisés via une table d'alias :
- `ReactJS`, `React.js`, `React JS` → `React`
- `K8s`, `Kube` → `Kubernetes`
- `Postgres`, `PG` → `PostgreSQL`

### Étape 4 — Matching sémantique (Fiche de Poste ↔ CV)

Le matching est **basé sur les critères extraits de la fiche de poste**, pas sur une description manuelle. Pour chaque paire candidat-mission, Claude produit un scoring :

```
Système : Expert staffing IT pour ESN. Score la compatibilité entre
ce candidat et cette fiche de poste / appel d'offre.

Fiche de Poste parsée : { extractedSkills, extractedSeniority,
  extractedExperience, certifications, languages, eliminatoryCriteria }
Candidat : { skills[], experiences[], certifications[], seniority,
  location, availability, tjm }

Critères de scoring (pondération configurable) :
- Compétences obligatoires (fiche) : 30% (éliminatoire si manquant)
- Compétences souhaitées (fiche) : 15%
- Séniorité & XP vs exigences fiche : 20%
- Certifications requises par la fiche : 10%
- Localisation & remote vs fiche : 10%
- Disponibilité vs date démarrage fiche : 10%
- Compatibilité TJM / budget fiche : 5%

Répondre UNIQUEMENT en JSON :
{
  "globalScore": 0-100,
  "technicalScore": 0-100,
  "seniorityScore": 0-100,
  "locationScore": 0-100,
  "availabilityScore": 0-100,
  "mandatorySkillsMet": true/false,
  "skillMatch": [{ "skill": "...", "fromJobDesc": true, "mandatory": true,
                    "matched": true/false, "detail": "..." }],
  "certificationMatch": [{ "name": "...", "matched": true/false }],
  "strengths": ["..."],
  "gaps": ["..."],
  "recommendation": "STRONG_MATCH | GOOD_MATCH | PARTIAL_MATCH | WEAK_MATCH",
  "explanation": "Résumé par rapport aux exigences de la fiche de poste"
}
```

**Avantages du matching basé sur la fiche de poste :**
- Critères exhaustifs (l'IA extrait tout du document)
- Scoring fidèle aux exigences réelles du client
- Gain de temps (pas de saisie manuelle des critères)
- Traçabilité complète (chaque critère vient de la fiche)

## Optimisations

### Rate Limiting par tenant

Chaque tenant a un quota d'appels IA par mois selon son plan :
- TRIAL : 50 appels/mois
- STARTER : 200 appels/mois
- PRO : 1000 appels/mois
- ENTERPRISE : illimité

Le compteur est géré dans Redis : `ai_usage:{orgId}:{month}`

### Mise en cache des matchs

Les scores de matching sont calculés une fois et stockés en DB. Ils sont recalculés uniquement si :
- Le profil du candidat est modifié
- Les skills requis de la mission changent
- La fiche de poste est re-uploadée ou re-parsée
- Le recruteur force un recalcul

### Pré-filtrage SQL

Avant d'appeler Claude pour le matching, un pré-filtre SQL élimine les candidats clairement non compatibles :
- Aucun skill en commun avec la mission
- Candidat non disponible
- Localisation incompatible (si mission on-site)

Cela réduit les appels API de 60-80%.

## Coûts estimés

| Usage | Tokens/appel | Coût/appel | Volume mensuel (50 tenants) | Coût mensuel |
|-------|:---:|:---:|:---:|:---:|
| Fiche de Poste Parsing | ~4000 | ~0.015€ | ~300 fiches | ~4.5€ |
| CV Parsing | ~3000 | ~0.01€ | ~500 CVs | ~5€ |
| Matching | ~2000 | ~0.007€ | ~5000 matchs | ~35€ |
| **Total** | | | | **~44.5€** |

## Diagrammes associés

- [Pipeline IA](../diagrams/flows/ai-pipeline.md)
- [Séquence Parsing + Matching](../diagrams/sequences/cv-parsing-matching.md)

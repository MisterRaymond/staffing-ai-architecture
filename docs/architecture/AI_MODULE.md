# Architecture du Module IA

## Vue d'ensemble

Le module IA repose sur l'API Claude (Anthropic) et couvre deux fonctions principales :

1. **CV Parsing** : extraction structurée de données depuis un CV PDF/DOCX
2. **Matching** : scoring sémantique candidat ↔ mission avec explications

## Pipeline de traitement

### Étape 1 — Extraction texte

Le CV uploadé (PDF ou DOCX) est d'abord converti en texte brut :
- PDF → `pdf-parse` (extraction native) ou OCR si scanné
- DOCX → `mammoth` (conversion en texte)

### Étape 2 — Parsing IA (Claude API)

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

### Étape 4 — Matching sémantique

Pour chaque paire candidat-mission, Claude produit un scoring multi-critères :

```
Système : Expert en staffing IT. Score la compatibilité (0-100).

Mission : { title, description, requiredSkills[], seniority, location, remote, tjm }
Candidat : { skills[], experiences[], seniority, location, availability, tjm }

Critères de scoring (pondération configurable) :
- Compétences techniques : 40%
- Séniorité & expérience : 20%
- Localisation & remote : 15%
- Disponibilité : 15%
- Compatibilité TJM (marge) : 10%

Répondre UNIQUEMENT en JSON :
{
  "globalScore": 0-100,
  "technicalScore": 0-100,
  "seniorityScore": 0-100,
  "locationScore": 0-100,
  "availabilityScore": 0-100,
  "skillMatch": [{ "skill": "...", "matched": true/false, "detail": "..." }],
  "strengths": ["..."],
  "gaps": ["..."],
  "recommendation": "STRONG_MATCH | GOOD_MATCH | PARTIAL_MATCH | WEAK_MATCH",
  "explanation": "Résumé en 2 phrases"
}
```

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
| CV Parsing | ~3000 | ~0.01€ | ~500 CVs | ~5€ |
| Matching | ~2000 | ~0.007€ | ~5000 matchs | ~35€ |
| **Total** | | | | **~40€** |

## Diagrammes associés

- [Pipeline IA](../diagrams/flows/ai-pipeline.mermaid)
- [Séquence Parsing + Matching](../diagrams/sequences/cv-parsing-matching.mermaid)

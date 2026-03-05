# Pipeline States

```mermaid
stateDiagram-v2
    [*] --> NEW: Candidat postule ou importé

    NEW --> PRESELECTED: Recruteur valide le profil
    NEW --> REJECTED: Profil non pertinent
    
    PRESELECTED --> QUALIFYING: Responsable lance la qualification
    PRESELECTED --> PROPOSED_TO_CLIENT: Candidat connu — skip qualification
    PRESELECTED --> REJECTED: Ne correspond pas

    state QUALIFYING {
        direction LR
        [*] --> activities_zone

        state activities_zone {
            direction TB
            note: Le Responsable Recrutement active\nles activités qu'il veut,\ndans l'ordre qu'il veut.
        }
    }
    
    QUALIFYING --> PROPOSED_TO_CLIENT: Toutes les activités requises = PASS
    QUALIFYING --> REJECTED: Activité critique = FAIL

    PROPOSED_TO_CLIENT --> CLIENT_INTERVIEW: Client accepte de rencontrer
    PROPOSED_TO_CLIENT --> REJECTED: Client refuse le profil

    CLIENT_INTERVIEW --> VALIDATED: Client valide
    CLIENT_INTERVIEW --> REJECTED: Client refuse après entretien

    VALIDATED --> ON_MISSION: Contrat signé
    VALIDATED --> CANCELLED: Désistement

    ON_MISSION --> MISSION_COMPLETED: Fin de mission
    ON_MISSION --> RENEWED: Prolongation
    ON_MISSION --> EARLY_TERMINATION: Fin anticipée

    RENEWED --> ON_MISSION

    state REJECTED {
        [*] --> reinject
        reinject: Réinjection dans le vivier
        reinject: Évaluations conservées
        reinject: Tags mis à jour
    }

    state MISSION_COMPLETED {
        [*] --> back_pool
        back_pool: Retour au vivier
        back_pool: Disponible immédiatement
    }

    CANCELLED --> [*]
    MISSION_COMPLETED --> [*]
    EARLY_TERMINATION --> [*]

    note right of QUALIFYING
        ACTIVITÉS DISPONIBLES (toutes optionnelles) :

        🎯 Évaluation Technique
           Expert Technique + candidat
           Score par compétence + verdict

        💬 Entretien Interne
           RH / Manager + candidat
           Motivation, soft skills, culture fit

        💻 Test Technique
           CodinGame, HackerRank, take-home
           Score automatique ou manuel

        📞 Vérification Références
           Appel aux anciens employeurs

        💰 Négociation Salariale
           TJM / salaire, avantages

        📄 Collecte Documents
           Diplômes, certifications

        🏢 Pré-qualification Client
           Call informel avec le client

        Le Responsable choisit lesquelles
        activer et dans quel ordre.
    end note

    note left of REJECTED
        Les activités complétées
        (évaluations, scores, notes)
        sont CONSERVÉES dans le vivier.
        Pas besoin de tout refaire
        si le candidat revient plus tard.
    end note
```

## Le pipeline flexible : comment ça marche

### Étapes fixes (obligatoires, dans l'ordre)

```
NEW → PRESELECTED → [QUALIFYING] → PROPOSED_TO_CLIENT → CLIENT_INTERVIEW → VALIDATED → ON_MISSION
```

### Étape QUALIFYING (flexible)

Quand un candidat passe en QUALIFYING, le Responsable Recrutement crée les **activités** qu'il juge nécessaires. Chaque activité est indépendante :

| Activité | Assignée à | Résultat |
|---|---|---|
| Évaluation Technique | Expert Technique | Verdict (STRONG_YES → STRONG_NO) + scores par compétence |
| Entretien Interne | Responsable ou Recruteur | PASS / FAIL + notes |
| Test Technique | Candidat (lien externe) | Score + PASS / FAIL |
| Vérification Références | Recruteur | OK / NOK + notes |
| Négociation Salariale | Responsable | Accord / Désaccord + TJM convenu |
| Collecte Documents | Recruteur | Complet / Incomplet |
| Pré-qualification Client | Delivery Manager | Intéressé / Pas intéressé |

### Règles de transition

- **QUALIFYING → PROPOSED_TO_CLIENT** : le Responsable décide manuellement quand le candidat est prêt. Pas de règle automatique — c'est son jugement.
- **QUALIFYING → REJECTED** : si une activité critique échoue (ex: évaluation technique = STRONG_NO), le Responsable peut rejeter.
- **PRESELECTED → PROPOSED_TO_CLIENT** : le Responsable peut skip la phase QUALIFYING s'il connaît déjà le candidat (ex: ancien consultant, déjà évalué dans le vivier).

### Exemples de scénarios

**Scénario A — Profil inconnu, mission exigeante :**
1. Évaluation Technique (Expert Java) → STRONG_YES
2. Entretien Interne (motivation, TJM) → PASS
3. → PROPOSED_TO_CLIENT

**Scénario B — Profil du vivier, déjà évalué :**
1. L'évaluation technique précédente est dans l'historique → pas besoin de refaire
2. Négociation TJM rapide → OK
3. → PROPOSED_TO_CLIENT

**Scénario C — Profil junior, le client veut vérifier :**
1. Test Technique (CodinGame) → 85/100
2. Entretien Interne → PASS
3. Pré-qualification Client (call informel) → Intéressé
4. → PROPOSED_TO_CLIENT

**Scénario D — Profil rare, urgence :**
1. → Skip QUALIFYING, directement PROPOSED_TO_CLIENT

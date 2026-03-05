# Architecture des Intégrations Sourcing

## Vue d'ensemble

Les Chargés de Recrutement (`SOURCING_OFFICER`) utilisent des outils de sourcing externes pour trouver et qualifier des candidats. Le SaaS doit s'intégrer avec ces plateformes pour importer automatiquement les CVs qualifiés dans le vivier.

## Plateformes ciblées

| Plateforme | Type | Priorité | Mode d'intégration |
|-----------|------|:---:|-----|
| **SmartRecruiters** | ATS / Sourcing | P1 | API REST + Webhooks |
| **LinkedIn Recruiter** | Sourcing | P1 | API partenaire (RSC) |
| **Indeed** | Jobboard | P2 | API + Webhooks |
| **APEC** | Jobboard cadres | P2 | API |
| **Monster** | Jobboard | P3 | API |
| **Welcome to the Jungle** | Jobboard tech | P2 | API |

## Architecture d'intégration

### Pattern : Webhook + API bidirectionnel

```
Outil externe (SmartRecruiters)
    │
    ├── Webhook → POST /api/webhooks/smartrecruiters
    │              │
    │              ├── Validation du secret webhook
    │              ├── Extraction des données candidat
    │              ├── Dédoublonnage (email existant ?)
    │              ├── Parsing IA du CV
    │              ├── Ajout au vivier (source = SMART_RECRUITERS)
    │              └── Notification au Responsable Recrutement
    │
    └── API Pull ← GET /sync (fallback si webhook manqué)
                    │
                    └── Récupère les candidats modifiés depuis lastSyncAt
```

### Dédoublonnage

Quand un CV arrive d'un outil externe :

1. Vérifier si l'email existe déjà dans le tenant
2. Si oui : enrichir le profil existant (ajouter la source, mettre à jour le CV si plus récent)
3. Si non : créer un nouveau candidat avec `source = SMART_RECRUITERS` et `importedFromTool = "{id_externe}"`

### Traçabilité

Chaque candidat importé conserve :
- `source` : d'où il vient (enum `CandidateSource`)
- `sourceDetail` : détail libre ("Recherche LinkedIn post Data Engineer 12/03")
- `sourcedById` : le Chargé de Recrutement qui l'a qualifié
- `importedFromTool` : l'ID du candidat dans l'outil source (pour sync bidirectionnel)

### Configuration par tenant

Chaque ESN configure ses intégrations indépendamment via le modèle `SourcingIntegration` :
- Clé API chiffrée
- URL webhook auto-générée (unique par tenant + provider)
- Fréquence de sync (realtime via webhook, ou pull horaire/quotidien)
- Compteur de candidats importés (pour suivi et billing)

## Diagrammes associés

- [Organisation des Staffing Teams](../diagrams/flows/staffing-teams.md) — voir le rôle du Chargé de Recrutement

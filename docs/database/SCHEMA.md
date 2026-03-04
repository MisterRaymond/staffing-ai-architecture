# Modèle de Données — Documentation

## Vue d'ensemble

Le schéma de données suit une architecture **multi-tenant à base partagée**. Chaque entité métier possède une colonne `organizationId` pour l'isolation des données.

## Entités principales

### Organization (Tenant)
L'entité racine. Représente une ESN cliente du SaaS. Chaque organization a un `slug` unique qui sert de sous-domaine.

### User
Les utilisateurs de l'application, liés à une Organization. Rôles : ADMIN, RECRUITER, MANAGER, VIEWER.

### Candidate
Les candidats IT gérés par l'ESN. Contient les données extraites du CV par l'IA (`cvParsedData`).

### Skill
Compétences d'un candidat, normalisées via la taxonomie interne. Chaque skill a un niveau (BEGINNER → EXPERT) et un nombre d'années d'expérience.

### Client
Les entreprises clientes de l'ESN, celles qui achètent des prestations de consulting.

### Mission
Une demande de prestation d'un client. Contient les skills requis, le TJM de vente, la durée estimée.

### RequiredSkill
Compétences requises pour une mission, avec un niveau minimum et un poids (importance).

### MatchScore
Résultat du matching IA entre un candidat et une mission. Score global 0-100, scores par critère, forces/lacunes, recommandation.

### Application
La candidature d'un candidat à une mission, avec son état dans le pipeline (NEW → ON_MISSION).

### Placement
Un candidat affecté à une mission chez un client. C'est l'entité qui lie candidat, mission et client une fois le recrutement validé.

### FinancialRecord
Suivi financier mensuel d'un placement. Contient les TJM, coûts, marges calculées. Un enregistrement par mois par placement.

### AuditLog
Journal d'audit de toutes les actions sensibles, par tenant.

## Contraintes d'intégrité

- `Organization.slug` : UNIQUE — un seul sous-domaine par tenant
- `User.email` : UNIQUE globalement
- `MatchScore` : UNIQUE sur (candidateId, missionId) — un seul score par paire
- `FinancialRecord` : UNIQUE sur (placementId, month) — un seul record par mois
- Toutes les clés étrangères ont `onDelete: Cascade` au niveau du tenant

## Index recommandés

```sql
-- Performance des requêtes multi-tenant
CREATE INDEX idx_candidates_org ON candidates(organization_id);
CREATE INDEX idx_missions_org_status ON missions(organization_id, status);
CREATE INDEX idx_applications_org_stage ON applications(organization_id, stage);
CREATE INDEX idx_placements_org_status ON placements(organization_id, status);
CREATE INDEX idx_matchscores_mission_score ON match_scores(mission_id, global_score DESC);
CREATE INDEX idx_financial_placement_month ON financial_records(placement_id, month);
CREATE INDEX idx_skills_candidate ON skills(candidate_id);
CREATE INDEX idx_skills_normalized ON skills(normalized_name);
```

## Diagrammes associés

- [Diagramme de Classes UML](../diagrams/domain/class-diagram.mermaid)
- [Entité-Relation (ERD)](../diagrams/domain/erd.mermaid)
- [Enums & Types](../diagrams/domain/enums.mermaid)

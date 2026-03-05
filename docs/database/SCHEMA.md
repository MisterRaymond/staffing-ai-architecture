# Modèle de Données — Documentation

## Vue d'ensemble

Le schéma de données suit une architecture **multi-tenant à base partagée**. Chaque entité métier possède une colonne `organizationId` pour l'isolation des données.

## Entités principales

### Organization (Tenant)
L'entité racine. Représente une ESN cliente du SaaS. Chaque organization a un `slug` unique qui sert de sous-domaine.

### User
Les utilisateurs de l'application, liés à une Organization. Rôles : ADMIN, RECRUITER, MANAGER, DIRECTOR, VIEWER. Les managers ont un `managerLevel` optionnel (TEAM_LEAD, SENIOR_MANAGER, DIRECTOR, VP) qui définit leur rang hiérarchique.

### StaffingTeam (Pôle / Équipe de recrutement)
Unité organisationnelle qui regroupe des recruteurs autour d'une spécialisation technique (Pôle Java, Pôle Data) ou d'un client dédié (Équipe BNP). Chaque pôle a un lead (manager), des membres, un vivier de candidats, et des missions. Un pôle peut être lié à un client spécifique (optionnel).

### StaffingTeamMember
Table de liaison entre User et StaffingTeam. Un recruteur peut appartenir à plusieurs pôles. Chaque membre a un rôle dans le pôle (RECRUITER, SOURCER, COORDINATOR).

### Candidate
Les candidats IT gérés par l'ESN. Contient les données extraites du CV par l'IA (`cvParsedData`). **Le champ `poolStatus` gère le cycle de vie dans le vivier** : IN_POOL (disponible), ACTIVE_PROCESS (en cours de process), ON_MISSION (en mission), BLACKLISTED, DO_NOT_CONTACT. Le `poolScore` (1-5) mesure la "chaleur" du candidat (5 = très chaud, contacté récemment). `lastContactedAt` permet de détecter les candidats froids.

### CandidateTag
Étiquettes libres pour catégoriser les candidats dans le vivier. Ex: "Java Senior", "Disponible Q2", "Ex-BNP", "Profil rare". Permettent une recherche rapide par filtre.

### CandidatePool
Table de liaison entre Candidate et StaffingTeam. Un candidat peut appartenir à plusieurs pôles (ex: un profil Java qui est aussi dans le vivier BNP).

### CandidatePoolHistory
Journal complet de l'historique d'un candidat dans le vivier. Chaque événement est tracé : ajout au vivier, rejet d'une mission (avec raison et mission d'origine), réactivation sur une nouvelle mission, changement de statut, contact. Cet historique est **utilisé par le matching IA** pour enrichir le scoring (éviter de reproposer un candidat pour la même lacune).

### Skill
Compétences d'un candidat, normalisées via la taxonomie interne. Chaque skill a un niveau (BEGINNER → EXPERT) et un nombre d'années d'expérience.

### Client
Les entreprises clientes de l'ESN, celles qui achètent des prestations de consulting.

### Mission
Une demande de prestation d'un client. Contient les skills requis, le TJM de vente, la durée estimée.

### RequiredSkill
Compétences requises pour une mission, avec un niveau minimum et un poids (importance). Ces skills peuvent être **auto-générés par le parsing IA de la fiche de poste**, puis ajustés par le recruteur.

### JobDescription (Fiche de Poste / Appel d'Offre)
Document uploadé par le recruteur pour une mission. L'IA parse le document et en extrait des critères structurés : skills requis, séniorité, expérience, certifications, langues, localisation, budget, etc. Relation 1:1 avec Mission. Les critères extraits servent de **base au matching IA**. Le champ `parsingStatus` suit l'état du parsing (PENDING → PROCESSING → COMPLETED / FAILED).

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
CREATE INDEX idx_candidates_pool ON candidates(organization_id, pool_status);
CREATE INDEX idx_missions_org_status ON missions(organization_id, status);
CREATE INDEX idx_applications_org_stage ON applications(organization_id, stage);
CREATE INDEX idx_placements_org_status ON placements(organization_id, status);
CREATE INDEX idx_matchscores_mission_score ON match_scores(mission_id, global_score DESC);
CREATE INDEX idx_financial_placement_month ON financial_records(placement_id, month);
CREATE INDEX idx_skills_candidate ON skills(candidate_id);
CREATE INDEX idx_skills_normalized ON skills(normalized_name);
-- Staffing Teams & Talent Pool
CREATE INDEX idx_staffing_teams_org ON staffing_teams(organization_id);
CREATE INDEX idx_staffing_teams_client ON staffing_teams(client_id);
CREATE INDEX idx_candidate_pools_team ON candidate_pools(staffing_team_id);
CREATE INDEX idx_candidate_tags_org ON candidate_tags(organization_id, name);
CREATE INDEX idx_pool_history_candidate ON candidate_pool_history(candidate_id, created_at DESC);
```

## Diagrammes associés

- [Diagramme de Classes UML](../diagrams/domain/class-diagram.md)
- [Entité-Relation (ERD)](../diagrams/domain/erd.md)
- [Enums & Types](../diagrams/domain/enums.md)

# Modèle de Données — Documentation

## Vue d'ensemble

Le schéma de données suit une architecture **multi-tenant à base partagée**. Chaque entité métier possède une colonne `organizationId` pour l'isolation des données.

## Entités principales

### Organization (Tenant)
L'entité racine. Représente une ESN cliente du SaaS. Chaque organization a un `slug` unique qui sert de sous-domaine.

### User
Les utilisateurs de l'application, liés à une Organization. Il y a **deux filières** :

**Filière Delivery** (orientée client) : `DELIVERY_MANAGER` — Chef de Projet Delivery, responsable de la relation avec un ou plusieurs clients. Même autorité qu'un Directeur mais scopée à ses clients. Gère la qualité des prestations, les renouvellements, la négociation TJM.

**Filière Recrutement** (orientée candidat) : `RECRUITMENT_LEAD` — Responsable Recrutement qui pilote un pôle. `RECRUITER` — Recruteur qui gère le process candidat de bout en bout. `SOURCING_OFFICER` — Chargé de Recrutement qui source les candidats via des outils externes (SmartRecruiters, LinkedIn Recruiter, Indeed...) et alimente le vivier.

Le champ `managementLevel` (optionnel) définit le rang hiérarchique : VP → DIRECTOR → DELIVERY_MANAGER → TEAM_LEAD.

### StaffingTeam (Pôle / Équipe de recrutement)
Unité organisationnelle qui regroupe des membres autour d'une spécialisation technique (Pôle Java, Pôle Data) ou d'un client dédié (Équipe BNP). Chaque pôle a un lead, des membres (recruteurs, chargés de recrutement), un vivier de candidats, et des missions. Un Chef de Projet Delivery peut être lead d'un pôle client.

### StaffingTeamMember
Table de liaison entre User et StaffingTeam. Un utilisateur peut appartenir à plusieurs pôles. Chaque membre a un rôle dans le pôle (DELIVERY_MANAGER, RECRUITMENT_LEAD, RECRUITER, SOURCING_OFFICER).

### SourcingIntegration
Connexion à un outil de sourcing externe. Chaque tenant peut connecter SmartRecruiters, LinkedIn Recruiter, Indeed, etc. L'intégration se fait par API/webhook : les CVs qualifiés par les chargés de recrutement dans l'outil externe sont automatiquement importés dans le SaaS, parsés par l'IA, et ajoutés au vivier avec traçabilité de la source.

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

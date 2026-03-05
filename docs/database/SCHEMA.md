# Modèle de Données — Documentation

## Vue d'ensemble

Le schéma de données suit une architecture **multi-tenant à base partagée**. Chaque entité métier possède une colonne `organizationId` pour l'isolation des données.

## Entités principales

### Permission
Table **globale** (non liée à un tenant). Contient la liste de tous les droits disponibles dans le SaaS, organisés par module et action. Exemples : `candidates:create`, `finance:read`, `admin:roles`. Les tenants ne peuvent pas créer de permissions, seulement les affecter à leurs rôles. Ajoutée en seed à chaque déploiement.

### Role
Rôle **propre à chaque Organisation**. Nom libre (ex: "Directeur Delivery", "Chargé de Recrutement"). Chaque rôle a un niveau hiérarchique (`hierarchy` 0-100) utilisé pour empêcher un user de créer un rôle supérieur au sien. Le flag `isSystem` protège les rôles créés à l'onboarding contre la suppression. `isDefault` désigne le rôle assigné automatiquement aux nouveaux utilisateurs invités.

### RolePermission
Table de liaison entre Role et Permission. Le champ `scope` restreint le périmètre d'application : `own` (ses propres données), `team` (données de son/ses pôles), `all` (tout le tenant). Un rôle peut avoir la même permission avec des scopes différents pour des actions différentes.

### Organization (Tenant)
L'entité racine. Représente une ESN cliente du SaaS.

### User
Les utilisateurs de l'application. Chaque user a un **rôle dynamique** (référence vers la table Role). Le champ `isSuperAdmin` est réservé au provider du SaaS (pas visible côté tenant).

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
Un candidat affecté à une mission chez un client. Lie candidat, mission et client une fois le recrutement validé.

### OrganizationRates
Taux employeur par défaut de l'ESN. Chaque ESN peut avoir **plusieurs jeux de taux** (un par pays/filiale). Contient les charges patronales, mutuelle, prévoyance, taxes, frais de gestion, et les paramètres de conversion (jours ouvrés/mois et /an). Ces taux sont utilisés pour pré-remplir les lignes de coûts à la création d'un placement CDI.

### PlacementFinance
Configuration financière d'un placement. Définit le **type de facturation** (Régie, Forfait, Sous-traitance), les TJMs (client, interne si offshore), et les calculs agrégés (dailyCost, dailyRevenue, dailyMargin, marginRate). Les calculs sont mis à jour automatiquement quand les CostLines changent.

### CostLine
Lignes de coûts libres associées à un placement. Chaque ligne a un label (libre), un montant, une fréquence (DAILY, MONTHLY, ANNUAL, ONE_TIME) et une catégorie (SALARY, EMPLOYER_CHARGES, BENEFITS, EQUIPMENT...). Le système convertit chaque ligne en **coût journalier** (dailyAmount) pour calculer le coût total du consultant. Pas de structure imposée : l'utilisateur ajoute les lignes qu'il veut.

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
CREATE INDEX idx_cost_lines_placement ON cost_lines(placement_id);
CREATE INDEX idx_org_rates_org ON organization_rates(organization_id);
CREATE INDEX idx_skills_candidate ON skills(candidate_id);
CREATE INDEX idx_skills_normalized ON skills(normalized_name);
-- RBAC
CREATE INDEX idx_roles_org ON roles(organization_id);
CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX idx_permissions_module ON permissions(module);
CREATE INDEX idx_users_role ON users(role_id);
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

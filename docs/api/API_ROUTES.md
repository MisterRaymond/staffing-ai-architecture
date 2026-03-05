# API Routes — Documentation

## Conventions

- Base URL tenant : `https://{slug}.staffingai.fr/api`
- Base URL admin : `https://admin.staffingai.fr/api/admin`
- Authentification : Bearer token (Clerk)
- Autorisation : **RBAC dynamique** — chaque route vérifie que le rôle de l'utilisateur possède la permission requise avec le bon scope
- Réponses : JSON
- Pagination : `?page=1&limit=20`
- Filtres : query params (`?status=OPEN&search=react`)

## Authentification & Tenant

| Méthode | Route | Description | Permission |
|---------|-------|-------------|:---:|
| POST | `/api/auth/onboarding` | Inscription ESN + création tenant | Public |
| POST | `/api/auth/invite` | Inviter un utilisateur au tenant | `admin:users` |
| GET | `/api/auth/me` | Profil utilisateur courant + permissions | Authentifié |
| GET | `/api/org/settings` | Paramètres du tenant | `admin:settings` |
| PUT | `/api/org/settings` | Modifier les paramètres | `admin:settings` |

## Rôles & Permissions (RBAC)

| Méthode | Route | Description | Permission |
|---------|-------|-------------|:---:|
| GET | `/api/roles` | Liste des rôles de l'organisation | `admin:roles` |
| GET | `/api/roles/:id` | Détail d'un rôle + ses permissions | `admin:roles` |
| POST | `/api/roles` | Créer un nouveau rôle | `admin:roles` |
| PUT | `/api/roles/:id` | Modifier un rôle (nom, description) | `admin:roles` |
| DELETE | `/api/roles/:id` | Supprimer un rôle (sauf system) | `admin:roles` |
| GET | `/api/permissions` | Liste de toutes les permissions disponibles | `admin:permissions` |
| PUT | `/api/roles/:id/permissions` | Affecter des permissions à un rôle | `admin:permissions` |
| POST | `/api/roles/:id/duplicate` | Dupliquer un rôle existant | `admin:roles` |

### Exemple de payload : affecter des permissions
```json
PUT /api/roles/:id/permissions
{
  "permissions": [
    { "code": "candidates:create", "scope": "team" },
    { "code": "candidates:read", "scope": "team" },
    { "code": "missions:read", "scope": "all" },
    { "code": "pipeline:manage", "scope": "own" }
  ]
}
```

## Candidats

| Méthode | Route | Description | Auth |
|---------|-------|-------------|:---:|
| GET | `/api/candidates` | Liste paginée + filtres | Oui |
| GET | `/api/candidates/:id` | Détail d'un candidat | Oui |
| POST | `/api/candidates` | Créer un candidat | Recruiter+ |
| PUT | `/api/candidates/:id` | Modifier un candidat | Recruiter+ |
| DELETE | `/api/candidates/:id` | Supprimer un candidat | Admin |
| POST | `/api/candidates/parse-cv` | Upload + parsing CV par IA | Recruiter+ |
| POST | `/api/candidates/:id/reparse` | Re-parser le CV existant | Recruiter+ |
| GET | `/api/candidates/:id/matches` | Missions qui matchent ce candidat | Oui |
| GET | `/api/candidates/:id/pool-history` | Historique vivier du candidat | Oui |
| PUT | `/api/candidates/:id/pool-status` | Changer le statut vivier | Recruiter+ |
| POST | `/api/candidates/:id/tags` | Ajouter des tags | Recruiter+ |
| DELETE | `/api/candidates/:id/tags/:tagId` | Supprimer un tag | Recruiter+ |

## Staffing Teams (Pôles / Équipes)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|:---:|
| GET | `/api/staffing-teams` | Liste des pôles de l'organisation | Oui |
| GET | `/api/staffing-teams/:id` | Détail d'un pôle + membres + vivier | Oui |
| POST | `/api/staffing-teams` | Créer un pôle | Manager+ |
| PUT | `/api/staffing-teams/:id` | Modifier un pôle | Manager+ |
| DELETE | `/api/staffing-teams/:id` | Supprimer un pôle | Admin |
| POST | `/api/staffing-teams/:id/members` | Ajouter un membre au pôle | Manager+ |
| DELETE | `/api/staffing-teams/:id/members/:userId` | Retirer un membre | Manager+ |
| POST | `/api/staffing-teams/:id/candidates` | Ajouter un candidat au vivier du pôle | Recruiter+ |
| DELETE | `/api/staffing-teams/:id/candidates/:candidateId` | Retirer du vivier | Recruiter+ |
| GET | `/api/staffing-teams/:id/pool` | Vivier de candidats du pôle | Oui |

## Talent Pool (Vivier)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|:---:|
| GET | `/api/talent-pool` | Vivier global (tous pôles) + filtres | Oui |
| GET | `/api/talent-pool/stats` | Stats vivier (taille, chaleur, par pôle) | Manager+ |
| POST | `/api/talent-pool/search` | Recherche avancée dans le vivier | Oui |
| POST | `/api/talent-pool/reactivate` | Réactiver un candidat sur une mission | Recruiter+ |
| GET | `/api/talent-pool/cold` | Candidats froids (non contactés 3+ mois) | Manager+ |

### Filtres vivier (`GET /api/talent-pool`)
```
?staffingTeamId=xxx          Par pôle
&poolStatus=IN_POOL          Par statut vivier
&tags=Java,Senior            Par tags
&poolScoreMin=3              Score de chaleur minimum
&skills=react,typescript     Par compétences
&availability=IMMEDIATE      Par disponibilité
&notContactedSince=90        Non contacté depuis X jours
&sort=poolScore&order=desc   Tri
```

### Filtres disponibles (`GET /api/candidates`)
```
?search=dupont               Recherche texte (nom, email)
&skills=react,java           Filtrer par compétences
&availability=IMMEDIATE      Filtrer par disponibilité
&minExperience=5             Années d'expérience minimum
&location=Paris              Localisation
&page=1&limit=20             Pagination
&sort=createdAt&order=desc   Tri
```

## Clients

| Méthode | Route | Description | Auth |
|---------|-------|-------------|:---:|
| GET | `/api/clients` | Liste des clients | Oui |
| GET | `/api/clients/:id` | Détail client + missions | Oui |
| POST | `/api/clients` | Créer un client | Recruiter+ |
| PUT | `/api/clients/:id` | Modifier | Recruiter+ |
| DELETE | `/api/clients/:id` | Supprimer | Admin |

## Missions

| Méthode | Route | Description | Auth |
|---------|-------|-------------|:---:|
| GET | `/api/missions` | Liste paginée + filtres | Oui |
| GET | `/api/missions/:id` | Détail mission | Oui |
| POST | `/api/missions` | Créer une mission (+ upload fiche de poste optionnel) | Recruiter+ |
| PUT | `/api/missions/:id` | Modifier | Recruiter+ |
| DELETE | `/api/missions/:id` | Supprimer | Admin |
| POST | `/api/missions/:id/match` | Lancer le matching IA | Recruiter+ |
| GET | `/api/missions/:id/matches` | Résultats du matching | Oui |
| PUT | `/api/missions/:id/status` | Changer le statut | Recruiter+ |

## Fiches de Poste / Appels d'Offre

| Méthode | Route | Description | Auth |
|---------|-------|-------------|:---:|
| POST | `/api/missions/:id/job-description` | Upload fiche de poste (PDF/DOCX) + parsing IA | Recruiter+ |
| GET | `/api/missions/:id/job-description` | Détail fiche parsée + critères extraits | Oui |
| PUT | `/api/missions/:id/job-description` | Remplacer la fiche de poste (re-upload) | Recruiter+ |
| DELETE | `/api/missions/:id/job-description` | Supprimer la fiche | Recruiter+ |
| POST | `/api/missions/:id/job-description/reparse` | Re-parser la fiche existante | Recruiter+ |
| GET | `/api/missions/:id/job-description/status` | Statut du parsing (polling) | Oui |
| PUT | `/api/missions/:id/job-description/validate` | Valider/ajuster les critères extraits | Recruiter+ |

### Flow d'upload de fiche de poste

```
1. POST /api/missions/:id/job-description  (upload PDF)
2. → Stockage R2 + extraction texte + parsing IA (async)
3. GET  /api/missions/:id/job-description/status  (polling)
4. → Quand COMPLETED : critères auto-remplis dans la mission
5. PUT  /api/missions/:id/job-description/validate (recruteur ajuste)
6. → RequiredSkills de la mission mis à jour
7. POST /api/missions/:id/match  (matching basé sur la fiche parsée)
```

### Filtres disponibles (`GET /api/missions`)
```
?status=OPEN                 Statut de la mission
&clientId=xxx                Filtrer par client
&skills=java,spring          Compétences requises
&remotePolicy=HYBRID         Politique remote
&search=fullstack            Recherche texte
```

## Pipeline (Applications)

| Méthode | Route | Description | Permission |
|---------|-------|-------------|:---:|
| GET | `/api/applications` | Toutes les candidatures (Kanban) | `pipeline:read` |
| POST | `/api/applications` | Créer une candidature | `pipeline:manage` |
| PATCH | `/api/applications/:id/stage` | Avancer/reculer dans le pipeline | `pipeline:manage` |
| PATCH | `/api/applications/:id/reject` | Rejeter avec raison | `pipeline:reject` |
| PUT | `/api/applications/:id/notes` | Ajouter des notes | `pipeline:manage` |
| POST | `/api/applications/:id/assign-evaluator` | Assigner un Expert Technique | `pipeline:assign_evaluator` |

## Évaluations Techniques

| Méthode | Route | Description | Permission |
|---------|-------|-------------|:---:|
| GET | `/api/applications/:id/evaluations` | Liste des évaluations d'une candidature | `evaluations:read` |
| POST | `/api/applications/:id/evaluations` | Créer une évaluation technique | `evaluations:create` |
| GET | `/api/evaluations/:id` | Détail d'une évaluation | `evaluations:read` |
| PUT | `/api/evaluations/:id` | Modifier une évaluation | `evaluations:update` |
| DELETE | `/api/evaluations/:id` | Supprimer une évaluation | `evaluations:delete` |
| GET | `/api/evaluations/my` | Mes évaluations à faire (Expert Technique) | `evaluations:create` |
| GET | `/api/evaluations/stats` | Stats évaluations (taux d'acceptation, temps moyen) | `evaluations:read_all` |

### Flow d'évaluation technique

```
1. Le Responsable Recrutement pré-qualifie un candidat (pipeline: PRESELECTED)
2. Il assigne un Expert Technique via POST /assign-evaluator
3. L'Expert reçoit une notification avec le profil + la fiche de poste
4. L'Expert conduit l'entretien technique
5. Il remplit son évaluation : POST /api/applications/:id/evaluations
   - Verdict (STRONG_YES → STRONG_NO)
   - Score global (0-100)
   - Scores par compétence [{skill, score: 0-5, notes}]
   - Synthèse écrite + recommandation
   - Questions posées (capitalisation)
6. Le Responsable Recrutement voit l'évaluation
7. Si verdict positif → pipeline avance vers PROPOSED_TO_CLIENT
   Si verdict négatif → pipeline REJECTED (avec données d'évaluation)
```

### Filtres disponibles (`GET /api/applications`)
```
?missionId=xxx               Par mission
&stage=PRESELECTED           Par étape du pipeline
&assignedToId=xxx            Par recruteur assigné
```

## Finance

| Méthode | Route | Description | Auth |
|---------|-------|-------------|:---:|
| GET | `/api/finance/dashboard` | Dashboard consolidé | Manager+ |
| GET | `/api/finance/placement/:id` | Rentabilité d'un placement | Manager+ |
| POST | `/api/finance/simulate` | Simulation what-if | Manager+ |
| GET | `/api/finance/intercontract` | Consultants en intercontrat | Manager+ |
| GET | `/api/finance/export` | Export CSV/Excel | Manager+ |
| POST | `/api/finance/records` | Saisir un record financier mensuel | Admin |

### Paramètres dashboard
```
?period=2025-03              Mois spécifique
&period=2025-Q1              Trimestre
&period=2025                 Année complète
```

## Matching IA

| Méthode | Route | Description | Auth |
|---------|-------|-------------|:---:|
| POST | `/api/ai/match` | Matching candidat ↔ mission | Recruiter+ |
| POST | `/api/ai/batch-match` | Matching batch (tous candidats pour 1 mission) | Recruiter+ |
| GET | `/api/ai/usage` | Consommation API IA du tenant | Admin |

## Sourcing Integrations (Outils externes)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|:---:|
| GET | `/api/integrations` | Liste des intégrations configurées | Admin |
| POST | `/api/integrations` | Connecter un outil de sourcing | Admin |
| PUT | `/api/integrations/:id` | Modifier la configuration | Admin |
| DELETE | `/api/integrations/:id` | Déconnecter un outil | Admin |
| POST | `/api/integrations/:id/sync` | Forcer une synchronisation manuelle | Admin |
| GET | `/api/integrations/:id/status` | Statut de la dernière sync | Admin |
| POST | `/api/integrations/:id/test` | Tester la connexion | Admin |

### Webhooks sourcing (réception de CVs)

| Source | Route | Description |
|--------|-------|-------------|
| SmartRecruiters | `/api/webhooks/smartrecruiters` | Réception de candidats qualifiés |
| LinkedIn | `/api/webhooks/linkedin` | Import profils LinkedIn Recruiter |
| Indeed | `/api/webhooks/indeed` | Import candidatures Indeed |

### Flow d'import sourcing

```
1. Le Chargé de Recrutement qualifie un candidat dans SmartRecruiters
2. SmartRecruiters envoie un webhook → POST /api/webhooks/smartrecruiters
3. Le SaaS reçoit le CV + données candidat
4. Dédoublonnage (email déjà existant dans le tenant ?)
5. Parsing IA du CV (extraction skills, XP, etc.)
6. Le candidat est ajouté au vivier avec source = SMART_RECRUITERS
7. Tags auto-générés + assignation au pôle du chargé de recrutement
8. Notification au Responsable Recrutement du pôle
```

## Super Admin (Provider)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|:---:|
| GET | `/api/admin/tenants` | Liste tous les tenants | SuperAdmin |
| GET | `/api/admin/tenants/:id` | Détail d'un tenant | SuperAdmin |
| POST | `/api/admin/tenants` | Créer un tenant manuellement | SuperAdmin |
| PATCH | `/api/admin/tenants/:id/status` | Suspendre / Réactiver | SuperAdmin |
| POST | `/api/admin/tenants/:id/impersonate` | Se connecter en tant que | SuperAdmin |
| GET | `/api/admin/metrics` | KPIs SaaS (MRR, churn, etc.) | SuperAdmin |
| GET | `/api/admin/billing` | Vue facturation Stripe | SuperAdmin |

## Webhooks

| Source | Route | Description |
|--------|-------|-------------|
| Stripe | `/api/webhooks/stripe` | Paiements, abonnements, churn |
| Clerk | `/api/webhooks/clerk` | Création/suppression users |

## Codes de réponse

| Code | Signification |
|------|---------------|
| 200 | Succès |
| 201 | Créé avec succès |
| 400 | Requête invalide (validation) |
| 401 | Non authentifié |
| 403 | Non autorisé (mauvais rôle ou mauvais tenant) |
| 404 | Ressource non trouvée |
| 410 | Tenant fermé (churned) |
| 429 | Rate limit dépassé (quota IA) |
| 500 | Erreur serveur |

# API Routes — Documentation

## Conventions

- Base URL tenant : `https://{slug}.staffingai.fr/api`
- Base URL admin : `https://admin.staffingai.fr/api/admin`
- Authentification : Bearer token (Clerk)
- Réponses : JSON
- Pagination : `?page=1&limit=20`
- Filtres : query params (`?status=OPEN&search=react`)

## Authentification & Tenant

| Méthode | Route | Description | Auth |
|---------|-------|-------------|:---:|
| POST | `/api/auth/onboarding` | Inscription ESN + création tenant | Non |
| POST | `/api/auth/invite` | Inviter un utilisateur au tenant | Admin |
| GET | `/api/auth/me` | Profil utilisateur courant | Oui |
| GET | `/api/org/settings` | Paramètres du tenant | Admin |
| PUT | `/api/org/settings` | Modifier les paramètres | Admin |

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

| Méthode | Route | Description | Auth |
|---------|-------|-------------|:---:|
| GET | `/api/applications` | Toutes les candidatures (Kanban) | Oui |
| POST | `/api/applications` | Créer une candidature | Recruiter+ |
| PATCH | `/api/applications/:id/stage` | Avancer/reculer dans le pipeline | Recruiter+ |
| PATCH | `/api/applications/:id/reject` | Rejeter avec raison | Recruiter+ |
| PUT | `/api/applications/:id/notes` | Ajouter des notes | Recruiter+ |

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

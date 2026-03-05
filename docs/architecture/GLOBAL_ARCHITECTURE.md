# Architecture Globale — StaffingAI

## Vue d'ensemble

StaffingAI est une application **SaaS multi-tenant** construite en monorepo avec Next.js 14 (App Router). Chaque ESN cliente accède à l'application via un sous-domaine dédié (`{slug}.staffingai.fr`).

## Principes architecturaux

### 1. Multi-Tenant à base partagée

Tous les tenants partagent la même base PostgreSQL. L'isolation des données est assurée par :
- **Prisma Middleware** : injection automatique du `organizationId` dans chaque requête
- **PostgreSQL RLS (Row-Level Security)** : couche de sécurité supplémentaire au niveau DB
- **Cache Redis** : résolution rapide du tenant depuis le sous-domaine (TTL 5 min)

### 2. API-first

Toutes les opérations passent par les API Routes Next.js (`/api/*`). Le frontend consomme ces API via des hooks React (TanStack Query). Cette approche permet :
- Une future migration vers un backend séparé si nécessaire
- L'ouverture d'une API publique pour les intégrations clients
- Le testing indépendant du backend

### 3. IA comme service

Le module IA (parsing CV, parsing fiche de poste, matching) est découplé sous forme de services indépendants :
- `JobDescriptionParserService` : extraction structurée des critères depuis un appel d'offre / fiche de poste
- `CVParserService` : extraction structurée depuis un CV
- `MatchingService` : scoring candidat ↔ fiche de poste
- `SkillNormalizerService` : standardisation des compétences

Ces services appellent l'API Claude (Anthropic) et sont rate-limités par tenant via Redis.

### 4. Serverless & Managed

Aucun serveur à gérer :
- **Vercel** : hébergement + edge functions + cron jobs
- **Supabase** : PostgreSQL managé + Auth helpers + Realtime
- **Cloudflare R2** : stockage objet S3-compatible
- **Upstash Redis** : cache serverless

## Modules fonctionnels

| Module | Description | Priorité MVP |
|--------|-------------|:---:|
| **Auth & Multi-Tenant** | Inscription, login, résolution tenant, rôles (delivery + recrutement) | P0 |
| **Staffing Teams** | Pôles par techno ou par client, filière delivery + recrutement, affectation membres | P0 |
| **Gestion Candidats** | CRUD, upload CV, parsing IA | P0 |
| **Vivier / Talent Pool** | Réinjection des rejetés, tags, score chaleur, historique, recherche | P0 |
| **Gestion Missions** | CRUD, skills requis, statuts, affectation à un pôle | P0 |
| **Upload Fiche de Poste** | Upload appel d'offre client, parsing IA, extraction critères | P0 |
| **Matching IA** | Scoring basé sur fiche de poste ↔ CV + historique vivier, ranking | P0 |
| **Pipeline Recrutement** | Kanban, suivi des étapes, catégorisation des rejets | P1 |
| **Module Financier** | Rentabilité, marges, simulations | P0 |
| **Super Admin** | Gestion tenants, billing, monitoring | P1 |
| **Intégrations Sourcing** | SmartRecruiters, LinkedIn Recruiter, Indeed, APEC — import CVs qualifiés | P2 |
| **Espace Candidat** | Portail candidat, postulation, suivi | P2 |
| **Notifications** | Alertes in-app, emails automatiques | P2 |
| **Reporting** | Exports, graphiques, KPIs avancés | P2 |

## Diagrammes associés

- [Vue Contexte C4](../diagrams/system/context.md)
- [Vue Déploiement](../diagrams/system/deployment.md)
- [Diagramme de Classes](../diagrams/domain/class-diagram.md)

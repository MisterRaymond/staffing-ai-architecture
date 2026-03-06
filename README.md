# 🚀 StaffingAI — Architecture Technique

> SaaS de Staffing IT intelligent avec matching IA et module financier pour les ESN.

## 📋 Table des matières

- [Vision Produit](#-vision-produit)
- [Stack Technique](#-stack-technique)
- [Architecture](#-architecture)
- [Diagrammes](#-diagrammes)
- [Modèle de Données](#-modèle-de-données)
- [API](#-api)
- [Agents Claude](#-agents-claude)
- [Commandes clés](#-commandes-clés)
- [Infrastructure](#-infrastructure)

---

## 🎯 Vision Produit

**StaffingAI** est un outil de pilotage de staffing IT conçu pour les ESN (Entreprises de Services du Numérique). Il combine :

1. **Matching IA** — Scoring sémantique candidats ↔ missions basé sur les fiches de poste / appels d'offres uploadés
2. **Module Financier** — Rentabilité en temps réel (TJM, marges, intercontrat)
3. **Pipeline de Recrutement** — Suivi des candidatures de A à Z
4. **Upload de Fiches de Poste** — Les ESN uploadent les appels d'offres clients, l'IA en extrait les critères de matching
5. **Architecture Multi-Tenant** — Chaque ESN a son sous-domaine isolé

### Positionnement

Ce n'est **pas un ATS généraliste**. C'est un outil de **pilotage de staffing** avec l'IA comme accélérateur et la finance comme killer feature.

### Cible

| Segment | Taille | Prix/mois |
|---------|--------|-----------|
| Petites ESN (5-20 consultants) | ~50 clients | 99€ |
| ESN moyennes (20-100) | ~20 clients | 249€ |
| Grosses ESN (100+) | ~10 clients | 499€+ |

---

## 🛠 Stack Technique

| Couche | Technologie | Justification |
|--------|------------|---------------|
| **Frontend** | Next.js 15 (App Router) + TypeScript | SSR, API Routes, déploiement Vercel |
| **UI** | MUI v7 + Tailwind CSS (template Vuexy) | Design system riche et cohérent |
| **Backend** | Next.js API Routes | Mono-repo MVP, migration possible |
| **Base de données** | PostgreSQL (Supabase) | Données relationnelles + RLS |
| **ORM** | Prisma v6 | Typage, migrations, middleware |
| **IA** | Anthropic Claude API | Parsing CV + Matching sémantique |
| **Auth** | NextAuth.js + PrismaAdapter | Multi-tenant, sessions JWT enrichies |
| **Stockage** | Supabase Storage | CVs et documents |
| **Paiements** | Stripe | Abonnements + facturation |
| **Emails** | Resend | Emails transactionnels |
| **Cache** | Upstash Redis | Cache tenant + rate limiting |
| **Déploiement** | Vercel + Supabase | Serverless, scalable |
| **Dev Assistant** | Claude Code (CLI) | Agents IA spécialisés par module |

---

## 🏗 Architecture

Voir les documents détaillés dans [`/docs/architecture/`](./docs/architecture/) :

- [Architecture Globale](./docs/architecture/GLOBAL_ARCHITECTURE.md)
- [Architecture Multi-Tenant](./docs/architecture/MULTI_TENANT.md)
- [Architecture Module IA](./docs/architecture/AI_MODULE.md)
- [Architecture Module Financier](./docs/architecture/FINANCIAL_MODULE.md)
- [Architecture RBAC — Rôles & Permissions](./docs/architecture/RBAC.md)
- [Architecture Notifications](./docs/architecture/NOTIFICATIONS.md)
- [Architecture Intégrations Sourcing](./docs/architecture/SOURCING_INTEGRATIONS.md)

---

## 📊 Diagrammes

Tous les diagrammes sont en **Mermaid** (rendus nativement par GitHub).

### Système
| Diagramme | Fichier |
|-----------|---------|
| Vue Contexte (C4) | [`system/context.md`](./docs/diagrams/system/context.md) |
| Vue Déploiement | [`system/deployment.md`](./docs/diagrams/system/deployment.md) |
| Flux Multi-Tenant | [`flows/multi-tenant-resolution.md`](./docs/diagrams/flows/multi-tenant-resolution.md) |

### Domaine
| Diagramme | Fichier |
|-----------|---------|
| Diagramme de Classes (UML) | [`domain/class-diagram.md`](./docs/diagrams/domain/class-diagram.md) |
| Entité-Relation (ERD) | [`domain/erd.md`](./docs/diagrams/domain/erd.md) |
| Enums & Types | [`domain/enums.md`](./docs/diagrams/domain/enums.md) |
| Diagramme d'États - Pipeline | [`domain/pipeline-states.md`](./docs/diagrams/domain/pipeline-states.md) |

### Séquences
| Diagramme | Fichier |
|-----------|---------|
| Parsing CV + Matching IA | [`sequences/cv-parsing-matching.md`](./docs/diagrams/sequences/cv-parsing-matching.md) |
| Onboarding Tenant | [`sequences/tenant-onboarding.md`](./docs/diagrams/sequences/tenant-onboarding.md) |
| Calcul Financier | [`sequences/financial-calculation.md`](./docs/diagrams/sequences/financial-calculation.md) |
| Vivier — Rejet, Réactivation, Matching | [`sequences/talent-pool-reactivation.md`](./docs/diagrams/sequences/talent-pool-reactivation.md) |
| Notifications — Dispatch multi-canal | [`sequences/notification-dispatch.md`](./docs/diagrams/sequences/notification-dispatch.md) |

### Flows
| Diagramme | Fichier |
|-----------|---------|
| Pipeline IA | [`flows/ai-pipeline.md`](./docs/diagrams/flows/ai-pipeline.md) |
| Résolution Multi-Tenant | [`flows/multi-tenant-resolution.md`](./docs/diagrams/flows/multi-tenant-resolution.md) |
| Organisation des Staffing Teams | [`flows/staffing-teams.md`](./docs/diagrams/flows/staffing-teams.md) |
| RBAC — Vérification Permissions | [`flows/rbac-permission-check.md`](./docs/diagrams/flows/rbac-permission-check.md) |

---

## 💾 Modèle de Données

- [Schéma Prisma](./prisma/schema.prisma) — 33 modèles, 24 enums, PostgreSQL
- [Documentation du schéma](./docs/database/SCHEMA.md)

**Résumé du modèle :**
- 33 modèles Prisma (Organization, User, Candidate, Mission, Application, Placement...)
- 24 enums (PipelineStage, PoolStatus, BillingType, Seniority...)
- 67 permissions seedées sur 14 modules
- 7 rôles par défaut créés à l'onboarding de chaque tenant

---

## 🔌 API

- [Documentation API](./docs/api/API_ROUTES.md) — Toutes les routes REST documentées

---

## 🤖 Agents Claude

Le développement est assisté par une équipe d'agents Claude Code spécialisés.
Voir la documentation complète : **[docs/AGENTS.md](./docs/AGENTS.md)**

| Agent | Couleur | Rôle |
|-------|---------|------|
| `@staffingai-orchestrator` | 🟣 Purple | Chef de projet, coordination globale |
| `@staffingai-auth-tenant` | 🔵 Blue | NextAuth, middleware, onboarding, RBAC |
| `@staffingai-candidates` | 🟢 Green | Candidats, vivier, import CV |
| `@staffingai-pipeline` | 🟠 Orange | Kanban pipeline, activités, évaluations |

---

## ⌨️ Commandes clés

### Développement quotidien
```bash
# Lancer l'app en local
pnpm dev

# Lancer Claude Code (assistant IA)
claude

# Claude Code en mode autonome (sans validation)
claude --dangerously-skip-permissions
```

### Base de données
```bash
# Appliquer les migrations
pnpm db:migrate

# Seeder (permissions + rôles + org demo)
pnpm db:seed

# Ouvrir Prisma Studio (interface visuelle DB)
pnpm db:studio

# Regénérer le client Prisma après changement schema
pnpm db:generate

# Reset complet de la DB (⚠️ supprime toutes les données)
pnpm db:reset
```

### Git
```bash
# Voir les changements faits par les agents
git diff

# Annuler les changements non commités
git checkout .

# Pull les derniers agents/configs
git pull origin main
```

### Windows PowerShell (équivalents Linux)
```powershell
# rm -rf → 
Remove-Item -Recurse -Force chemin\du\dossier

# cp →
Copy-Item source destination

# cat →
Get-Content fichier

# grep →
Select-String "pattern" fichier
```

---

## 💰 Infrastructure & Coûts

Estimation pour ~50 tenants actifs :

| Service | Coût/mois |
|---------|-----------|
| Vercel Pro | 20€ |
| Supabase Pro | 25€ |
| Supabase Storage | ~5€ |
| Claude API | ~50-100€ |
| Resend | 20€ |
| Domaine + DNS | 10€ |
| **Total** | **~130-180€** |

---

## 📅 Phases de développement

| Phase | Statut | Contenu |
|-------|--------|---------|
| **Phase 0** | ✅ Terminée | Setup, schema Prisma, NextAuth, middleware multi-tenant, seed, navigation |
| **Phase 1** | 🔄 En cours | Auth & onboarding tenant, pages candidats, pipeline Kanban |
| **Phase 2** | ⏳ À venir | Module finance, matching IA, dashboards |
| **Phase 3** | ⏳ À venir | Intégrations sourcing, notifications, déploiement prod |

---

## 📁 Structure du repo

```
staffing-ai-architecture/
├── README.md
├── docs/
│   ├── AGENTS.md                    ← Équipe d'agents Claude Code
│   ├── architecture/
│   │   ├── GLOBAL_ARCHITECTURE.md
│   │   ├── MULTI_TENANT.md
│   │   ├── AI_MODULE.md
│   │   ├── FINANCIAL_MODULE.md
│   │   ├── RBAC.md
│   │   ├── NOTIFICATIONS.md
│   │   └── SOURCING_INTEGRATIONS.md
│   ├── diagrams/
│   │   ├── system/
│   │   ├── domain/
│   │   ├── sequences/
│   │   └── flows/
│   ├── database/
│   │   └── SCHEMA.md
│   └── api/
│       └── API_ROUTES.md
├── prisma/
│   └── schema.prisma                ← 33 modèles, 24 enums
└── src/
    └── middleware/
        └── tenant-resolver.ts
```

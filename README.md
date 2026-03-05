# 🚀 StaffingAI — Architecture Technique

> SaaS de Staffing IT intelligent avec matching IA et module financier pour les ESN.

## 📋 Table des matières

- [Vision Produit](#-vision-produit)
- [Stack Technique](#-stack-technique)
- [Architecture](#-architecture)
- [Diagrammes](#-diagrammes)
- [Modèle de Données](#-modèle-de-données)
- [API](#-api)
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
| **Frontend** | Next.js 14 (App Router) + TypeScript | SSR, API Routes, déploiement Vercel |
| **Styling** | Tailwind CSS + shadcn/ui | Design system rapide et cohérent |
| **Backend** | Next.js API Routes | Mono-repo MVP, migration possible |
| **Base de données** | PostgreSQL (Supabase) | Données relationnelles + RLS |
| **ORM** | Prisma | Typage, migrations, middleware |
| **IA** | Anthropic Claude API | Parsing CV + Matching sémantique |
| **Auth** | Clerk | Multi-tenant, SSO, 2FA |
| **Stockage** | Cloudflare R2 | CVs et documents (compatible S3) |
| **Paiements** | Stripe | Abonnements + facturation |
| **Emails** | Resend | Emails transactionnels |
| **Cache** | Upstash Redis | Cache tenant + rate limiting |
| **Déploiement** | Vercel + Supabase | Serverless, scalable |

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

- [Schéma Prisma](./prisma/schema.prisma) — Modèle complet avec relations et enums
- [Documentation du schéma](./docs/database/SCHEMA.md)

---

## 🔌 API

- [Documentation API](./docs/api/API_ROUTES.md) — Toutes les routes REST documentées

---

## 💰 Infrastructure & Coûts

Estimation pour ~50 tenants actifs :

| Service | Coût/mois |
|---------|-----------|
| Vercel Pro | 20€ |
| Supabase Pro | 25€ |
| Cloudflare R2 | ~5€ |
| Claude API | ~50-100€ |
| Clerk | 25€ |
| Domaine + DNS | 10€ |
| **Total** | **~135-185€** |

---

## 📅 Roadmap MVP (8 semaines)

- **Semaines 1-2** — Setup projet, modèle de données, auth multi-tenant
- **Semaines 3-4** — Upload + parsing CV par IA, CRUD candidats/missions
- **Semaines 5-6** — Matching IA, dashboard financier, pipeline Kanban
- **Semaines 7-8** — UI polish, onboarding, déploiement, tests pilotes

---

## 📁 Structure du projet

```
staffing-ai-architecture/
├── README.md
├── docs/
│   ├── architecture/
│   │   ├── GLOBAL_ARCHITECTURE.md
│   │   ├── MULTI_TENANT.md
│   │   └── AI_MODULE.md
│   ├── diagrams/
│   │   ├── system/
│   │   │   ├── context.md
│   │   │   └── deployment.md
│   │   ├── domain/
│   │   │   ├── class-diagram.md
│   │   │   ├── erd.md
│   │   │   ├── enums.md
│   │   │   └── pipeline-states.md
│   │   ├── sequences/
│   │   │   ├── cv-parsing-matching.md
│   │   │   ├── tenant-onboarding.md
│   │   │   └── financial-calculation.md
│   │   └── flows/
│   │       ├── ai-pipeline.md
│   │       └── multi-tenant-resolution.md
│   ├── database/
│   │   └── SCHEMA.md
│   └── api/
│       └── API_ROUTES.md
├── prisma/
│   └── schema.prisma
└── src/
    └── middleware/
        └── tenant-resolver.ts
```

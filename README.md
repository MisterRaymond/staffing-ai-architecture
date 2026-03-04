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

1. **Matching IA** — Scoring sémantique candidats ↔ missions via Claude API
2. **Module Financier** — Rentabilité en temps réel (TJM, marges, intercontrat)
3. **Pipeline de Recrutement** — Suivi des candidatures de A à Z
4. **Architecture Multi-Tenant** — Chaque ESN a son sous-domaine isolé

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

---

## 📊 Diagrammes

Tous les diagrammes sont en **Mermaid** (rendus nativement par GitHub).

### Système
| Diagramme | Fichier |
|-----------|---------|
| Vue Contexte (C4) | [`system/context.mermaid`](./docs/diagrams/system/context.mermaid) |
| Vue Déploiement | [`system/deployment.mermaid`](./docs/diagrams/system/deployment.mermaid) |
| Flux Multi-Tenant | [`flows/multi-tenant-resolution.mermaid`](./docs/diagrams/flows/multi-tenant-resolution.mermaid) |

### Domaine
| Diagramme | Fichier |
|-----------|---------|
| Diagramme de Classes (UML) | [`domain/class-diagram.mermaid`](./docs/diagrams/domain/class-diagram.mermaid) |
| Entité-Relation (ERD) | [`domain/erd.mermaid`](./docs/diagrams/domain/erd.mermaid) |
| Enums & Types | [`domain/enums.mermaid`](./docs/diagrams/domain/enums.mermaid) |
| Diagramme d'États - Pipeline | [`domain/pipeline-states.mermaid`](./docs/diagrams/domain/pipeline-states.mermaid) |

### Séquences
| Diagramme | Fichier |
|-----------|---------|
| Parsing CV + Matching IA | [`sequences/cv-parsing-matching.mermaid`](./docs/diagrams/sequences/cv-parsing-matching.mermaid) |
| Onboarding Tenant | [`sequences/tenant-onboarding.mermaid`](./docs/diagrams/sequences/tenant-onboarding.mermaid) |
| Calcul Financier | [`sequences/financial-calculation.mermaid`](./docs/diagrams/sequences/financial-calculation.mermaid) |

### Flows
| Diagramme | Fichier |
|-----------|---------|
| Pipeline IA | [`flows/ai-pipeline.mermaid`](./docs/diagrams/flows/ai-pipeline.mermaid) |
| Résolution Multi-Tenant | [`flows/multi-tenant-resolution.mermaid`](./docs/diagrams/flows/multi-tenant-resolution.mermaid) |

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
│   │   │   ├── context.mermaid
│   │   │   └── deployment.mermaid
│   │   ├── domain/
│   │   │   ├── class-diagram.mermaid
│   │   │   ├── erd.mermaid
│   │   │   ├── enums.mermaid
│   │   │   └── pipeline-states.mermaid
│   │   ├── sequences/
│   │   │   ├── cv-parsing-matching.mermaid
│   │   │   ├── tenant-onboarding.mermaid
│   │   │   └── financial-calculation.mermaid
│   │   └── flows/
│   │       ├── ai-pipeline.mermaid
│   │       └── multi-tenant-resolution.mermaid
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

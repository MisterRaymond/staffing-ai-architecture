# 🤖 Équipe d'Agents Claude — StaffingAI

> Documentation des agents Claude Code configurés pour le développement de StaffingAI.
> Les fichiers agents se trouvent dans `staffing-ai-app/.claude/agents/`.

---

## Vue d'ensemble

Le développement de StaffingAI est assisté par une équipe de 4 agents Claude Code spécialisés.
Chaque agent a son propre contexte, ses outils, et son périmètre de responsabilité.

```
Tu (Nidal)
    │
    ▼
@staffingai-orchestrator  (🟣 Chef de projet)
    │
    ├──▶ @staffingai-auth-tenant   (🔵 Auth, RBAC, Onboarding)
    ├──▶ @staffingai-candidates    (🟢 Candidats, Vivier, Import CV)
    └──▶ @staffingai-pipeline      (🟠 Kanban, Activités, Évaluations)
```

---

## Les 4 Agents

### 🟣 `@staffingai-orchestrator`
**Modèle :** Sonnet | **Mémoire :** Projet | **Outils :** Tous

**Rôle :** Point d'entrée principal. Comprend la demande, lit les fichiers existants,
planifie les tâches, délègue aux agents spécialisés, maintient la cohérence globale.

**Quand l'utiliser :**
- Nouvelle feature qui touche plusieurs modules
- Questions d'architecture
- Coordination de tâches complexes
- Par défaut si tu ne sais pas quel agent appeler

---

### 🔵 `@staffingai-auth-tenant`
**Modèle :** Sonnet | **Mémoire :** Projet | **Outils :** Tous

**Rôle :** Tout ce qui touche à l'authentification, la résolution multi-tenant,
l'onboarding, et le RBAC dynamique.

**Périmètre :**
- `src/libs/auth.ts` — NextAuth callbacks
- `src/middleware.ts` — Résolution tenant
- Pages auth (login, register, onboarding)
- Hooks RBAC (`usePermission`, `useSession`)
- API routes `/api/auth/**`, `/api/onboarding/**`

**Quand l'utiliser :**
- Implémenter l'onboarding d'un nouveau tenant
- Problème de session ou de token JWT
- Ajouter/modifier des permissions RBAC
- Sécuriser une nouvelle route

---

### 🟢 `@staffingai-candidates`
**Modèle :** Sonnet | **Mémoire :** Projet | **Outils :** Tous

**Rôle :** Tout ce qui touche aux profils candidats, au vivier (talent pool),
à l'import de CVs et au matching IA.

**Périmètre :**
- `src/views/apps/candidates/` — Composants
- `src/app/api/candidates/` — API routes
- Pages : liste, fiche, import, vivier
- Modèles Prisma : Candidate, Skill, Experience, CandidatePool, CandidateTag

**Quand l'utiliser :**
- Créer/modifier les pages candidats
- Implémenter l'import et le parsing de CVs
- Gérer le vivier et la validation des profils
- Matching IA candidats ↔ missions

---

### 🟠 `@staffingai-pipeline`
**Modèle :** Sonnet | **Mémoire :** Projet | **Outils :** Tous

**Rôle :** Le pipeline de recrutement Kanban, les candidatures (Application),
les activités de qualification, et les évaluations techniques.

**Périmètre :**
- `src/views/apps/pipeline/` — Kanban board
- `src/app/api/pipeline/` — API routes
- `src/app/api/applications/` — Candidatures
- `src/app/api/evaluations/` — Évaluations techniques
- Modèles : Application, ApplicationActivity, TechnicalEvaluation

**Quand l'utiliser :**
- Implémenter/modifier le Kanban pipeline
- Ajouter des activités de qualification
- Créer le formulaire d'évaluation technique
- Gérer les transitions d'étapes

---

## Utilisation

### Lancer Claude Code
```bash
# Dans le dossier staffing-ai-app
claude

# Sans demander de validation (mode autonome)
claude --dangerously-skip-permissions
```

### Invoquer un agent
```bash
# Dans le chat Claude Code :
@staffingai-orchestrator implémente la page d'onboarding tenant
@staffingai-candidates crée la page liste candidats avec filtres
@staffingai-pipeline adapte le Kanban Vuexy pour le pipeline
@staffingai-auth-tenant crée le hook usePermission côté client
```

### Voir les agents disponibles
```bash
# Dans Claude Code :
/agents
```

---

## Mémoire des agents

Chaque agent a une mémoire persistante dans :
```
staffing-ai-app/.claude/agent-memory/[nom-agent]/MEMORY.md
```

Les agents enrichissent automatiquement cette mémoire au fil des sessions —
patterns découverts, décisions architecturales, fichiers créés, etc.

---

## Conventions appliquées par les agents

### Commits
```
feat(candidates): add candidate list page with filters
fix(auth): resolve tenant resolution on localhost
refactor(pipeline): extract KanbanCard into separate component
feat(rbac): add usePermission hook
```

### Sécurité (RBAC — appliqué par tous les agents)
```typescript
// Toute API route commence par :
const session = await getServerSession(authOptions)
if (!session?.user?.organizationId) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}
// + vérification permission spécifique
```

### Isolation tenant (appliqué par tous les agents)
```typescript
// TOUJOURS inclure organizationId dans les queries Prisma
await prisma.candidate.findMany({
  where: { organizationId: session.user.organizationId }
})
```

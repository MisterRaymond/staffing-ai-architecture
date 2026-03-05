# Architecture RBAC — Rôles & Permissions Dynamiques

## Principe

Les rôles ne sont **pas figés en code**. Chaque Organisation (tenant) peut :

- Créer ses propres rôles avec les noms qu'elle veut
- Affecter à chaque rôle une combinaison de permissions granulaires
- Restreindre le périmètre de chaque permission (ses données, son pôle, tout le tenant)
- Modifier les rôles à tout moment sans intervention technique

À l'onboarding, des rôles par défaut sont créés automatiquement (modifiables), mais l'admin peut en créer de nouveaux ou supprimer ceux qui ne servent pas.

## Architecture

```
Permission (globale, définie par le SaaS)
    │
    └── RolePermission (liaison + scope)
            │
            └── Role (défini par chaque Organisation)
                    │
                    └── User (un rôle par user)
```

- **Permission** : table globale, identique pour tous les tenants. Le SaaS définit la liste complète des droits disponibles. Les tenants ne peuvent pas créer de permissions, seulement les affecter à leurs rôles.
- **Role** : propre à chaque Organisation. Nom libre, permissions au choix.
- **RolePermission** : liaison entre un rôle et une permission, avec un **scope** optionnel.
- **User** : chaque utilisateur a un seul rôle dans son Organisation.

## Scope des permissions

Le scope restreint le périmètre d'application d'une permission :

| Scope | Signification | Exemple |
|-------|-------------|---------|
| `own` | Uniquement ses propres données | Un recruteur ne voit que les candidats qu'il a créés |
| `team` | Les données de son/ses Staffing Teams | Un responsable voit les candidats de son pôle |
| `all` | Toutes les données du tenant | Un admin voit tout |

Exemple : le rôle "Recruteur" a la permission `candidates:read` avec scope `team`. Il ne verra que les candidats des pôles auxquels il appartient.

## Registre complet des Permissions

### Module : Candidats (`candidates`)

| Code | Nom | Description |
|------|-----|-------------|
| `candidates:create` | Créer un candidat | Upload CV, saisie manuelle |
| `candidates:read` | Voir les candidats | Liste, détail, profil |
| `candidates:update` | Modifier un candidat | Éditer profil, skills, notes |
| `candidates:delete` | Supprimer un candidat | Suppression définitive |
| `candidates:import` | Import en masse | Upload CSV, import multi-CVs |
| `candidates:export` | Exporter les candidats | Export CSV/Excel |
| `candidates:parse_cv` | Parser un CV par IA | Déclencher le parsing IA |

### Module : Vivier / Talent Pool (`pool`)

| Code | Nom | Description |
|------|-----|-------------|
| `pool:read` | Voir le vivier | Accès au talent pool |
| `pool:manage` | Gérer le vivier | Changer poolStatus, poolScore, tags |
| `pool:reactivate` | Réactiver un candidat | Remettre en process depuis le vivier |
| `pool:tag` | Gérer les tags | Créer, modifier, supprimer des tags |
| `pool:history` | Voir l'historique vivier | Historique des mouvements d'un candidat |

### Module : Missions (`missions`)

| Code | Nom | Description |
|------|-----|-------------|
| `missions:create` | Créer une mission | Nouvelle mission + fiche de poste |
| `missions:read` | Voir les missions | Liste, détail |
| `missions:update` | Modifier une mission | Éditer description, skills, statut |
| `missions:delete` | Supprimer une mission | Suppression |
| `missions:close` | Clôturer une mission | Changer statut en FILLED/CLOSED |

### Module : Fiche de Poste (`job_descriptions`)

| Code | Nom | Description |
|------|-----|-------------|
| `job_descriptions:upload` | Uploader une fiche de poste | Upload PDF/DOCX |
| `job_descriptions:read` | Voir les fiches parsées | Accès aux critères extraits |
| `job_descriptions:validate` | Valider les critères extraits | Corriger/ajuster les critères IA |
| `job_descriptions:reparse` | Re-parser une fiche | Relancer le parsing IA |

### Module : Matching IA (`matching`)

| Code | Nom | Description |
|------|-----|-------------|
| `matching:launch` | Lancer un matching | Déclencher le scoring IA |
| `matching:read` | Voir les résultats | Scores, détails, explications |
| `matching:configure` | Configurer les pondérations | Ajuster les poids du scoring |

### Module : Pipeline (`pipeline`)

| Code | Nom | Description |
|------|-----|-------------|
| `pipeline:read` | Voir le pipeline | Vue Kanban des candidatures |
| `pipeline:manage` | Gérer le pipeline | Avancer/reculer les étapes, créer/gérer des activités |
| `pipeline:reject` | Rejeter un candidat | Rejeter avec catégorisation |
| `pipeline:propose` | Proposer au client | Passer à l'étape "Proposé au client" |
| `pipeline:validate` | Valider un placement | Valider la candidature finale |

### Module : Activités de qualification (`activities`)

| Code | Nom | Description |
|------|-----|-------------|
| `activities:create` | Créer une activité | Ajouter une activité à une candidature (éval, entretien, test...) |
| `activities:read` | Voir les activités | Consulter les activités d'une candidature |
| `activities:update` | Compléter une activité | Remplir le résultat d'une activité qui lui est assignée |
| `activities:manage` | Gérer toutes les activités | Modifier/supprimer n'importe quelle activité |

### Module : Évaluations techniques (`evaluations`)

| Code | Nom | Description |
|------|-----|-------------|
| `evaluations:read` | Voir les évaluations | Lire les fiches d'évaluation technique |
| `evaluations:create` | Évaluer un candidat | Remplir une évaluation technique (verdict, scores, notes) |
| `evaluations:update` | Modifier une évaluation | Corriger une évaluation existante |
| `evaluations:delete` | Supprimer une évaluation | Supprimer une fiche d'évaluation |
| `evaluations:read_all` | Voir toutes les évaluations | Lire les évaluations de tous les experts (pas seulement les siennes) |

### Module : Clients (`clients`)

| Code | Nom | Description |
|------|-----|-------------|
| `clients:create` | Créer un client | Nouveau client |
| `clients:read` | Voir les clients | Liste, détail |
| `clients:update` | Modifier un client | Éditer les infos |
| `clients:delete` | Supprimer un client | Suppression |

### Module : Finance (`finance`)

| Code | Nom | Description |
|------|-----|-------------|
| `finance:read` | Voir le module financier | Dashboard, marges, CA |
| `finance:manage` | Gérer les finances | Saisir TJM, coûts, records |
| `finance:simulate` | Simuler des scénarios | What-if sur les TJM/marges |
| `finance:export` | Exporter les données financières | Export CSV/Excel |
| `finance:read_global` | Voir les finances globales | KPIs consolidés tous pôles |

### Module : Staffing Teams (`teams`)

| Code | Nom | Description |
|------|-----|-------------|
| `teams:create` | Créer un pôle | Nouveau Staffing Team |
| `teams:read` | Voir les pôles | Liste, détail, membres |
| `teams:update` | Modifier un pôle | Éditer nom, spécialisation |
| `teams:delete` | Supprimer un pôle | Suppression |
| `teams:manage_members` | Gérer les membres | Ajouter/retirer des membres |
| `teams:manage_pool` | Gérer le vivier du pôle | Ajouter/retirer des candidats |

### Module : Placements (`placements`)

| Code | Nom | Description |
|------|-----|-------------|
| `placements:create` | Créer un placement | Affecter un candidat à une mission |
| `placements:read` | Voir les placements | Liste, détail |
| `placements:update` | Modifier un placement | Dates, contrat, statut |
| `placements:terminate` | Terminer un placement | Fin de mission |

### Module : Administration (`admin`)

| Code | Nom | Description |
|------|-----|-------------|
| `admin:roles` | Gérer les rôles | Créer, modifier, supprimer des rôles |
| `admin:permissions` | Affecter les permissions | Configurer les droits par rôle |
| `admin:users` | Gérer les utilisateurs | Inviter, modifier, désactiver des users |
| `admin:settings` | Paramètres organisation | Modifier les settings du tenant |
| `admin:billing` | Voir la facturation | Accès au portail Stripe |
| `admin:audit` | Voir les logs d'audit | Consulter l'historique des actions |
| `admin:impersonate` | Se connecter en tant que | Impersonation d'un autre user du tenant |

### Module : Intégrations (`integrations`)

| Code | Nom | Description |
|------|-----|-------------|
| `integrations:read` | Voir les intégrations | Liste des connexions sourcing |
| `integrations:manage` | Gérer les intégrations | Connecter/déconnecter outils |
| `integrations:sync` | Synchroniser | Forcer une sync manuelle |

### Module : Notifications (`notifications`)

| Code | Nom | Description |
|------|-----|-------------|
| `notifications:read` | Voir ses notifications | Accès à ses propres notifications |
| `notifications:manage_preferences` | Gérer ses préférences | Choisir les canaux par type d'événement |
| `notifications:manage_templates` | Gérer les templates | Modifier les templates de notification (Admin) |

## Rôles par défaut (créés à l'onboarding)

Ces rôles sont créés automatiquement quand une ESN s'inscrit. L'admin peut les modifier, en créer de nouveaux ou les supprimer (sauf "Administrateur" qui est protégé).

### Administrateur (`isSystem: true, hierarchy: 100`)
Toutes les permissions avec scope `all`. Non supprimable.

### Directeur Delivery (`hierarchy: 80`)
| Permissions | Scope |
|-------------|-------|
| `candidates:read`, `candidates:export` | `all` |
| `missions:*` | `all` |
| `pipeline:read`, `pipeline:propose`, `pipeline:validate` | `all` |
| `clients:*` | `all` |
| `finance:read`, `finance:read_global`, `finance:simulate`, `finance:export` | `all` |
| `teams:read` | `all` |
| `placements:*` | `all` |
| `matching:read` | `all` |
| `job_descriptions:read` | `all` |

### Responsable Recrutement (`hierarchy: 60`)
| Permissions | Scope |
|-------------|-------|
| `candidates:*` | `team` |
| `pool:*` | `team` |
| `missions:create`, `missions:read`, `missions:update` | `team` |
| `pipeline:*` | `team` |
| `activities:*` | `team` |
| `matching:*` | `team` |
| `job_descriptions:*` | `team` |
| `evaluations:read_all` | `team` |
| `evaluations:create`, `evaluations:update` | `team` |
| `teams:read`, `teams:manage_members`, `teams:manage_pool` | `team` |
| `finance:read` | `team` |
| `placements:read` | `team` |
| `clients:read` | `all` |

### Recruteur (`hierarchy: 40`)
| Permissions | Scope |
|-------------|-------|
| `candidates:create`, `candidates:read`, `candidates:update` | `team` |
| `candidates:parse_cv` | `team` |
| `pool:read`, `pool:reactivate`, `pool:tag` | `team` |
| `missions:read` | `team` |
| `pipeline:read`, `pipeline:manage`, `pipeline:reject` | `own` |
| `activities:create`, `activities:read`, `activities:update` | `team` |
| `matching:launch`, `matching:read` | `team` |
| `job_descriptions:read` | `team` |
| `evaluations:read_all` | `team` |
| `clients:read` | `all` |
| `placements:read` | `own` |

### Expert Technique (`hierarchy: 35`)
| Permissions | Scope |
|-------------|-------|
| `candidates:read` | `team` |
| `missions:read` | `team` |
| `job_descriptions:read` | `team` |
| `pipeline:read` | `team` |
| `activities:read`, `activities:update` | `own` |
| `evaluations:create` | `own` |
| `evaluations:read` | `own` |
| `evaluations:update` | `own` |
| `matching:read` | `team` |

L'Expert Technique voit les activités qui lui sont assignées, complète ses évaluations, et consulte les profils et fiches de poste pour contexte. Il ne crée pas d'activités ni ne gère le pipeline.

### Chargé de Recrutement (`hierarchy: 30`)
| Permissions | Scope |
|-------------|-------|
| `candidates:create`, `candidates:read`, `candidates:update` | `team` |
| `candidates:import`, `candidates:parse_cv` | `team` |
| `pool:read`, `pool:manage`, `pool:tag` | `team` |
| `missions:read` | `team` |
| `matching:read` | `team` |
| `integrations:read` | `all` |

### Consultation (`hierarchy: 10`)
| Permissions | Scope |
|-------------|-------|
| `candidates:read` | `all` |
| `missions:read` | `all` |
| `pipeline:read` | `all` |
| `finance:read` | `all` |
| `teams:read` | `all` |
| `placements:read` | `all` |
| `matching:read` | `all` |

## Vérification des permissions (côté code)

```typescript
// Middleware de vérification
async function checkPermission(
  userId: string,
  permission: string,   // Ex: "candidates:create"
  scope?: string,       // Ex: "team"
  resourceOwnerId?: string,
  resourceTeamId?: string
) {
  const user = await getUser(userId);
  const rolePerms = await getRolePermissions(user.roleId);

  const perm = rolePerms.find(rp => rp.permission.code === permission);
  if (!perm) return false;

  // Vérifier le scope
  switch (perm.scope) {
    case 'own':
      return resourceOwnerId === userId;
    case 'team':
      const userTeams = await getUserTeamIds(userId);
      return userTeams.includes(resourceTeamId);
    case 'all':
      return true;
    default:
      return false;
  }
}

// Utilisation dans une API route
export async function POST(req) {
  const user = await getCurrentUser();
  
  if (!await checkPermission(user.id, 'candidates:create', 'team', null, teamId)) {
    return new Response('Forbidden', { status: 403 });
  }
  
  // ... créer le candidat
}
```

## Diagrammes associés

- [Diagramme de Classes](../diagrams/domain/class-diagram.md) — voir Permission, Role, RolePermission
- [Organisation des Staffing Teams](../diagrams/flows/staffing-teams.md) — rôles en contexte

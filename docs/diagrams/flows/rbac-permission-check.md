# RBAC — Vérification des Permissions

```mermaid
graph TB
    REQ["🔌 Requête API<br/>POST /api/candidates<br/>User: Ahmed (Recruteur)"]

    REQ --> AUTH{"🔑 Authentifié ?<br/>Session Clerk valide"}
    AUTH -->|Non| DENY_401["401 Unauthorized"]
    AUTH -->|Oui| TENANT{"Tenant résolu ?<br/>organizationId"}
    TENANT -->|Non| DENY_404["404 Tenant inconnu"]
    TENANT -->|Oui| LOAD_ROLE["Charger le rôle de l'utilisateur<br/>User.roleId → Role"]

    LOAD_ROLE --> LOAD_PERMS["Charger les permissions du rôle<br/>RolePermission[] + Permission[]"]

    LOAD_PERMS --> HAS_PERM{"Permission requise<br/>existe dans le rôle ?<br/>Ex: candidates:create"}
    HAS_PERM -->|Non| DENY_403["403 Forbidden<br/>Permission manquante"]
    HAS_PERM -->|Oui| CHECK_SCOPE{"Vérifier le scope<br/>de la permission"}

    CHECK_SCOPE -->|"scope = all"| ALLOW["✅ Autorisé<br/>Accès à toutes les données du tenant"]
    CHECK_SCOPE -->|"scope = team"| CHECK_TEAM{"L'utilisateur appartient<br/>au même StaffingTeam<br/>que la ressource ?"}
    CHECK_SCOPE -->|"scope = own"| CHECK_OWN{"L'utilisateur est<br/>le créateur / propriétaire<br/>de la ressource ?"}

    CHECK_TEAM -->|Oui| ALLOW
    CHECK_TEAM -->|Non| DENY_403
    CHECK_OWN -->|Oui| ALLOW
    CHECK_OWN -->|Non| DENY_403

    ALLOW --> RLS["🛡️ PostgreSQL RLS<br/>Filtrage tenant automatique"]
    RLS --> RESPONSE["📦 Réponse données"]
```

## Exemples concrets

### Exemple 1 : Recruteur crée un candidat dans son pôle
```
User: Ahmed (rôle "Recruteur", pôle Java)
Action: POST /api/candidates (dans le pôle Java)
Permission requise: candidates:create
Scope du rôle: team
Vérification: Ahmed est membre du pôle Java → ✅ Autorisé
```

### Exemple 2 : Recruteur tente de voir les finances globales
```
User: Ahmed (rôle "Recruteur")
Action: GET /api/finance/dashboard?view=global
Permission requise: finance:read_global
Vérification: Le rôle "Recruteur" n'a pas finance:read_global → ❌ 403 Forbidden
```

### Exemple 3 : Directeur Delivery voit les candidats de tous les pôles
```
User: Paul (rôle "Directeur Delivery")
Action: GET /api/candidates
Permission requise: candidates:read
Scope du rôle: all
Vérification: scope = all → ✅ Voit tous les candidats du tenant
```

### Exemple 4 : Admin personnalise un rôle
```
L'admin de l'ESN "TechStaff" décide que ses recruteurs
doivent aussi pouvoir voir les finances de leur pôle.

Action: Ajouter la permission finance:read avec scope "team"
au rôle "Recruteur" de son organisation.

→ Tous les recruteurs voient maintenant les finances de leur pôle.
→ Aucun changement de code nécessaire.
```

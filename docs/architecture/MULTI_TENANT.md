# Architecture Multi-Tenant

## Stratégie d'isolation

**Approche choisie : Base de données partagée avec Row-Level Security**

Tous les tenants partagent une seule instance PostgreSQL. Chaque table métier possède une colonne `organizationId` qui filtre les données par tenant.

### Pourquoi cette approche ?

| Critère | DB partagée (choisi) | DB par tenant |
|---------|:---:|:---:|
| Coût infrastructure | ✅ Faible | ❌ Élevé |
| Complexité opérationnelle | ✅ Simple | ❌ Complexe |
| Migrations de schéma | ✅ Une seule | ❌ N migrations |
| Isolation des données | ⚠️ Logique (RLS) | ✅ Physique |
| Performance à grande échelle | ⚠️ À surveiller | ✅ Naturelle |
| Adapté pour < 500 tenants | ✅ Parfait | ❌ Overkill |

La DB par tenant sera envisagée uniquement si on dépasse 500+ tenants actifs.

## Sous-domaines

### Configuration DNS

```
*.staffingai.fr  →  CNAME  →  cname.vercel-dns.com
```

Un enregistrement wildcard suffit. Chaque nouveau tenant fonctionne instantanément sans intervention DNS.

### Sous-domaines réservés

```
admin.staffingai.fr     → Super Admin (Provider)
www.staffingai.fr       → Site marketing
api.staffingai.fr       → API publique (futur)
app.staffingai.fr       → Réservé
mail.staffingai.fr      → Réservé
status.staffingai.fr    → Page de statut (futur)
```

### Flow de résolution

1. Requête arrive sur `acme.staffingai.fr/dashboard`
2. Middleware extrait le slug `acme`
3. Vérification cache Redis (`tenant:acme`)
4. Si miss : query PostgreSQL + mise en cache (TTL 5 min)
5. Vérification du statut (ACTIVE, SUSPENDED, CHURNED)
6. Injection du context tenant dans les headers
7. Vérification auth (Clerk) + appartenance au tenant
8. Activation RLS PostgreSQL pour cette session

## Sécurité

### Triple couche de protection

1. **Middleware Next.js** : vérifie que le user authentifié appartient au tenant du sous-domaine
2. **Prisma Middleware** : injecte automatiquement `organizationId` dans toute requête
3. **PostgreSQL RLS** : policy au niveau DB qui refuse tout accès cross-tenant

### Politique RLS PostgreSQL

```sql
-- Activer RLS sur chaque table
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

-- Créer la policy
CREATE POLICY tenant_isolation ON candidates
  USING (organization_id = current_setting('app.current_tenant_id')::text);

-- L'API set le tenant avant chaque requête
SET app.current_tenant_id = 'org_xxx';
```

### Impersonation (Super Admin)

Le super admin peut "se connecter en tant que" un tenant pour le support :
- Accès temporaire logé dans l'AuditLog
- Session impersonation limitée à 1h
- Badge visuel "Mode impersonation" affiché

## Diagrammes associés

- [Flow de résolution Multi-Tenant](../diagrams/flows/multi-tenant-resolution.md)
- [Séquence Onboarding Tenant](../diagrams/sequences/tenant-onboarding.md)

## Suppression de données (RGPD)

### Suppression d'un tenant (droit à la portabilité + effacement)

1. L'admin du tenant demande la suppression depuis les paramètres
2. Export complet des données (JSON/CSV) si demandé (droit à la portabilité)
3. Le tenant passe en statut `CHURNED` avec un délai de rétention de 30 jours
4. Pendant le délai : l'admin peut annuler, le super admin peut intervenir
5. Après 30 jours : suppression définitive en cascade de toutes les données du tenant
6. Le slug est libéré et peut être réutilisé

### Suppression d'un candidat (droit à l'oubli)

Sur demande d'un candidat, suppression de : Candidate, Skills, Experiences, Applications, MatchScores, TechnicalEvaluations, CandidatePoolHistory, CandidatePool, CandidateTags. Les données anonymisées sont conservées dans l'AuditLog (action = DELETE, sans données personnelles).

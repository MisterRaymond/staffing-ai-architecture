# Architecture du Système de Notifications

## Vue d'ensemble

Le système de notifications est **multi-canal** (in-app + email), **configurable** par utilisateur, et **déclenché automatiquement** par les événements métier. Chaque utilisateur choisit ce qu'il veut recevoir et par quel canal.

## Architecture

```
Événement métier (ex: évaluation assignée)
    │
    ├── NotificationService.emit("evaluation_assigned", { data })
    │       │
    │       ├── Charger le NotificationTemplate pour ce type
    │       ├── Résoudre les destinataires (qui doit être notifié ?)
    │       ├── Pour chaque destinataire :
    │       │       ├── Vérifier NotificationPreference (activé ? quel canal ?)
    │       │       ├── Remplir le template avec les variables ({{candidateName}}, etc.)
    │       │       ├── Si IN_APP ou BOTH → INSERT Notification en DB
    │       │       └── Si EMAIL ou BOTH → Envoyer via Resend (async, queue)
    │       └── Log dans AuditLog
    │
    └── Frontend : polling ou WebSocket pour les notifications in-app
```

## Les trois modèles

**NotificationTemplate** — Défini par le SaaS (provider). Un template par type d'événement avec des variables `{{...}}`. Le template est le même pour tous les tenants. Il définit le titre, le message, le sujet email et le canal par défaut.

**Notification** — Instance concrète envoyée à un utilisateur. Contient le message résolu (variables remplacées), le statut lu/non-lu, et un lien vers l'entité concernée pour navigation directe en un clic.

**NotificationPreference** — Choix personnel de chaque utilisateur. Pour chaque type d'événement, il peut activer/désactiver le canal in-app, le canal email, ou les deux. Surcharge les canaux par défaut du template.

## Catalogue complet des événements

### Pipeline & Recrutement

| Type d'événement | Déclencheur | Destinataires | Template titre |
|---|---|---|---|
| `candidate_pending_review` | Nouveau CV uploadé ou importé, en attente de validation | Lead du pôle (Resp. Recrutement) | "CV à valider : {{candidateName}} — sourcé par {{sourcerName}}" |
| `candidate_validated` | Lead valide le CV → intègre le vivier | Chargé de Recrutement qui a sourcé | "✅ {{candidateName}} validé et ajouté au vivier" |
| `candidate_review_rejected` | Lead rejette le CV | Chargé de Recrutement qui a sourcé | "❌ {{candidateName}} non retenu : {{reason}}" |
| `candidate_new` | Candidat validé et ajouté au pôle | Membres du pôle | "Nouveau candidat dans le vivier : {{candidateName}}" |
| `candidate_imported` | CV importé via outil de sourcing (en attente de validation) | Lead du pôle | "CV importé depuis {{source}} à valider : {{candidateName}}" |
| `application_new` | Candidat postule à une mission | Recruteur assigné + Responsable du pôle | "Nouvelle candidature sur {{missionTitle}}" |
| `application_stage_changed` | Candidature avance dans le pipeline | Recruteur assigné | "{{candidateName}} passe à l'étape {{newStage}}" |
| `application_rejected` | Candidature rejetée | Candidat (si portail actif) | "Mise à jour de votre candidature" |

### Évaluations & Activités de Qualification

| Type d'événement | Déclencheur | Destinataires | Template titre |
|---|---|---|---|
| `activity_assigned` | Activité assignée à un utilisateur | L'assigné | "Activité assignée : {{activityTitle}} pour {{candidateName}}" |
| `activity_completed` | Activité complétée | Recruteur + Responsable | "Activité terminée : {{activityTitle}} — {{outcome}}" |
| `activity_overdue` | Activité non complétée après deadline | L'assigné + Responsable | "Rappel : activité en retard pour {{candidateName}}" |
| `evaluation_submitted` | Expert soumet son évaluation détaillée | Recruteur + Responsable Recrutement | "Évaluation terminée : {{candidateName}} — {{verdict}}" |
| `evaluation_verdict_positive` | Verdict YES ou STRONG_YES | Recruteur assigné | "✅ {{candidateName}} validé techniquement pour {{missionTitle}}" |
| `evaluation_verdict_negative` | Verdict NO ou STRONG_NO | Recruteur assigné | "❌ {{candidateName}} non retenu techniquement" |

### Matching IA

| Type d'événement | Déclencheur | Destinataires | Template titre |
|---|---|---|---|
| `match_strong` | Matching IA trouve un STRONG_MATCH | Recruteur assigné | "🎯 Match fort : {{candidateName}} pour {{missionTitle}} ({{score}}/100)" |
| `match_completed` | Matching batch terminé | Recruteur qui l'a lancé | "Matching terminé pour {{missionTitle}} : {{count}} candidats scorés" |

### Missions & Placements

| Type d'événement | Déclencheur | Destinataires | Template titre |
|---|---|---|---|
| `mission_new` | Nouvelle mission créée dans un pôle | Membres du pôle | "Nouvelle mission : {{missionTitle}} chez {{clientName}}" |
| `mission_filled` | Mission pourvue | Membres du pôle + Delivery Manager | "Mission pourvue : {{missionTitle}}" |
| `placement_ending_soon` | Fin de mission dans < 30 jours | Delivery Manager + Responsable Recrutement | "⚠️ Fin de mission dans {{daysLeft}}j : {{candidateName}} chez {{clientName}}" |
| `placement_ended` | Mission terminée | Delivery Manager + Responsable | "Mission terminée : {{candidateName}} disponible" |

### Vivier / Talent Pool

| Type d'événement | Déclencheur | Destinataires | Template titre |
|---|---|---|---|
| `pool_candidate_cold` | Candidat non contacté depuis 90+ jours | Recruteur du pôle | "❄️ Candidat froid : {{candidateName}} — dernier contact il y a {{daysSince}}j" |
| `pool_candidate_available` | Candidat redevient disponible | Responsable Recrutement du pôle | "{{candidateName}} est de nouveau disponible" |

### Finance

| Type d'événement | Déclencheur | Destinataires | Template titre |
|---|---|---|---|
| `finance_margin_low` | Marge d'un placement < seuil configuré | Manager + Admin | "⚠️ Marge faible : {{candidateName}} chez {{clientName}} — {{marginRate}}%" |
| `finance_intercontract_alert` | Consultant en intercontrat > X jours | Manager + Admin | "Intercontrat : {{candidateName}} sans mission depuis {{days}}j" |

### Administration

| Type d'événement | Déclencheur | Destinataires | Template titre |
|---|---|---|---|
| `user_invited` | Nouvel utilisateur invité | L'utilisateur invité | "Bienvenue chez {{organizationName}}" |
| `trial_ending_soon` | Fin de période d'essai dans 3 jours | Admin du tenant | "Votre essai se termine dans {{daysLeft}} jours" |
| `integration_sync_failed` | Échec de synchronisation sourcing | Admin | "Échec de sync {{provider}} : {{errorMessage}}" |

## Résolution des destinataires

Le système détermine automatiquement qui notifier selon le contexte :

```
Événement: evaluation_assigned
Résolution:
  1. L'Expert Technique assigné → destinataire direct (evaluatorId)

Événement: evaluation_submitted
Résolution:
  1. Le recruteur assigné à la candidature → application.assignedToId
  2. Le lead du pôle de la mission → mission.staffingTeam.leadId

Événement: placement_ending_soon
Résolution:
  1. Le Delivery Manager du client → staffingTeam (type client) .leadId
  2. Le Responsable Recrutement du pôle techno → mission.staffingTeam.leadId
  3. Les admins de l'organisation → users WHERE role.hierarchy >= 80
```

## Préférences utilisateur

Chaque utilisateur configure ses préférences dans ses paramètres :

```
┌─────────────────────────────────┬─────────┬─────────┐
│ Événement                       │ In-App  │ Email   │
├─────────────────────────────────┼─────────┼─────────┤
│ Activité assignée               │   ✅    │   ✅    │
│ Activité complétée              │   ✅    │   ❌    │
│ Évaluation terminée             │   ✅    │   ✅    │
│ Match fort détecté              │   ✅    │   ❌    │
│ Nouvelle candidature            │   ✅    │   ❌    │
│ Fin de mission proche           │   ✅    │   ✅    │
│ Candidat froid                  │   ❌    │   ✅    │ (digest hebdo)
│ Marge faible                    │   ✅    │   ✅    │
└─────────────────────────────────┴─────────┴─────────┘
```

Si un utilisateur n'a pas de préférence définie pour un type d'événement, les canaux par défaut du template sont utilisés.

## Implémentation technique

### In-App : polling ou WebSocket

**MVP (polling)** — Le frontend fait un `GET /api/notifications?unread=true` toutes les 30 secondes. Simple, fonctionne partout.

**Post-MVP (WebSocket / SSE)** — Migration vers Supabase Realtime ou Server-Sent Events pour des notifications instantanées.

### Email : queue asynchrone

Les emails ne sont jamais envoyés de manière synchrone. Un job queue (Inngest, Trigger.dev, ou un simple cron Vercel) dépile les emails à envoyer et les envoie via Resend.

### Digests

Certaines notifications à basse priorité (candidats froids, rappels hebdo) sont agrégées dans un **digest email** envoyé une fois par semaine au lieu d'un email par événement.

### Permissions

| Permission | Description |
|---|---|
| `notifications:read` | Voir ses propres notifications |
| `notifications:manage_preferences` | Modifier ses préférences de notification |
| `notifications:manage_templates` | Modifier les templates (Admin uniquement) |

## Diagrammes associés

- [Flow de vérification RBAC](../diagrams/flows/rbac-permission-check.md) — les notifications respectent le même système de permissions

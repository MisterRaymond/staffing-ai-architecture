# Notification Dispatch Flow

```mermaid
sequenceDiagram
    actor U as Responsable Recrutement
    participant APP as Frontend
    participant API as API Routes
    participant NS as NotificationService
    participant DB as PostgreSQL
    participant EMAIL as Resend (Email)

    Note over U,EMAIL: ═══ DÉCLENCHEMENT : Expert Technique assigné ═══

    U->>APP: Créer activité "Évaluation technique"<br/>assignée à Ahmed
    APP->>API: POST /api/applications/:id/activities<br/>{type: "TECHNICAL_EVALUATION", assignedToId: "ahmed_id"}

    API->>DB: INSERT ApplicationActivity
    API->>DB: UPDATE Application SET stage = QUALIFYING
    API->>NS: emit("activity_assigned", {<br/>  assigneeId, activityType, candidateName,<br/>  missionTitle, applicationId<br/>})

    Note over NS: ═══ RÉSOLUTION ═══

    NS->>DB: Charger NotificationTemplate<br/>WHERE eventType = "activity_assigned"
    DB-->>NS: Template : titre + message + canaux par défaut

    NS->>NS: Résoudre les destinataires<br/>→ Ahmed (Expert Technique)

    NS->>DB: Charger NotificationPreference<br/>WHERE userId = ahmed AND eventType = "activity_assigned"
    DB-->>NS: Préférences Ahmed : inApp=true, email=true

    NS->>NS: Remplir le template avec les variables<br/>titre = "Activité assignée : Évaluation technique Java<br/>pour Jean Dupont — Mission Dev Java Senior BNP"

    Note over NS: ═══ DISPATCH MULTI-CANAL ═══

    par In-App
        NS->>DB: INSERT Notification<br/>(recipientId=ahmed, type, titre,<br/>message, entityType="application",<br/>entityId, actionUrl="/applications/xxx")
    and Email (async)
        NS->>EMAIL: Envoyer email à ahmed@esn.fr<br/>Sujet + corps HTML depuis template
        EMAIL-->>NS: Email envoyé
    end

    API-->>APP: 200 OK
    APP-->>U: Badge "Expert assigné" sur la candidature

    Note over U,EMAIL: ═══ RÉCEPTION PAR L'EXPERT TECHNIQUE ═══

    actor E as Expert Technique Ahmed
    participant APP2 as Frontend (Ahmed)

    APP2->>API: GET /api/notifications?unread=true<br/>(polling toutes les 30s)
    API->>DB: SELECT notifications<br/>WHERE recipientId = ahmed<br/>AND isRead = false<br/>ORDER BY createdAt DESC
    DB-->>API: 1 notification non lue

    API-->>APP2: [{type: "evaluation_assigned",<br/>titre: "Évaluation à réaliser...",<br/>actionUrl: "/applications/xxx"}]

    APP2-->>E: 🔔 Badge notification (1)<br/>Cloche avec point rouge

    E->>APP2: Clic sur la notification
    APP2->>API: PATCH /api/notifications/:id/read
    API->>DB: UPDATE Notification SET isRead=true, readAt=now()

    APP2-->>E: Navigation vers la candidature<br/>Profil candidat + fiche de poste<br/>+ formulaire d'évaluation technique
```

## Événements déclencheurs principaux

```mermaid
graph LR
    subgraph "Événements Pipeline"
        E1["Candidature créée"]
        E2["Étape changée"]
        E3["Activité assignée"]
        E4["Activité complétée"]
        E5["Évaluation soumise"]
        E6["Candidature rejetée"]
    end

    subgraph "Événements Mission"
        E7["Mission créée"]
        E8["Mission pourvue"]
        E9["Fin de mission < 30j"]
        E10["Mission terminée"]
    end

    subgraph "Événements IA"
        E11["Strong match détecté"]
        E12["Matching batch terminé"]
        E13["CV parsé"]
    end

    subgraph "Événements Vivier"
        E14["Candidat froid 90j+"]
        E15["Candidat de nouveau dispo"]
    end

    subgraph "Événements Finance"
        E16["Marge faible"]
        E17["Intercontrat > Xj"]
    end

    NS["NotificationService.emit()"]

    E1 & E2 & E3 & E4 & E5 & E6 --> NS
    E7 & E8 & E9 & E10 --> NS
    E11 & E12 & E13 --> NS
    E14 & E15 --> NS
    E16 & E17 --> NS

    NS --> RESOLVE["Résoudre destinataires"]
    RESOLVE --> PREFS["Vérifier préférences"]
    PREFS --> DISPATCH["Dispatcher"]
    DISPATCH --> INAPP["🔔 In-App"]
    DISPATCH --> EMAILC["📧 Email"]
```

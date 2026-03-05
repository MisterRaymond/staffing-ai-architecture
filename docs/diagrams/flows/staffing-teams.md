# Staffing Teams — Organisation & Rôles

## 1. Organigramme

```mermaid
graph TB
    VP["👑 VP Staffing<br/>Marie"]

    VP --> DIR["📋 Directeur Delivery<br/>Paul"]

    DIR --> DM_BNP["🏦 Chef de Projet Delivery<br/>Thomas — Client BNP"]
    DIR --> RL_JAVA["👔 Resp. Recrutement Java<br/>Ahmed"]
    DIR --> RL_DATA["👔 Resp. Recrutement Data<br/>Laura"]

    subgraph POLE_JAVA["☕ Pôle Java/JEE"]
        RL_JAVA --> RJ1["🎯 Resp. Recrutement"]
        RL_JAVA --> RJ2["🎯 Resp. Recrutement"]
        RL_JAVA --> CRJ["🔍 Chargé de Recrutement"]
        RL_JAVA --> ETJ["🧪 Expert Technique Java"]
    end

    subgraph POLE_DATA["📊 Pôle Data"]
        RL_DATA --> RD1["🎯 Resp. Recrutement"]
        RL_DATA --> CRD["🔍 Chargé de Recrutement"]
        RL_DATA --> ETD["🧪 Expert Technique Data"]
    end
```

## 2. Croisement des filières : Delivery × Recrutement

```mermaid
graph LR
    subgraph DELIVERY["📌 Filière Delivery — orientée Client"]
        DM["🏦 Chef de Projet Delivery<br/>Thomas"]
    end

    subgraph CLIENT["🏢 Client"]
        BNP["BNP Paribas"]
    end

    subgraph RECRUTEMENT["📌 Filière Recrutement — orientée Candidat"]
        RL_J["👔 Resp. Recrutement Java<br/>Ahmed"]
        RL_D["👔 Resp. Recrutement Data<br/>Laura"]
    end

    BNP -->|"Besoin : Dev Java Senior"| DM
    BNP -->|"Besoin : Data Engineer"| DM

    DM -->|"Transmet le besoin Java"| RL_J
    DM -->|"Transmet le besoin Data"| RL_D

    RL_J -->|"Propose des candidats Java"| DM
    RL_D -->|"Propose des candidats Data"| DM

    DM -->|"Valide la qualité et envoie"| BNP
```

## 3. Circuit du sourcing — avec validation

```mermaid
graph LR
    subgraph OUTILS["🔌 Outils de Sourcing"]
        SR["SmartRecruiters"]
        LI["LinkedIn Recruiter"]
        IND["Indeed"]
        APEC["APEC"]
        WTTJ["Welcome to the Jungle"]
    end

    subgraph POLE["☕ Pôle Java/JEE"]
        CR["🔍 Chargé de Recrutement"]
        PENDING[("⏳ En attente\nde validation")]
        RESP["👔 Resp. Recrutement<br/>Valide ou rejette"]
        VIVIER[("🗂️ Vivier du pôle<br/>Candidats validés")]
        REC["🎯 Resp. Recrutement"]
    end

    SR -->|"CVs via API"| CR
    LI -->|"CVs via API"| CR
    IND -->|"CVs via API"| CR
    APEC -->|"CVs via API"| CR
    WTTJ -->|"CVs via API"| CR

    CR -->|"Upload + premier filtre"| PENDING
    PENDING -->|"🔔 Notification"| RESP
    RESP -->|"✅ Validé"| VIVIER
    RESP -->|"❌ Rejeté"| TRASH["🗑️ Archivé"]
    VIVIER -->|"Candidats disponibles"| REC
    REC -->|"Matching IA"| VIVIER
```

## 4. Détail du circuit de validation des CVs

```mermaid
sequenceDiagram
    actor CR as Chargé de Recrutement
    participant SaaS as StaffingAI
    participant API as Outil Sourcing (API)
    actor RESP as Resp. Recrutement (Lead du pôle)

    Note over CR,RESP: ═══ SCÉNARIO A : Upload manuel ═══

    CR->>SaaS: Upload CV + informations candidat
    SaaS->>SaaS: Parsing IA du CV
    SaaS->>SaaS: Candidat créé avec status = PENDING_REVIEW
    SaaS->>RESP: 🔔 "Nouveau candidat à valider : Jean Dupont"

    RESP->>SaaS: Consulte le profil parsé + skills extraits
    
    alt Profil pertinent pour le pôle
        RESP->>SaaS: ✅ Valider → status = IN_POOL
        SaaS->>SaaS: Candidat intègre le vivier du pôle
        SaaS->>CR: 🔔 "Jean Dupont validé et ajouté au vivier"
    else Profil non pertinent
        RESP->>SaaS: ❌ Rejeter + motif
        SaaS->>SaaS: Candidat archivé (pas dans le vivier)
        SaaS->>CR: 🔔 "Jean Dupont non retenu : motif"
    end

    Note over CR,RESP: ═══ SCÉNARIO B : Import automatique via API ═══

    API->>SaaS: Webhook : nouveau CV qualifié dans SmartRecruiters
    SaaS->>SaaS: Dédoublonnage (email existant ?)
    SaaS->>SaaS: Parsing IA du CV
    SaaS->>SaaS: Candidat créé avec status = PENDING_REVIEW
    SaaS->>RESP: 🔔 "CV importé depuis SmartRecruiters à valider : Marie Martin"
    SaaS->>CR: 🔔 "CV importé : Marie Martin — en attente de validation"

    RESP->>SaaS: Consulte le profil
    RESP->>SaaS: ✅ Valider → status = IN_POOL
    SaaS->>SaaS: Candidat intègre le vivier
```

## Les rôles expliqués

### Filière Delivery (orientée client)

| Rôle | Ce qu'il fait | Dans le SaaS |
|------|-------------|-------------|
| **VP Staffing** | Stratégie globale, décide l'ouverture/fermeture de pôles | Dashboard financier consolidé, KPIs globaux |
| **Directeur Delivery** | Supervise plusieurs pôles, arbitre les priorités | Vue multi-pôles, rapports inter-équipes |
| **Chef de Projet Delivery** | Responsable d'un client : qualité, renouvellements, TJM. Même autorité qu'un Directeur mais scopée au client | Missions de son client, placements, finance par client |

### Filière Recrutement (orientée candidat)

| Rôle | Ce qu'il fait | Dans le SaaS |
|------|-------------|-------------|
| **Resp. Recrutement (Lead)** | Pilote un pôle, distribue les missions, **valide les candidats avant intégration au vivier**, valide avant proposition client | Dashboard pôle, vivier, pipeline, matching IA, validation CVs |
| **Resp. Recrutement** | Process complet : qualification → activités → proposition → suivi | Pipeline Kanban, matching IA, activités de qualification |
| **Chargé de Recrutement** | Source via outils externes, alimente le vivier **(soumis à validation du Lead)**, premier filtre | Upload CVs, intégrations sourcing, tags |
| **Expert Technique** | Évalue techniquement les candidats quand on lui assigne une activité | Activités assignées, formulaire d'évaluation |

### Pourquoi la validation est nécessaire

Sans validation, n'importe quel CV sourcé atterrit directement dans le vivier. Résultat : vivier pollué, matching IA dégradé (bruit dans les résultats), perte de confiance des recruteurs dans l'outil. Le Resp. Recrutement (Lead du pôle) est le **gardien de la qualité du vivier**. Il valide que le profil est pertinent pour son pôle avant de l'intégrer.

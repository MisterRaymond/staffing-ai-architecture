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
        RL_JAVA --> RJ1["🎯 Recruteur"]
        RL_JAVA --> RJ2["🎯 Recruteur"]
        RL_JAVA --> CRJ["🔍 Chargé de Recrutement"]
        RL_JAVA --> ETJ["🧪 Expert Technique Java"]
    end

    subgraph POLE_DATA["📊 Pôle Data"]
        RL_DATA --> RD1["🎯 Recruteur"]
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

## 3. Circuit du sourcing

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
        VIVIER[("🗂️ Vivier du pôle<br/>Candidats qualifiés")]
        REC["🎯 Recruteur"]
    end

    SR -->|"CVs qualifiés"| CR
    LI -->|"CVs qualifiés"| CR
    IND -->|"CVs qualifiés"| CR
    APEC -->|"CVs qualifiés"| CR
    WTTJ -->|"CVs qualifiés"| CR

    CR -->|"Filtre + tag + ajout"| VIVIER
    VIVIER -->|"Candidats disponibles"| REC
    REC -->|"Lance le matching IA"| VIVIER
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
| **Resp. Recrutement** | Pilote un pôle, distribue les missions, valide avant client | Dashboard pôle, vivier, pipeline, matching IA |
| **Recruteur** | Process complet : qualification → entretien → proposition → suivi | Pipeline Kanban, matching IA, activités de qualification |
| **Chargé de Recrutement** | Source via outils externes, alimente le vivier, premier filtre | Upload CVs, intégrations sourcing, tags, vivier |
| **Expert Technique** | Évalue techniquement les candidats quand on lui assigne une activité | Activités assignées, formulaire d'évaluation |

### Comment les deux filières se croisent

Le client BNP envoie un appel d'offre pour un "Dev Java Senior". Thomas (Chef de Projet Delivery BNP) reçoit le besoin et le transmet à Ahmed (Resp. Recrutement Java). Ahmed active son pôle : le Chargé de Recrutement source sur LinkedIn, le Recruteur lance le matching IA sur le vivier, l'Expert Technique évalue les candidats shortlistés. Ahmed propose les meilleurs profils à Thomas, qui valide la qualité et les envoie au client.

Quand BNP a besoin d'un Data Engineer, Thomas transmet à Laura (Resp. Recrutement Data) — même mécanique, autre pôle.

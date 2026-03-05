# Staffing Teams Organization

```mermaid
graph TB
    subgraph ORG["🏢 Organisation ESN — TechStaff Consulting"]
        
        subgraph MGMT["👑 Direction"]
            VP["VP Staffing<br/>Marie Directrice<br/>ManagerLevel: VP"]
            DIR1["Directeur Delivery<br/>Paul Manager<br/>ManagerLevel: DIRECTOR"]
        end

        subgraph POLE_JAVA["☕ Pôle Java/JEE"]
            LEAD_JAVA["Team Lead Java<br/>Ahmed Recruiter<br/>ManagerLevel: TEAM_LEAD"]
            REC_JAVA1["Recruteur 1"]
            REC_JAVA2["Recruteur 2"]
            
            subgraph POOL_JAVA["Vivier Java"]
                C_JAVA1["👤 Jean D. — Java Senior<br/>🔥 poolScore: 5 — Dispo immédiate"]
                C_JAVA2["👤 Sophie M. — Java/Spring<br/>🟡 poolScore: 3 — Dispo 1 mois"]
                C_JAVA3["👤 Marc L. — Java/AWS<br/>❄️ poolScore: 1 — Non contacté 4 mois"]
            end
        end

        subgraph POLE_DATA["📊 Pôle Data"]
            LEAD_DATA["Senior Manager Data<br/>Laura Chef<br/>ManagerLevel: SENIOR_MANAGER"]
            REC_DATA1["Recruteur Data"]
            SOURCER["Sourceur Data"]
            
            subgraph POOL_DATA["Vivier Data"]
                C_DATA1["👤 Alex R. — Data Engineer<br/>🔥 poolScore: 4"]
                C_DATA2["👤 Nadia K. — ML Engineer<br/>🟡 poolScore: 3"]
            end
        end

        subgraph POLE_BNP["🏦 Équipe dédiée BNP"]
            LEAD_BNP["Team Lead BNP<br/>Thomas Coord<br/>ManagerLevel: TEAM_LEAD"]
            REC_BNP1["Recruteur BNP 1"]
            REC_BNP2["Recruteur BNP 2"]
            
            subgraph POOL_BNP["Vivier BNP"]
                C_BNP1["👤 Pierre V. — Fullstack<br/>🔥 Ex-BNP, connait l'environnement"]
                C_BNP2["👤 Julie F. — QA Automation<br/>🟡 poolScore: 3"]
            end
        end
    end

    subgraph CLIENTS["🏢 Clients"]
        BNP["BNP Paribas"]
        SG["Société Générale"]
        AXA["AXA"]
    end

    VP --> DIR1
    DIR1 --> LEAD_JAVA
    DIR1 --> LEAD_DATA
    DIR1 --> LEAD_BNP

    LEAD_JAVA --> REC_JAVA1
    LEAD_JAVA --> REC_JAVA2
    LEAD_DATA --> REC_DATA1
    LEAD_DATA --> SOURCER
    LEAD_BNP --> REC_BNP1
    LEAD_BNP --> REC_BNP2

    POLE_BNP -.->|"Dédié à"| BNP
    POLE_JAVA -.->|"Missions pour"| SG
    POLE_JAVA -.->|"Missions pour"| AXA
    POLE_DATA -.->|"Missions pour"| BNP
    POLE_DATA -.->|"Missions pour"| AXA

    style POLE_JAVA fill:#f0fdf4,stroke:#16a34a
    style POLE_DATA fill:#eff6ff,stroke:#2563eb
    style POLE_BNP fill:#fef3c7,stroke:#d97706
    style POOL_JAVA fill:#dcfce7,stroke:#86efac
    style POOL_DATA fill:#dbeafe,stroke:#93c5fd
    style POOL_BNP fill:#fef9c3,stroke:#fde047
```

## Modes d'organisation

Un Staffing Team (Pôle) peut être organisé de deux façons :

### Par spécialisation technique
- **Pôle Java/JEE** : tous les recruteurs spécialisés Java, vivier de candidats Java
- **Pôle Data** : Data Engineers, Data Scientists, ML Engineers
- **Pôle DevOps/Cloud** : profils infra, CI/CD, cloud

### Par client dédié
- **Équipe BNP** : recruteurs dédiés à BNP, tous profils confondus
- **Équipe SocGen** : idem pour Société Générale

### Mode hybride
Les deux modes coexistent. Un candidat peut appartenir à plusieurs pôles (ex: un profil Java qui est aussi dans le vivier BNP).

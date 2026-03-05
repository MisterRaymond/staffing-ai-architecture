# Staffing Teams — Organisation & Rôles

```mermaid
graph TB
    subgraph ORG["🏢 Organisation ESN — TechStaff Consulting"]
        
        subgraph DIRECTION["📌 Filière Direction"]
            VP["👑 VP Staffing / Delivery<br/>Marie Directrice<br/>────────────<br/>Stratégie globale<br/>KPIs, CA, Taux intercontrat<br/>Décide ouverture/fermeture de pôles"]
            DIR1["📋 Directeur de Projet Delivery<br/>Paul Manager<br/>────────────<br/>Supervise plusieurs pôles<br/>Arbitrage inter-équipes<br/>Relation grands comptes"]
        end

        subgraph DELIVERY["📌 Filière Delivery — orientée Client"]
            DM_BNP["🏦 Chef de Projet Delivery BNP<br/>Thomas Coord<br/>────────────<br/>Responsable relation client BNP<br/>Qualité des prestations<br/>Renouvellements, négociation TJM<br/>Même autorité qu'un Directeur<br/>mais scopée à son client"]
        end

        subgraph RECRUTEMENT["📌 Filière Recrutement — orientée Candidat"]
            
            subgraph POLE_JAVA["☕ Pôle Java/JEE"]
                RL_JAVA["👔 Responsable Recrutement Java<br/>Ahmed<br/>────────────<br/>Pilote le pôle Java au quotidien<br/>Distribue les missions<br/>Valide les candidats avant client"]

                REC_JAVA1["🎯 Recruteur 1<br/>────────────<br/>Process complet : sourcing<br/>→ entretien → proposition client<br/>→ suivi mission"]
                REC_JAVA2["🎯 Recruteur 2"]

                CR_JAVA["🔍 Chargé de Recrutement<br/>────────────<br/>Sourcing via outils externes :<br/>SmartRecruiters, LinkedIn Recruiter<br/>Indeed, APEC, Monster...<br/>Alimente le vivier du pôle<br/>Premier filtre des profils"]
            end

            subgraph POLE_DATA["📊 Pôle Data"]
                RL_DATA["👔 Responsable Recrutement Data<br/>Laura<br/>────────────<br/>Pilote le pôle Data<br/>Négocie TJM profils rares<br/>Autonomie élevée"]

                REC_DATA1["🎯 Recruteur Data"]
                CR_DATA["🔍 Chargé de Recrutement Data<br/>────────────<br/>Sourcing spécialisé Data<br/>LinkedIn, SmartRecruiters<br/>Alimente le vivier Data"]
            end
        end
    end

    subgraph CLIENTS["🏢 Clients"]
        direction LR
        BNP["BNP Paribas"]
        SG["Société Générale"]
        AXA["AXA"]
    end

    subgraph OUTILS["🔌 Outils de Sourcing Externes — Futures intégrations"]
        direction LR
        SR["SmartRecruiters"]
        LR["LinkedIn Recruiter"]
        IND["Indeed"]
        APEC["APEC"]
        WTTJ["Welcome to the Jungle"]
    end

    VP --> DIR1
    DIR1 --> DM_BNP
    DIR1 --> RL_JAVA
    DIR1 --> RL_DATA

    RL_JAVA --> REC_JAVA1
    RL_JAVA --> REC_JAVA2
    RL_JAVA --> CR_JAVA
    RL_DATA --> REC_DATA1
    RL_DATA --> CR_DATA

    DM_BNP -.->|"Responsable delivery"| BNP
    POLE_JAVA -.->|"Missions pour"| SG
    POLE_JAVA -.->|"Missions pour"| BNP
    POLE_DATA -.->|"Missions pour"| AXA
    POLE_DATA -.->|"Missions pour"| BNP

    CR_JAVA -.->|"Importe CVs qualifiés"| SR
    CR_JAVA -.->|"Importe CVs qualifiés"| LR
    CR_DATA -.->|"Importe CVs qualifiés"| SR
    CR_DATA -.->|"Importe CVs qualifiés"| IND
```

## Les deux filières d'une ESN

### Filière Delivery (orientée client)

| Rôle | Responsabilité | Dans le SaaS |
|------|---------------|-------------|
| **VP Staffing** | Stratégie globale, KPIs, ouverture/fermeture de pôles | Dashboard financier consolidé, métriques globales |
| **Directeur Delivery** | Supervise plusieurs pôles, arbitrage, grands comptes | Vue multi-pôles, rapports inter-équipes |
| **Chef de Projet Delivery** | Responsable relation client, qualité des prestations, renouvellements. Même autorité qu'un Directeur mais scopée à son/ses client(s) | Vue missions de son client, suivi placements, financier par client |

### Filière Recrutement (orientée candidat)

| Rôle | Responsabilité | Dans le SaaS |
|------|---------------|-------------|
| **Responsable Recrutement** | Pilote un pôle, distribue les missions, valide les candidats avant proposition client | Dashboard du pôle, vivier, pipeline, matching IA |
| **Recruteur** | Process complet bout en bout : qualification, entretiens, proposition client, suivi | Pipeline Kanban, matching IA, suivi candidatures |
| **Chargé de Recrutement** | Sourcing candidats via outils externes, alimentation du vivier, premier filtre | Upload CVs en masse, connexion outils sourcing, tags, vivier |

### Croisement des filières

Le Chef de Projet Delivery BNP (Thomas) et le Responsable Recrutement Java (Ahmed) travaillent ensemble : Thomas définit les besoins clients BNP, Ahmed fournit les candidats Java depuis son pôle. Quand BNP a besoin d'un profil Data, Thomas travaille avec le Pôle Data de Laura.

## Futures intégrations sourcing

Les Chargés de Recrutement utilisent des outils externes pour sourcer. Le SaaS doit à terme s'intégrer avec ces plateformes pour :

- **Import automatique** des CVs qualifiés par les chargés de recrutement
- **Sync bidirectionnel** des statuts candidats
- **Dédoublonnage** automatique (un même candidat sur plusieurs plateformes)
- **Traçabilité** de la source de chaque candidat

Plateformes ciblées pour intégration : SmartRecruiters, LinkedIn Recruiter, Indeed, APEC, Monster, Welcome to the Jungle.

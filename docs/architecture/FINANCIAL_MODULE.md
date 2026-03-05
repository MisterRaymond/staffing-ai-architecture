# Module Financier — Architecture

## Principe

Le module financier répond à une question simple : **"Combien me coûte ce consultant et combien il me rapporte ?"** Il ne fait pas de pointage, pas de CRA, pas de facturation. C'est une **vue stratégique** de la rentabilité.

L'utilisateur renseigne les paramètres financiers une seule fois à la création du placement. Le système calcule automatiquement les marges en daily rate. Les ajustements sont ponctuels (renégociation TJM, augmentation salariale).

## Trois modes de facturation

### 1. Régie (Time & Materials)

Le cas standard. Le client paie un TJM par jour de prestation.

```
Coût consultant (daily)     TJM client
      180€/j          →       550€/j
                  
                  Marge = 370€/j (67.3%)
```

### 2. Forfait (Fixed Price)

Le client achète un projet à prix fixe. Le daily rate est calculé en divisant le prix total par la durée estimée.

```
Coût consultant (daily)     Forfait ramené en daily
      180€/j          →     120 000€ / 240j = 500€/j

                  Marge = 320€/j (64.0%)
```

### 3. Sous-traitance en cascade

Il y a un intermédiaire entre l'ESN et le client final. Deux variantes :

**Offshore / filiale :**
```
Coût consultant Maroc    TJM interne (offshore→front)    TJM client final
      180€/j          →         350€/j               →       550€/j

Marge offshore: 170€/j     Marge front: 200€/j     Marge totale: 370€/j
```

**Intermédiaire externe :**
```
Coût consultant          TJM payé par Capgemini        TJM Capgemini→BNP
      280€/j          →         500€/j               →       650€/j

Marge ESN: 220€/j     Marge Capgemini: 150€/j     (pas notre problème)
```

## Configuration des taux — OrganizationRates + Presets

Chaque ESN configure ses taux par défaut. Une ESN avec des filiales peut avoir **plusieurs jeux de taux** (un par pays). Chaque jeu de taux inclut des **templates de lignes de coûts** qui sont automatiquement générées quand l'utilisateur sélectionne le preset.

### Preset France

| Ligne | Type de calcul | Montant | Fréquence | Catégorie |
|---|---|---|---|---|
| Salaire brut | `ASK_USER` | — (à saisir) | Mensuel | SALARY |
| Charges patronales | `PERCENTAGE_OF_SALARY` | 45% | Mensuel | EMPLOYER_CHARGES |
| Mutuelle employeur | `FIXED` | 80€ | Mensuel | BENEFITS |
| Prévoyance | `PERCENTAGE_OF_SALARY` | 1.5% | Mensuel | EMPLOYER_CHARGES |
| Taxe d'apprentissage | `PERCENTAGE_OF_SALARY` | 0.68% | Mensuel | EMPLOYER_CHARGES |
| Formation professionnelle | `PERCENTAGE_OF_SALARY` | 1% | Mensuel | EMPLOYER_CHARGES |
| Transport (Navigo 50%) | `FIXED` | 45€ | Mensuel | BENEFITS |
| Tickets restaurant | `FIXED` | 180€ | Mensuel | BENEFITS |
| Matériel informatique | `FIXED` | 1 800€ | Annuel | EQUIPMENT |
| Frais de gestion ESN | `PERCENTAGE_OF_SALARY` | 5% | Mensuel | MANAGEMENT_FEE |

### Preset Maroc

| Ligne | Type de calcul | Montant | Fréquence | Catégorie |
|---|---|---|---|---|
| Salaire brut | `ASK_USER` | — (à saisir en MAD) | Mensuel | SALARY |
| CNSS (charges patronales) | `PERCENTAGE_OF_SALARY` | 26.6% | Mensuel | EMPLOYER_CHARGES |
| AMO (assurance maladie) | `PERCENTAGE_OF_SALARY` | 4.11% | Mensuel | EMPLOYER_CHARGES |
| Mutuelle complémentaire | `FIXED` | 200 MAD | Mensuel | BENEFITS |
| Indemnité transport | `FIXED` | 500 MAD | Mensuel | BENEFITS |
| Prime panier | `FIXED` | 400 MAD | Mensuel | BENEFITS |
| Matériel informatique | `FIXED` | 12 000 MAD | Annuel | EQUIPMENT |
| Frais de gestion | `PERCENTAGE_OF_SALARY` | 3% | Mensuel | MANAGEMENT_FEE |

### Comment ça marche à l'utilisation

```
1. Le Delivery Manager crée la config financière du placement
2. Il sélectionne le preset "France" ou "Maroc"
3. Le système génère automatiquement toutes les lignes de coûts
4. Les lignes FIXED sont pré-remplies (80€ mutuelle, 45€ transport...)
5. Les lignes PERCENTAGE_OF_SALARY affichent "—" en attente du salaire
6. La ligne ASK_USER (salaire brut) est vide → l'utilisateur saisit
7. Dès que le salaire est saisi, les % sont calculés automatiquement :
   - Charges 45% de 3 500€ = 1 575€
   - Prévoyance 1.5% de 3 500€ = 52.50€
   - etc.
8. L'utilisateur peut ajouter/supprimer/modifier des lignes
9. Valider → les CostLines sont créées, les daily costs calculés
```

L'admin peut modifier les presets à tout moment (ex: la mutuelle passe de 80€ à 90€). Les placements existants ne sont pas affectés — seuls les futurs placements utiliseront les nouveaux montants.

## CostLine — Lignes de coûts libres

L'utilisateur ajoute autant de lignes de coûts qu'il veut. Chaque ligne a un montant et une fréquence. Le système ramène tout en **coût journalier** automatiquement.

### Exemple CDI France — Salaire 42 000€ brut/an

| Ligne | Montant | Fréquence | Catégorie | Daily cost |
|---|---|---|---|---|
| Salaire brut | 3 500€ | Mensuel | SALARY | 194.44€ |
| Charges patronales (45%) | 1 575€ | Mensuel | EMPLOYER_CHARGES | 87.50€ |
| Mutuelle employeur | 80€ | Mensuel | BENEFITS | 4.44€ |
| Prévoyance (1.5%) | 52.50€ | Mensuel | EMPLOYER_CHARGES | 2.92€ |
| Tickets restaurant | 180€ | Mensuel | BENEFITS | 10.00€ |
| Transport Navigo | 45€ | Mensuel | BENEFITS | 2.50€ |
| PC portable | 1 800€ | Annuel | EQUIPMENT | 8.26€ |
| Frais de gestion (5%) | calc. | — | MANAGEMENT_FEE | calc. |
| **Total daily cost** | | | | **~310€/j** |

Conversion : mensuel ÷ 18 jours, annuel ÷ 218 jours.

### Exemple Freelance

| Ligne | Montant | Fréquence | Catégorie | Daily cost |
|---|---|---|---|---|
| TJM achat freelance | 450€ | Journalier | SUBCONTRACTING | 450€ |
| Frais de gestion (5%) | calc. | — | MANAGEMENT_FEE | calc. |
| **Total daily cost** | | | | **~473€/j** |

### Exemple CDI Offshore Maroc

| Ligne | Montant | Fréquence | Catégorie | Daily cost |
|---|---|---|---|---|
| Salaire brut | 18 000 MAD | Mensuel | SALARY | 818 MAD |
| Charges (26.6%) | 4 788 MAD | Mensuel | EMPLOYER_CHARGES | 218 MAD |
| Mutuelle | 200 MAD | Mensuel | BENEFITS | 9 MAD |
| Transport | 500 MAD | Mensuel | BENEFITS | 23 MAD |
| **Total daily cost** | | | | **~1 068 MAD (~97€)** |

## Dashboard financier

### Vue par placement

```
Consultant : Jean Dupont (CDI)
Mission : Dev Java Senior — BNP Paribas
Type : Régie
──────────────────────────────────
TJM client       :    550€/j
Coût total       :    310€/j
──────────────────────────────────
Marge            :    240€/j
Taux de marge    :    43.6%
──────────────────────────────────
Détail des coûts :
  ├── Salaire         194€/j  ████████████████░░░░  62.7%
  ├── Charges          90€/j  ██████░░░░░░░░░░░░░░  29.2%
  ├── Avantages        17€/j  █░░░░░░░░░░░░░░░░░░░   5.5%
  └── Matériel          8€/j  ░░░░░░░░░░░░░░░░░░░░   2.6%
```

### Vue par pôle (agrégée)

```
Pôle Java/JEE — 8 consultants en mission
──────────────────────────────────
TJM vente moyen      :    580€/j
Coût moyen           :    340€/j
Marge moyenne        :    240€/j
Taux de marge moyen  :    41.4%
──────────────────────────────────
Consultant plus rentable  : Marie M. (52.1%)
Consultant moins rentable : Alex R. (28.3%)
```

### Vue par client (agrégée)

```
Client : BNP Paribas — 12 consultants
──────────────────────────────────
TJM vente moyen      :    560€/j
Marge moyenne        :    210€/j
Taux de marge moyen  :    37.5%
──────────────────────────────────
Mix : 8 régies, 2 forfaits, 2 sous-traitance
```

### Vue globale ESN

```
TechStaff Consulting — 45 consultants
──────────────────────────────────
Consultants en mission   :    38 (84.4%)
En intercontrat          :     7 (15.6%)
──────────────────────────────────
Marge moyenne            :    225€/j
Taux de marge moyen      :    39.2%
──────────────────────────────────
Pôle le + rentable       : Data (44.1%)
Pôle le - rentable       : Testing (31.2%)
Client le + rentable     : AXA (42.8%)
Client le - rentable     : SocGen (33.1%)
```

## Diagrammes associés

- [Diagramme de séquence financier](../diagrams/sequences/financial-calculation.md)

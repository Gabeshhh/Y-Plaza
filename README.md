# Y-Plaza — Plateforme Immobilière

Projet de fin d'année B2 Ynov — Plateforme de gestion et de vente de biens immobiliers pour le réseau Y-Plaza (1 siège à Aix-en-Provence + 12 agences en France).

---

## Présentation

Y-Plaza est une application web complète permettant de :

- Consulter et rechercher des biens immobiliers (appartements, maisons, villas, bureaux, locaux commerciaux, terrains)
- Gérer les transactions d'achat/vente avec suivi de statut
- Administrer les agences et les utilisateurs selon une matrice de rôles
- Analyser les données du marché immobilier (prix par ville, biens populaires, prévisions, zones attractives)

---

## Stack technique

| Couche | Technologie |
|---|---|
| Backend | Java 17 + Spring Boot 3.2 |
| Sécurité | Spring Security + JWT (stateless) |
| Base de données | PostgreSQL 15 |
| ORM | Spring Data JPA / Hibernate |
| Frontend | React 18 + Vite |
| Analyse de données | Python 3 (pandas, scikit-learn, matplotlib) |
| Conteneurisation | Docker + Docker Compose |

---

## Architecture

```
Y-Plaza/
├── backend/                    # API REST Spring Boot
│   └── src/main/java/com/yplaza/
│       ├── config/             # Spring Security, DataSeeder
│       ├── controller/         # Endpoints REST
│       ├── dto/                # Request / Response DTO
│       ├── entity/             # Entités JPA (User, Property, Agency, Transaction)
│       ├── exception/          # Gestion centralisée des erreurs
│       ├── repository/         # JPA Repositories + requêtes JPQL custom
│       ├── security/           # JWT Filter & Utils
│       └── service/            # Logique métier
├── frontend/                   # Application React
│   └── src/
│       ├── components/         # Navbar, Footer, PropertyCard, SearchBar
│       ├── context/            # AuthStore (Zustand)
│       ├── pages/              # Home, Properties, PropertyDetail, Dashboard, Analytics...
│       ├── services/           # Client API axios
│       └── styles/             # Design system global (CSS variables)
└── analytics/                  # Scripts Python d'analyse de données
    ├── analyse_yplaza.py
    ├── requirements.txt
    └── rapports/               # Graphiques et CSV générés
```

---

## Lancer le projet

### Prérequis

- Java 17+
- Node.js 18+
- Python 3.10+
- Docker + Docker Compose

### 1. Base de données (PostgreSQL via Docker)

```bash
docker-compose up -d
```

### 2. Backend (Spring Boot)

```bash
cd backend
./mvnw spring-boot:run
```

L'API démarre sur `http://localhost:8080`.

Au premier démarrage, le `DataSeeder` initialise automatiquement :
- 13 agences (1 siège + 12 régionales)
- 5 comptes de test (voir ci-dessous)
- 10 biens immobiliers de démonstration

### 3. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

L'application démarre sur `http://localhost:5173`.

### 4. Analyse Python (optionnel)

```bash
cd analytics
pip install -r requirements.txt
python3 analyse_yplaza.py
```

Les rapports (CSV + graphiques PNG) sont générés dans `analytics/rapports/`.

---

## Comptes de test

| Email | Mot de passe | Rôle |
|---|---|---|
| admin@yplaza.fr | Admin123! | Direction |
| it@yplaza.fr | Admin123! | IT Support |
| commercial@yplaza.fr | Admin123! | Commercial |
| emma.leroy@yplaza.fr | Admin123! | Commercial |
| client@yplaza.fr | Admin123! | Client |

---

## Fonctionnalités par rôle

| Fonctionnalité | Client | Commercial | Direction | IT |
|---|:---:|:---:|:---:|:---:|
| Consulter les biens | ✅ | ✅ | ✅ | ✅ |
| Créer / modifier un bien | ❌ | ✅ | ✅ | ✅ |
| Supprimer un bien | ❌ | ❌ | ✅ | ✅ |
| Créer une transaction | ✅ | ✅ | ✅ | ✅ |
| Accéder aux analytiques | ❌ | ❌ | ✅ | ✅ |
| Dashboard | ❌ | ✅ | ✅ | ✅ |

---

## API REST — Endpoints principaux

```
POST   /api/auth/register          Inscription
POST   /api/auth/login             Connexion (retourne un JWT)

GET    /api/properties             Liste des biens (filtres : ville, type, prix, surface)
GET    /api/properties/{id}        Détail d'un bien
POST   /api/properties             Créer un bien (COMMERCIAL+)
PUT    /api/properties/{id}        Modifier un bien (COMMERCIAL+)
DELETE /api/properties/{id}        Supprimer un bien (DIRECTION+)

GET    /api/agencies               Liste des agences
GET    /api/agencies/{id}          Détail d'une agence

GET    /api/transactions           Mes transactions
POST   /api/transactions           Créer une transaction

GET    /api/analytics/dashboard    KPIs globaux (DIRECTION/IT)
GET    /api/analytics/price-by-city Prix moyen par ville
GET    /api/analytics/price-by-type Prix moyen par type
GET    /api/analytics/top-properties Biens les plus consultés
```

---

## Analyse de données Python

Le script `analytics/analyse_yplaza.py` réalise 4 analyses :

1. **Rapport de ventes** — chiffre d'affaires total et par agence
2. **Biens populaires** — top 10 par vues, vues moyennes par type
3. **Prévisions de prix** — régression linéaire (surface × ville), détection d'opportunités d'achat sous-évaluées
4. **Zones attractives** — score multicritère (ventes + vues − prix/m²) pour identifier les meilleures zones d'investissement

Les données peuvent être fournies via des fichiers JSON exportés depuis l'API (`analytics/data/properties.json` et `analytics/data/transactions.json`). En leur absence, le script génère des données synthétiques pour la démonstration.

---

## Bonnes pratiques appliquées

- **SOLID** : Single Responsibility (entités séparées des services), Dependency Inversion (injection via interfaces)
- **DRY** : DTOs réutilisables, `ApiResponse<T>` générique, design system CSS centralisé
- **KISS** : architecture en couches standard (Controller → Service → Repository)
- **Sécurité** : authentification JWT stateless, hachage BCrypt, autorisation par rôles (`@PreAuthorize`)
- **Accessibilité** : attributs ARIA, `role`, `lang="fr"`, `sr-only`, `focus-visible`, `prefers-reduced-motion`
- **Responsive** : media queries 768px et 480px, CSS Grid `auto-fill`, menu mobile hamburger

---

## Modèle de données

```
Agency (1) ──── (N) User
Agency (1) ──── (N) Property
User    (1) ──── (N) Property  [commercial responsable]
Property (1) ── (N) Transaction
User    (1) ──── (N) Transaction [acheteur]
User    (1) ──── (N) Transaction [commercial]
```

---

## Auteur

Gabriel Laugier — B2 Développement Web & Mobile — Ynov Campus

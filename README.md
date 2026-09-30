# Inventaire

Système de gestion d'inventaire et de stocks. Projet fil rouge B2 Ynov Toulouse
(modules Python Backend & FastAPI et React.js & TypeScript), réalisé par Mathys,
Maxence, Baptiste et Axel.

- Ressources : utilisateurs, catégories, emplacements, fournisseurs, produits, stocks, commandes fournisseur et leurs lignes.
- Mouvements de stock (entrée, sortie, transfert) : jamais de stock négatif, quantités mises à jour dans la même transaction.
- Réapprovisionnement automatique : produits sous leur seuil, génération des commandes fournisseur.
- API externes : Open Food Facts (préremplissage d'un produit par code-barres) et API Adresse (géocodage d'un emplacement).
- Authentification JWT (`/auth/register`, `/auth/login`), rôles `operator` et `admin`. Les lectures sont publiques, toute écriture demande un jeton.

## Stack

- **Backend** : Python, FastAPI, Pydantic v2, SQLAlchemy 2, Alembic, PostgreSQL, pytest.
- **Frontend** : React, TypeScript, React Router, TailwindCSS, Vite, MSW, Vitest.

## Comment lancer le projet

### Base de données

```bash
docker compose up -d
```

### Backend

```bash
cd backend
cp .env.example .env
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/alembic upgrade head
.venv/bin/python -m scripts.seed
.venv/bin/uvicorn app.main:app --reload
```

Variables du `.env` : `DATABASE_URL`, `JWT_SECRET_KEY` (à remplacer par une valeur aléatoire),
`OPENFOODFACTS_BASE_URL` et `ADRESSE_BASE_URL`.

Le seed remplit une base vide avec des données de démo et crée le compte `admin@inventaire.fr` / `admin1234`.

- API : http://localhost:8000
- Swagger : http://localhost:8000/docs (bouton **Authorize** : email dans `username`, puis mot de passe)

Tests (SQLite en mémoire, API externes simulées, PostgreSQL non requis) :

```bash
cd backend
.venv/bin/python -m pytest
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Application : http://localhost:5173. Le front appelle l'API sur `http://localhost:8000`
(modifiable avec `VITE_API_BASE_URL`). Sans backend, sur les mocks MSW : `VITE_USE_MOCKS=true npm run dev`.

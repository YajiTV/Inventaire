# Inventaire

Système de gestion d'inventaire et de stocks.

## Stack

- Backend : Python, FastAPI, PostgreSQL
- Frontend : React, TypeScript, TailwindCSS

## How to run

### Backend

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn app.main:app --reload
```

API : http://localhost:8000 — documentation : http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Application : http://localhost:5173

## Contrat d'interface (openapi.json)

`openapi.json`, à la racine, est la référence partagée entre le back et le front :
le front en dérive ses types TypeScript et ses mocks.

Après toute modification d'un schéma Pydantic ou d'une route, le régénérer et le
commiter, depuis `backend/` :

```bash
.venv/bin/python -m scripts.export_openapi
```

`backend/tests/test_contract.py` échoue tant que le fichier commité n'est pas à jour.

Les routes déclarées sans implémentation renvoient `501`. Chaque responsable de
ressource remplace l'appel à `not_implemented()` par le code réel, sans changer la
signature de la route ni les schémas sans prévenir l'équipe.

## Migrations (Alembic)

Les modèles sont dans `backend/app/models/` et sont importés dans `backend/alembic/env.py` (via `import app.models`) pour qu'Alembic les détecte à l'autogénération. La connexion utilise `DATABASE_URL` (`backend/.env`), aucune URL en dur dans `alembic.ini`.

Commandes usuelles, depuis `backend/` :

```bash
# Créer une migration à partir des modèles SQLAlchemy modifiés
.venv/bin/alembic revision --autogenerate -m "description courte"

# Appliquer les migrations en attente
.venv/bin/alembic upgrade head

# Revenir en arrière d'une révision
.venv/bin/alembic downgrade -1

# Lister les révisions / têtes de branche
.venv/bin/alembic history
.venv/bin/alembic heads
```

### Règle d'équipe : une seule tête de migration

Deux branches qui ajoutent chacune une révision Alembic à partir du même parent créent **deux têtes** une fois mergées, ce qui casse `alembic upgrade head`. Pour l'éviter :

1. Avant de créer une migration, se mettre à jour (`git pull`) et lancer `.venv/bin/alembic upgrade head` pour partir d'une base à jour.
2. Avant de pousser/ouvrir une PR contenant une migration, vérifier `.venv/bin/alembic heads` — une seule ligne doit s'afficher.
3. Si un merge introduit malgré tout deux têtes, les résoudre avec :
   ```bash
   .venv/bin/alembic merge heads -m "merge heads"
   ```
4. `backend/tests/test_migrations.py` fait automatiquement cette vérification (`test_single_migration_head`) — la suite de tests échoue tant qu'il y a plus d'une tête, donc l'oubli est détecté avant la review.

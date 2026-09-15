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

## Avancement 

- ### Maxence
     création d'un CRUD fournisseur avec ses appels Api (provisoire, appel API crée a l'aide de claude pour quelque chose de propre et que je puisse comprendre), création du compte rendu et ajout sur le repo git.

- ### Mathys
    Mise en place du contexte d'authentification React (access token en mémoire, login/logout fonctionnels, refresh laissé pour Axel) ainsi que les mocks MSW sur les endpoints d'authentification du contrat d'interface, en s'appuyant sur les types générés depuis openapi.json  fait par Baptiste

- ### Baptiste
    Initialisation du monorepo et du front. Contrat d'interface figé : schémas Pydantic, 26 routes REST déclarées mais non implémentées, openapi.json exporté et testé. Fait principalement avec Claude Code, pour avoir une base propre sur laquelle travailler ensuite.

- ### Axel
    Création de toute la gestion de projet avec notion et SKILL claude (SKILL dispo dans docs sous le nom de SKILL.md)
    gestion des écheances et mise en relation des différentes étapes du groupe.

## Lien du notion Gestion de projet créer par Axel
    https://app.notion.com/p/ed6b4894b23a4d9d8d7cc3f49c06482a?v=a5ead5fd6a1e40a48ac5843ecd0435ca&source=copy_link

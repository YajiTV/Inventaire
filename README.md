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
    s'occupe du compte rendu, crée un hook custom useFournisseur, j'ai eu besoin de crée un type fournisseur et des appels API provisoire en utilisant claude pour avoir les explications et les commentaires pour une base propre pour crée mon hook en atendant la structure API fournie par le groupe.

- ### Mathys
     Initialitation du repo git, Protection des branches,

- ### Baptiste
    Initialisation du monorepo et du front. Contrat d'interface figé : schémas Pydantic, 26 routes REST déclarées mais non implémentées, openapi.json exporté et testé. Fait principalement avec Claude Code, pour avoir une base propre sur laquelle travailler ensuite.

- ### Axel
    Initialiser l'entièreter de la répartition des taches, s'occupe de la gestion de projet et des échéances, mise en lien des différentes structures. Le SKILL utiliser pour crée la gestion de projet est disponible dans le dossier docs : SKILL.MD

    ## Lien de la gestion de projet crée par Axel :
    https://app.notion.com/p/ed6b4894b23a4d9d8d7cc3f49c06482a?v=a5ead5fd6a1e40a48ac5843ecd0435ca&source=copy_link
    

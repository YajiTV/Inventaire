<div align="center">

# Inventaire

**Système de gestion d'inventaire et de stocks, construit en FastAPI & React**

[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.141-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docs.docker.com/compose/)

[Fonctionnalités](#fonctionnalités) • [Stack](#stack) • [Comment lancer le projet](#comment-lancer-le-projet) • [Avancement](#avancement-depuis-le-2109)

</div>

---

Projet fil rouge B2 Ynov Toulouse, évalué sur les modules Python Backend & FastAPI et React.js & TypeScript.

**Équipe** : Mathys (chef d'équipe), Maxence, Baptiste, Axel.

## Fonctionnalités

- Gestion des ressources métier : Utilisateurs, Catégories, Emplacements, Fournisseurs, Produits, Stocks, Commandes fournisseur, Lignes de commande
- Mouvements de stock et réapprovisionnement automatique (suggestions + génération de commande)
- Authentification JWT avec refresh token en cookie httpOnly et intercepteur 401 côté front
- Autorisation par rôle sur les routes sensibles (401/403)

## Stack

|              | Technologies                                                                   |
| ------------ | ------------------------------------------------------------------------------ |
| **Backend**  | Python, FastAPI, Pydantic v2, SQLAlchemy 2, Alembic, PostgreSQL, pytest, httpx |
| **Frontend** | React, TypeScript (strict), React Router, TailwindCSS, Vite, MSW, Vitest       |

Backend organisé en couches : `routers/`, `services/`, `repositories/`, schémas Pydantic dans `schemas/`.
Frontend organisé par domaine : `pages/`, `components/`, `hooks/`, `api/`, `types/`, `context/`.

## Structure du dépôt

```
Inventaire/
├── backend/          API FastAPI (routers, services, repositories, models, schemas)
├── frontend/         Application React (pages, components, hooks, api, types)
└── docker-compose.yml
```

## Comment lancer le projet

### Base de données

Un `docker-compose.yml` est fourni à la racine pour lancer PostgreSQL :

```bash
docker compose up -d
```

### Backend

```bash
cd backend
cp .env.example .env
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn app.main:app --reload
```

Avec fish + Lancement docker

````
docker compose up -d

cd backend
source .venv/bin/activate.fish
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload


API : http://localhost:8000
Documentation : http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
````

Application : http://localhost:5173

## Avancement depuis le 21/09

- ### Maxence

    22/09 : correction du responsive (marges adaptées aux petits écrans) sur le Layout, l'accueil, Produits, Détail produit et Fournisseurs.
    22/09 : titres des pages Produits et Fournisseurs alignés sur le style des autres pages et traduction de "Home" en "Accueil" dans la navbar.
    Blocages : marges trop grandes sur mobile qui cassaient la mise en page des tableaux.

- ### Mathys

    22/09 : ajout du mode sombre avec un bouton de bascule et un thème conservé après rafraîchissement.
    22/09 : adaptation de toutes les pages au mode sombre, y compris les initiales de la page Profil.
    22/09 : mise à jour du README.
    Blocages : couleurs codées en dur dans chaque page, à reprendre une par une pour le mode sombre.

- ### Baptiste

    22/09 : correction des avertissements oxlint sur le contexte d'authentification.
    22/09 : alignement des tableaux Produits et Fournisseurs sur la mise en page commune.
    22/09 : nouvelle page d'accueil avec tableau de bord et header refait (menu responsive, avatar, icône de thème).
    22/09 : suppression de react-query inutilisé et passage des Produits sur les types API partagés.
    22/09 : création de hooks génériques (useFetch, useCrudList, useActionFeedback) pour supprimer la duplication dans les hooks de données.
    22/09 : partage des composants de formulaire et de tableau (ErrorList, SelectField) entre les pages et ajout d'une page 404.
    22/09 : affichage des noms à la place des identifiants sur Mouvements, Commandes et Réapprovisionnement.
    Blocages : logique de chargement et d'erreur recopiée dans chaque hook, réglée par les hooks génériques.

- ### Axel

    22/09 : écran Emplacements (liste, création, modification, suppression avec confirmation) et ajout dans la navigation.
    Blocages : aucun.

## Lien du notion Gestion de projet créer par Axel

    https://app.notion.com/p/ed6b4894b23a4d9d8d7cc3f49c06482a?v=a5ead5fd6a1e40a48ac5843ecd0435ca&source=copy_link

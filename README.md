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

## Avancement actuel

- ### Maxence

    Création de la partie Produits sur le meme schéma que fournisseur, mise en place du responsive sur produit et fournisseur et un peu de style pour l’ergonomie.

- ### Mathys

    Ralisation de tous les handlers Mocks MSW complétés.
    Contexte d'authentification fini : refresh + intercepteur 401 + routes protégées.
    Formulaire d'inscription (pseudo/email/password) ajouté avec validation du mot de passe confirmé.
    La home page est rendue publique, tout le reste est protégé ; mock d'auth corrigé pour ne plus connecter tout le monde par défaut ("Demo User"), je l'avais utiliser uniquement pour faire des tests.

- ### Baptiste

    Remplacement des types générés automatiquement par des types écrits à la main dans types/api.ts pour mieux apprendre les types et TS etc...
    Implémentation de la logique des mouvements de stock et création des composants React associés
    Création des écrans Stocks, Mouvements et Nouveau mouvement, branchés à l'API

- ### Axel

    Création du modele user et implémentation du service de hachage argon2id
    Migrationde la bdd pour la table Utilisateurs
    Tests mis en place pour la partie auth/password

## Lien du notion Gestion de projet créer par Axel

    https://app.notion.com/p/ed6b4894b23a4d9d8d7cc3f49c06482a?v=a5ead5fd6a1e40a48ac5843ecd0435ca&source=copy_link

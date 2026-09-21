# Inventaire

Système de gestion d'inventaire et de stocks.

## Stack

- Backend : Python, FastAPI, PostgreSQL
- Frontend : React, TypeScript, TailwindCSS

## How to run

### Backend

```bash
cd backend
cp .env.example .env
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

## Avancement depuis le 16/09 (12h30)

- ### Maxence

    18/09 : création des composants partagés DataTable, FormField et StatusMessage.
    18/09 : refonte des pages Produits et Fournisseurs sur ces composants partagés pour supprimer la duplication.
    18/09 : validation du SKU côté formulaire avec message de format explicite.
    21/09 : ajout des filtres, de la pagination et de la page de détail d'un produit.
    21/09 : passage de la taille de page par défaut de 5 à 10 produits.
    Blocages : duplication de code entre Produits et Fournisseurs, réglée en extrayant les composants partagés.

- ### Mathys

    16/09 : validation de la confirmation du mot de passe avant création du compte.
    17/09 : mise en place du layout partagé et de la navbar pour les pages protégées.
    17/09 : style et boutons de la page Login.
    18/09 : persistance de l'état des mocks et de la session dans le localStorage pour survivre au rafraîchissement.
    18/09 : restyle du formulaire d'inscription en Tailwind, correction des champs password et ajout du bouton afficher/masquer.
    18/09 : côté back, authentification JWT login/refresh/logout avec cookie httpOnly.
    18/09 : scaffold de la couche repositories puis CRUD complets Catégories, Emplacements et Utilisateurs (modèles, services, routers, migrations, tests).
    19/09 : intégration de la page d'accueil dans le layout commun.
    21/09 : transformation de la home en tableau de bord avec des cartes KPI (composant DashboardCard).
    Blocages : perte de la session au rafraîchissement (réglée via localStorage) et champs password mal typés sur l'inscription.

- ### Baptiste

    18/09 : création d'un seed de démo partagé pour les handlers MSW et du parcours de démo associé.
    18/09 : écrans Commandes (liste et détail), traduction des statuts et branchement des routes.
    18/09 : refonte de la page Stocks avec les noms de produits, les filtres et les totaux.
    18/09 : validation client et affichage des erreurs API sur le formulaire Fournisseurs.
    18/09 : côté back, nettoyage des dépendances de hachage, correction d'un hash illisible et régénération de openapi.json.
    19/09 : harmonisation des pages Mouvements, Commandes, Détail commande et Nouveau mouvement sur la mise en page de Stocks, avec états vides.
    21/09 : harmonisation des pages Login, Inscription, Catégories, Utilisateurs et Réapprovisionnement sur la même base de style.
    21/09 : affichage des noms de produits à la place des identifiants sur la page Mouvements.
    21/09 : refonte de la page Profil en carte centrée.
    Blocages : styles incohérents entre les pages, d'où le gros travail d'harmonisation, et ids affichés à la place des noms de produits.

- ### Axel

    17/09 : écran Catégories (liste, formulaire, suppression avec confirmation).
    18/09 : écran Réapprovisionnement (vue des suggestions et génération de commande).
    18/09 : écran Utilisateurs (liste, création, édition).
    20/09 et 21/09 : page Profil (consultation des informations, modification du nom complet, déconnexion).
    21/09 : correction des imports et du nommage sur les routes utilisateurs.
    21/09 : autorisation par rôle sur les routes utilisateurs (401/403).
    Blocages : imports manquants et nommage incohérent sur les routes utilisateurs, plus la gestion des cas 401/403 côté écran.

## Lien du notion Gestion de projet créer par Axel

    https://app.notion.com/p/ed6b4894b23a4d9d8d7cc3f49c06482a?v=a5ead5fd6a1e40a48ac5843ecd0435ca&source=copy_link

# Scenario de demonstration

Front React branche sur les mocks MSW (`frontend/src/api/mocks/seed.ts`).
Aucun backend a demarrer : `cd frontend && npm run dev`.

## Compte de connexion

| Email | Mot de passe | Role |
|-------|--------------|------|
| `admin@inventaire.fr` | n'importe lequel | admin |

Le mock d'authentification ne verifie que l'email. Un email inconnu renvoie 401,
ce qui permet de montrer le cas d'erreur de la page de connexion.

## Donnees de demonstration

4 categories, 4 fournisseurs, 3 emplacements (Congelateur, Cuisine, Reserve seche),
6 produits, 10 lignes de stock, 6 mouvements et 2 commandes fournisseur.

Deux produits sont sous leur seuil de reapprovisionnement, c'est le coeur de la demo F2 :

| Produit | Quantite | Seuil |
|---------|----------|-------|
| Steak hache 45g | 120 | 300 |
| Sirop cola 10L | 5 | 12 |

Les donnees des mocks sont sauvegardees dans le localStorage : un rafraichissement de page
conserve la session, les modifications et le theme. C'est la preuve du critere persistance,
a montrer pendant la demo.

Avant chaque repetition, repartir du jeu de depart : `resetMockData()` dans la console du
navigateur, puis F5.

## Parcours

| # | Ecran | Route | Presente par | Points a montrer |
|---|-------|-------|--------------|------------------|
| 1 | Accueil | `/` | Mathys | Pitch du projet, navigation, redirection vers la connexion |
| 2 | Connexion | `/login` | Axel | Email inconnu -> erreur, puis `admin@inventaire.fr` -> acces aux pages protegees |
| 3 | Stocks | `/stocks` | Baptiste | Repartition par emplacement, Steak hache et Sirop cola sous le seuil |
| 4 | Nouveau mouvement | `/movements/new` | Baptiste | Transfert de 30 steaks du Congelateur vers la Cuisine (entree, sortie, transfert) |
| 5 | Mouvements | `/movements` | Baptiste | Le transfert saisi apparait en tete de l'historique |
| 6 | Produits | `/products` | Max | Liste, creation et edition inline d'un produit |
| 7 | Fournisseurs | `/suppliers` | Max | Liste des 4 fournisseurs, lien avec les produits |
| 8 | Detail produit | `/products/:id` | Max | Nom de categorie et de fournisseur au lieu des identifiants |
| 9 | Categories | `/categories` | Axel | Ajout, edition inline, suppression avec confirmation |
| 10 | Emplacements | `/locations` | Axel | Ajout d'un emplacement, qui apparait ensuite dans les formulaires de mouvement |
| 11 | Reapprovisionnement | `/replenishment` | Axel | Choix de l'emplacement puis generation d'une commande pour Steak hache et Sirop cola |
| 12 | Commandes | `/orders` | Baptiste | La commande generee apparait, detail avec fournisseur, livraison et lignes |
| 13 | Utilisateurs | `/users` | Axel | Creation d'un operateur, changement de role |
| 14 | Profil | `/profile` | Axel | Modification du nom complet, deconnexion |
| 15 | Persistance | toutes | Mathys | F5 sur une page modifiee : session, donnees et theme sont conserves |

Cas d'erreur a montrer : formulaire vide ou mal rempli (messages sous les champs), sortie de
stock superieure a la quantite disponible (erreur 409 affichee), adresse inconnue (page 404).

## Hors perimetre

La demo tourne uniquement sur les mocks MSW (`npm run dev`). Le build de production
appelle la vraie API et n'est pas utilise pour la demo.

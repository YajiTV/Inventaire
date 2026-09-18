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

Les mocks sont en memoire : un rafraichissement de page remet le jeu de donnees a zero.
A ne pas faire pendant la demo.

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

## Ecrans non couverts

Reapprovisionnement, Commandes, Categories, Emplacements, Utilisateurs et Profil
n'ont pas encore de page. Les handlers MSW existent : a integrer au parcours des
que les ecrans sont livres.

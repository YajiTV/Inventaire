---
/name: notion-project-manager
name: docs
description: Créer ET maintenir une gestion de projet complète sur Notion avec architecture multi-conversations Claude. Deux modes. MODE CRÉATION : déclencher quand l'utilisateur veut démarrer un nouveau projet scolaire (TP, exercice de cours, projet académique) ou un nouveau projet professionnel (développement, client, SaaS, recherche), mettre en place une organisation de projet, ou générer des instructions pour un projet Claude. Même un simple "je commence un nouveau projet scolaire", "nouveau projet pro" ou "aide-moi à organiser ce projet" déclenche ce mode. MODE SUIVI : déclencher quand l'utilisateur veut mettre à jour l'avancement d'un projet existant créé avec ce skill, marquer des tâches comme faites/en cours/bloquées, faire un point d'avancement, ajouter ou rééchelonner des tâches, ou demander "où en est mon projet ?". Des phrases comme "mets à jour l'avancement", "j'ai fini la tâche X", "fais le point sur le projet" déclenchent ce mode.
---

# Notion Project Manager

Skill permettant de créer puis de maintenir une structure complète de gestion de projet sur Notion, avec génération d'instructions optimisées pour un projet Claude et architecture conversationnelle adaptée.

## Sélection du mode (première étape obligatoire)

Avant toute chose, déterminer dans quel mode on opère :

- **MODE CRÉATION** : l'utilisateur démarre un nouveau projet (scolaire ou professionnel). Aucune page Notion de projet n'existe encore. Suivre les Phases 1 à 5 ci-dessous.
- **MODE SUIVI** : l'utilisateur a déjà un projet créé par ce skill et veut faire évoluer son avancement (marquer des tâches, faire le point, ajouter/rééchelonner des tâches). Aller directement à la section "Mode Suivi : maintenance de l'avancement".

Si le mode n'est pas évident d'après la demande, poser une seule question : "Tu démarres un nouveau projet, ou tu veux mettre à jour un projet existant ?"

## Nature du projet : scolaire ou professionnel

Dès le mode Création, identifier la **nature** du projet, car elle conditionne tout le reste :

- **Scolaire** : TP, exercice de cours, projet académique, rendu noté. Implique établissement, cours/module, format de rendu, parfois travail en équipe imposé.
- **Professionnel** : projet de développement, mission client, SaaS, outil interne, recherche appliquée. Implique éventuellement un client, des contraintes de production, un déploiement.

La nature est demandée explicitement en Phase 1 (Bloc 1) et oriente les questions conditionnelles, les phases suggérées et les propriétés de la base de données.

## Vue d'ensemble du workflow (Mode Création)

Ce mode suit un processus en 5 phases strictement séquentielles :

1. **Questionnaire détaillé** : Collecte exhaustive des informations projet
2. **Validation** : Récapitulatif complet avec confirmation explicite avant génération
3. **Génération Notion** : Création de la page et de la base de données avec tâches
4. **Génération fichiers** : Production des fichiers markdown (instructions, prompts, décisions, rapport)
5. **Sortie finale** : Présentation des liens et fichiers générés

**RÈGLE CRITIQUE** : Ne JAMAIS créer quoi que ce soit sur Notion avant la validation explicite de l'utilisateur à la Phase 2.

## Phase 1 : Questionnaire détaillé

### Approche du questionnaire

- Poser TOUTES les questions essentielles avant de continuer
- Regrouper les questions par thèmes (Contexte, Équipe, Planning, Méthodologie, Options)
- Ne pas demander de lien Notion à cette étape - il sera demandé juste avant la génération
- Être exhaustif mais structuré - pas de questions une par une

### Questions essentielles (toujours posées)

**Bloc 1 - Contexte du projet**
1. Quel est le sujet du projet ? (description détaillée en 2-3 phrases minimum)
2. Nature du projet :
   - Scolaire (TP, exercice de cours, projet académique, rendu noté)
   - Professionnel (développement, mission client, SaaS, outil interne, recherche appliquée)
3. Sous-type :
   - Si Scolaire : TP technique / Projet de fin de module / Mémoire-recherche / Autre
   - Si Professionnel : Développement logiciel / Mission client / Produit SaaS / Recherche / Autre
4. Livrables attendus ? (ex: PDF, Code, Présentation, Application, etc.)
5. Contraintes spécifiques ? (technologies imposées, outils requis, plateforme cible, etc.)

**Bloc 2 - Organisation et équipe**
5. Mode de travail :
   - Solo
   - Binôme
   - Équipe 3-5 personnes
   - Équipe 6+ personnes
6. Si équipe : Pour chaque participant, fournir Prénom + Rôle (ex: "Axel - Backend", "Joan - Frontend")
7. Si équipe : Répartition des responsabilités souhaitée ? (qui fait quoi en grandes lignes)

**Bloc 3 - Planning**
8. Deadline absolue ? (date et heure si critique)
9. Durée totale estimée du projet ?

**Bloc 4 - Méthodologie**
10. Méthodologie de gestion préférée :
    - Phases séquentielles (ex: Phase 1 - Setup, Phase 2 - Dev, etc.)
    - Sprints Agile (développement itératif)
    - Kanban (flux continu)
    - Autre (préciser)
11. Niveau de granularité des tâches souhaité :
    - Macro : Tâches principales de haut niveau (ex: "Implémenter l'authentification")
    - Détaillé : Tâches granulaires et précises (ex: "Créer le formulaire de login", "Valider les credentials", "Gérer les sessions")
    - Mixte : Tâches macro avec sous-tâches détaillées

**Bloc 5 - Questions conditionnelles**

Si Nature = "Professionnel" et sous-type implique du code (Développement logiciel, Mission client, SaaS) :
- Langages de programmation ?
- Frameworks / Bibliothèques ?
- Architecture envisagée ? (MVC, microservices, monolithique, etc.)
- Y a-t-il un client / commanditaire ? (oui/non, et qui)
- Cible de déploiement ? (VPS, cloud, on-premise, store, etc.)

Si Nature = "Scolaire" :
- Établissement ?
- Cours / Module / Matière ?
- Format de rendu noté ? (dépôt Git, PDF, soutenance, démo live, etc.)
- Date de soutenance / rendu (si différente de la deadline) ?

Si Méthodologie = "Sprints Agile" :
- Durée de sprint souhaitée ? (1 semaine, 2 semaines, etc.)
- Besoin de générer des User Stories ? (oui/non)

**Bloc 6 - Options**

12. Voulez-vous inclure des sections de métriques et tableaux de suivi (Avancement global, Planning journalier) ? (oui/non)
13. Voulez-vous inclure une section "Risques identifiés" ? (oui/non)
14. Voulez-vous générer un prompt pré-formaté pour utiliser avec le skill de prompt engineering ? (oui/non)

### Après le questionnaire

Une fois toutes les réponses collectées, passer immédiatement à la Phase 2 (Validation).

## Phase 2 : Validation avant génération

**IMPÉRATIF** : Afficher un récapitulatif complet et obtenir une confirmation explicite AVANT toute création sur Notion.

### Structure du récapitulatif

```markdown
# RÉCAPITULATIF - Validation avant génération

## Informations collectées

### Projet
- Sujet : [description]
- Type : [type]
- Livrables : [liste]
- Contraintes : [liste]

### Organisation
- Mode : [Solo/Binôme/Équipe]
- Participants : [liste avec rôles]
- Répartition : [résumé]

### Planning
- Deadline : [date]
- Durée : [durée]

### Méthodologie
- Approche : [Phases/Sprints/Kanban]
- Granularité : [Macro/Détaillé/Mixte]
- [Infos spécifiques Agile si applicable]

### Options activées
- Métriques : [oui/non]
- Risques : [oui/non]
- Prompt engineering : [oui/non]

## Structure Notion qui sera créée

### Page principale
Sections :
1. Contexte du projet (tableau récapitulatif)
2. [Avancement global] - si option activée
3. [Planning / Phases du projet]
4. Base de données "Suivi des tâches"
5. [Risques identifiés] - si option activée
6. Livrables
7. Liens utiles / Ressources

### Base de données "Suivi des tâches"

Propriétés essentielles :
- Nom de la tâche (title)
- Statut (select: À faire, En cours, Bloqué, Terminé)
- Priorité (select: Haute, Moyenne, Basse)
- [Phase / Sprint] (select, adapté à la méthodologie)
- Description (text)
- Date d'échéance (date)

Propriétés conditionnelles :
[Liste des propriétés qui seront créées selon le contexte]

### Tâches générées

Nombre estimé de tâches : [X tâches]
Structure hiérarchique : [X tâches parents, Y sous-tâches]
Organisation : [par phases/sprints]

## Architecture conversationnelle Claude

Conversations suggérées : [X conversations]

[Liste des conversations avec leur objectif]

Modèles recommandés :
- [Conversation 1] : [Sonnet 4.6 / Opus 4.8] - [justification courte]
- [Conversation 2] : [Sonnet 4.6 / Opus 4.8] - [justification courte]
- ...

## Fichiers qui seront générés

1. instructions-projet.md (Instructions complètes pour le projet Claude)
2. prompts-conversations.md (Prompts optimisés pour chaque conversation)
3. decisions-questionnaire.md (Traçabilité des réponses)
4. rapport-creation.md (Lien Notion + résumé de la structure)
[5. prompt-pour-skill-prompt-engineering.md] - si option activée

---

Voulez-vous procéder à la génération ? (répondre "oui" pour confirmer)
```

**Attendre la confirmation explicite** avant de passer à la Phase 3.

Si l'utilisateur veut modifier quelque chose, revenir aux questions concernées et redemander validation.

## Phase 3 : Génération Notion

### Demande du lien Notion

Une fois la validation obtenue, demander :
"Veuillez fournir le lien vers la page Notion vierge où créer le projet."

Vérifier que le lien est bien un lien Notion valide.

### Étape 3.1 : Création de la page principale

Utiliser `Notion:notion-fetch` pour vérifier que la page existe et est accessible.

Puis utiliser `Notion:notion-update-page` avec `command: "replace_content"` pour créer la structure complète.

**Contenu de la page principale** :

```markdown
# [Nom du projet] - Gestion de Projet

> Date de début : [date actuelle]
> Deadline : [deadline fournie]
> Durée : [durée]
> Équipe : [liste participants ou "Solo"]
> Méthodologie : [méthodologie choisie]

---

## Contexte du projet

[Tableau avec les informations clés]

| Champ | Valeur |
|-------|--------|
| Projet | [description] |
| Type | [type] |
| Livrables | [liste] |
| Contraintes | [liste contraintes] |
| Mode de travail | [Solo/Binôme/Équipe] |
[Si académique : | Établissement | [établissement] |]
[Si académique : | Cours | [cours] |]

---

[Toujours créé (le Mode Suivi en dépend) — version enrichie si option métriques activée :]
## Avancement global

Tâches terminées : 0 / [total] — 0 % — [Statut initial]

[Si option métriques activée, ajouter ici le tableau de répartition par phase/sprint et le planning journalier]

---

[Toujours :]
## [Phases du projet / Planning des sprints / Workflow]

[Génération de la structure selon méthodologie choisie]

---

[Toujours :]
## Suivi des tâches

[Emplacement de la base de données - sera créée après]

---

[Si option risques activée :]
## Risques identifiés

| Niveau | Risque | Mitigation |
|--------|--------|------------|
| [À remplir selon analyse du projet] |

---

[Toujours :]
## Livrables

| Livrable | État |
|----------|------|
[Liste des livrables avec état initial "À faire"]

---

[Toujours :]
## Liens utiles / Ressources

[Section pour que l'utilisateur ajoute ses liens - avec quelques exemples pertinents selon le type de projet]
```

### Étape 3.2 : Création de la base de données

Utiliser `Notion:notion-create-database` pour créer la base "Suivi des tâches".

**Schéma de base (toujours présent)** :

```sql
CREATE TABLE (
  "Nom de la tâche" TITLE,
  "Statut" SELECT('À faire':gray, 'En cours':blue, 'Bloqué':red, 'Terminé':green),
  "Priorité" SELECT('Haute':red, 'Moyenne':yellow, 'Basse':gray),
  "[Phase/Sprint]" SELECT([liste adaptée]),
  "Description" RICH_TEXT,
  "Date d'échéance" DATE
)
```

**Propriétés conditionnelles** (ajouter selon contexte) :

- Si équipe : `"Assigné" SELECT([liste prénoms participants])`
- Si développement : `"Type de tâche" MULTI_SELECT('Feature':green, 'Bug':red, 'Setup':gray, 'Documentation':blue, 'Polish':pink)`
- Si architecture multi-conv : `"Conversation Claude" SELECT([liste conversations])`
- Si Agile avec User Stories : `"User Story" RICH_TEXT`
- Si Agile : `"Estimation" NUMBER`
- Toujours : `"Niveau d'effort" SELECT('Faible':green, 'Moyen':yellow, 'Élevé':red)`
- Si granularité Mixte/Détaillé : `"Sous-tâches" RICH_TEXT`

**Relations parent/enfant** (toujours créées) :

Utiliser `Notion:notion-update-data-source` pour ajouter les relations self-reference :

```sql
ADD COLUMN "Parent" RELATION('[data_source_id]', DUAL 'Enfants' 'enfants');
ADD COLUMN "Enfants" RELATION('[data_source_id]', DUAL 'Parent' 'parent')
```

### Étape 3.3 : Génération des tâches

Analyser le projet et décomposer en tâches selon :
- Type de projet
- Méthodologie choisie
- Niveau de granularité
- Contraintes techniques

**Logique de génération** :

1. Identifier les grandes phases/composants du projet
2. Pour chaque phase, créer les tâches principales (parents)
3. Si granularité = Détaillé ou Mixte : créer les sous-tâches (enfants)
4. Attribuer automatiquement :
   - Phases/Sprints
   - Priorités (selon dépendances critiques)
   - Ordre logique
   - Propriété "Sous-tâches" (texte descriptif)

**Structure hiérarchique** :

- Tâches parents : pages avec relations vers enfants
- Tâches enfants : pages avec relation vers parent
- Propriété "Sous-tâches" : description textuelle des sous-étapes

Utiliser `Notion:notion-create-pages` pour créer toutes les tâches en un seul appel (jusqu'à 100 pages max).

### Étape 3.4 : Mise à jour de la page principale

Utiliser `Notion:notion-update-page` pour insérer la base de données créée dans la section "Suivi des tâches" :

```markdown
<database url="[url-de-la-database]" inline="true">Suivi des tâches</database>
```

## Phase 4 : Génération des fichiers

Tous les fichiers sont créés dans `/home/claude/` (working directory).

### Fichier 1 : instructions-projet.md

```markdown
# Instructions Projet [Nom du projet]

## Contexte et objectifs

**Projet** : [description complète]

**Objectifs** :
- [Liste des objectifs principaux déduits du projet]

**Livrables** :
- [Liste des livrables attendus]

**Deadline** : [date]

**Contraintes** :
- [Liste des contraintes techniques/organisationnelles]

---

## Structure de travail

**Lien Notion** : [URL de la page créée]

**Base de données** : [URL de la database]

**Architecture conversationnelle** : Voir fichier `prompts-conversations.md`

**Méthodologie** : [Phases séquentielles / Sprints Agile / Kanban]
[Si Agile : Durée de sprint : [X] jours]

**Organisation** :
[Si Solo : Travail en autonomie]
[Si Équipe : Liste des participants et leurs rôles]

---

## Directives spécifiques au domaine

[Si Développement :]
**Technologies** :
- Langages : [liste]
- Frameworks : [liste]
- Architecture : [architecture choisie]

**Conventions de code** :
[Suggestions de conventions selon les technologies]

[Si Académique :]
**Contexte académique** :
- Établissement : [établissement]
- Cours : [cours]

**Format de rendu** :
- [Description du format attendu selon les livrables]

[Général :]
**Bonnes pratiques** :
[Suggestions de bonnes pratiques selon le type de projet]

---

## Protocole de mise à jour Notion

**RÈGLES STRICTES** :

1. **Toujours** utiliser `Notion:notion-fetch` avant toute modification pour obtenir l'état actuel
2. **Ne jamais** modifier une page sans validation explicite de l'utilisateur
3. **Mettre à jour** le statut des tâches après chaque session de travail
4. **Documenter** les décisions importantes dans les propriétés "Notes" ou "Description"

**Workflow de mise à jour** :
1. Fetch de la page/database concernée
2. Présentation des modifications proposées à l'utilisateur
3. Attente de confirmation explicite
4. Exécution de la mise à jour
5. Vérification du résultat

---

## Récapitulatif des décisions

[Copie du contenu de decisions-questionnaire.md ici]

---

## Références

**Page principale projet** : [URL Notion page]

**Base de données tâches** : [URL Notion database]

**Fichiers générés** :
- `instructions-projet.md` (ce fichier)
- `prompts-conversations.md` (architecture conversationnelle)
- `decisions-questionnaire.md` (traçabilité complète)
- `rapport-creation.md` (résumé de la création)
[Si option activée : - `prompt-pour-skill-prompt-engineering.md`]
```

### Fichier 2 : prompts-conversations.md

**Logique de génération des conversations** :

Nombre de conversations basé sur la complexité :
- Projet simple (1 phase, <10 tâches) : 3 conversations
- Projet moyen (2-3 phases, 10-20 tâches) : 5 conversations
- Projet complexe (4+ phases, 20+ tâches) : 7+ conversations

Structure type :
- Conv. 1 : Scoping et planification (toujours)
- Conv. 2-N : Conversations spécialisées par phase/domaine technique
- Conv. N+1 : Intégration et tests (si développement)
- Conv. finale : Rédaction/Documentation finale (toujours)

**Contenu du fichier** :

```markdown
# Architecture Conversationnelle - [Nom du projet]

## Vue d'ensemble

Ce projet Claude est structuré en [X] conversations spécialisées, chacune dédiée à un aspect spécifique du projet.

**Principe** : Chaque conversation a un périmètre clairement défini. Utiliser la conversation appropriée selon la tâche en cours.

---

## Conversation 1 : [Titre]

**Objectif** : [Description de l'objectif]

**Périmètre** :
- [Liste des tâches/domaines couverts]

**Modèle recommandé** : [Claude Haiku 4.5 / Claude Sonnet 4.6 / Claude Opus 4.8]

**Justification** : [1 phrase expliquant pourquoi ce modèle]

**Prompt initial** :

```
[Prompt optimisé pour le modèle et adapté au périmètre]

Tu es un expert en [domaine spécifique].

Contexte projet :
- Nom : [nom projet]
- Objectif : [objectif]
- Technologies : [si applicable]
- Lien Notion : [URL]

Ton rôle dans cette conversation :
[Description précise du rôle]

Périmètre de cette conversation :
[Liste claire de ce qui est IN et OUT of scope]

Instructions spécifiques :
- [Instruction 1]
- [Instruction 2]
- Toujours utiliser Notion:notion-fetch avant toute modification
- Ne jamais modifier Notion sans validation explicite

Commence par [action initiale suggérée].
```

---

[Répéter pour chaque conversation avec des prompts différents et adaptés]

---

## Guide d'utilisation

**Comment choisir la conversation** :

| Si tu dois... | Utilise... |
|---------------|------------|
| [Tâche type 1] | Conversation [X] |
| [Tâche type 2] | Conversation [Y] |
| [Tâche type 3] | Conversation [Z] |

**Bonnes pratiques** :
- Ne pas mélanger les périmètres entre conversations
- Documenter les décisions importantes dans Notion
- Faire un point de synchronisation entre conversations si nécessaire
```

### Fichier 3 : decisions-questionnaire.md

```markdown
# Récapitulatif des Décisions - [Nom du projet]

Date de création : [date et heure]

---

## Réponses au questionnaire

### Bloc 1 - Contexte du projet

**Sujet du projet** :
[Réponse complète]

**Type de projet** : [réponse]

**Livrables attendus** :
[Liste]

**Contraintes spécifiques** :
[Liste ou "Aucune"]

---

### Bloc 2 - Organisation et équipe

**Mode de travail** : [Solo/Binôme/Équipe]

[Si équipe :]
**Participants** :
[Liste détaillée avec rôles]

**Répartition des responsabilités** :
[Description]

---

### Bloc 3 - Planning

**Deadline absolue** : [date et heure]

**Durée totale estimée** : [durée]

---

### Bloc 4 - Méthodologie

**Méthodologie de gestion** : [Phases/Sprints/Kanban]

**Niveau de granularité** : [Macro/Détaillé/Mixte]

[Si Agile :]
**Durée de sprint** : [durée]
**User Stories** : [oui/non]

---

### Bloc 5 - Informations contextuelles

[Si Développement :]
**Langages** : [liste]
**Frameworks** : [liste]
**Architecture** : [architecture]

[Si Académique :]
**Établissement** : [établissement]
**Cours** : [cours]

---

### Bloc 6 - Options sélectionnées

**Métriques et tableaux de suivi** : [oui/non]

**Section Risques identifiés** : [oui/non]

**Prompt pour skill prompt engineering** : [oui/non]

---

## Décisions de génération

### Structure Notion créée

**Sections de la page principale** :
[Liste des sections créées]

**Propriétés de la base de données** :
[Liste complète des propriétés avec leurs types]

**Architecture conversationnelle** :
[Nombre de conversations] conversations générées

---

## Tâches générées

**Nombre total de tâches** : [X]
- Tâches parents : [Y]
- Sous-tâches : [Z]

**Organisation** : [par phases/sprints]

**Critères de priorisation** : [description de la logique utilisée]
```

### Fichier 4 : rapport-creation.md

```markdown
# Rapport de Création - [Nom du projet]

Date : [date et heure]

---

## Liens Notion

**Page principale du projet** :
[URL de la page Notion créée]

**Base de données "Suivi des tâches"** :
[URL de la database créée]

---

## Résumé de la structure créée

### Page principale

Sections créées :
1. ✅ Contexte du projet
2. [✅/➖] Avancement global
3. ✅ [Phases du projet / Planning des sprints / Workflow]
4. ✅ Suivi des tâches (base de données)
5. [✅/➖] Risques identifiés
6. ✅ Livrables
7. ✅ Liens utiles / Ressources

### Base de données

**Propriétés créées** :

Essentielles :
- Nom de la tâche (title)
- Statut (select: À faire, En cours, Bloqué, Terminé)
- Priorité (select: Haute, Moyenne, Basse)
- [Phase/Sprint] (select)
- Description (rich_text)
- Date d'échéance (date)

Conditionnelles :
[Liste des propriétés conditionnelles créées]

Relations :
- Parent (relation vers tâches parents)
- Enfants (relation vers sous-tâches)

### Tâches générées

**Total** : [X] tâches créées

**Structure hiérarchique** :
[Description de la hiérarchie]

**Répartition par phase/sprint** :
[Tableau de répartition]

---

## Architecture conversationnelle

**Nombre de conversations suggérées** : [X]

**Modèles recommandés** :
- [X] conversations avec Claude Sonnet 4.6
- [Y] conversations avec Claude Opus 4.8

Voir `prompts-conversations.md` pour les détails complets.

---

## Fichiers générés

✅ `instructions-projet.md` - Instructions complètes pour le projet Claude
✅ `prompts-conversations.md` - Prompts optimisés pour chaque conversation
✅ `decisions-questionnaire.md` - Traçabilité complète des décisions
✅ `rapport-creation.md` - Ce fichier
[✅] `prompt-pour-skill-prompt-engineering.md` - Si option activée

---

## Prochaines étapes

1. **Créer le projet Claude** :
   - Copier le contenu de `instructions-projet.md` dans les instructions du projet
   - Créer les conversations suggérées dans le projet

2. **Lancer la première conversation** :
   - Utiliser le prompt de la Conversation 1 dans `prompts-conversations.md`
   - Commencer le scoping détaillé du projet

3. **[Si option activée] Utiliser le skill de prompt engineering** :
   - Ouvrir le projet dédié au prompt engineering
   - Copier le contenu de `prompt-pour-skill-prompt-engineering.md`
   - Affiner la segmentation des conversations

4. **Ajouter les membres** (si projet en équipe) :
   - Inviter les participants au workspace Notion
   - Configurer les permissions appropriées

5. **Personnaliser** :
   - Ajouter les liens utiles dans la section dédiée
   - Compléter la section Risques si nécessaire
   - Ajuster les phases/sprints selon les besoins

---

## Notes

Ce projet a été généré par le skill `notion-project-manager`.

Pour toute question ou modification, se référer à :
- Les instructions projet : `instructions-projet.md`
- Les décisions prises : `decisions-questionnaire.md`
- L'architecture conversationnelle : `prompts-conversations.md`
```

### Fichier 5 (optionnel) : prompt-pour-skill-prompt-engineering.md

Créé uniquement si l'option est activée.

```markdown
# Prompt pour Skill Prompt Engineering

**Instructions** : Copier ce contenu dans le projet Claude dédié au prompt engineering pour affiner la segmentation conversationnelle.

---

## Demande

Je viens de créer un projet Claude pour le projet suivant. J'ai besoin que tu analyses ce projet et que tu me proposes une architecture conversationnelle optimisée avec des prompts détaillés pour chaque conversation.

---

## Contexte du projet

**Nom** : [Nom du projet]

**Type** : [Type de projet]

**Description** :
[Description complète du projet]

**Contraintes techniques** :
[Liste des contraintes]

**Livrables** :
[Liste des livrables]

**Deadline** : [Date]

**Équipe** : [Solo/Composition de l'équipe]

**Méthodologie** : [Méthodologie choisie]

---

## Structure Notion créée

**Lien Notion** : [URL]

**Tâches générées** : [X] tâches réparties en [Y] phases/sprints

**Organisation** : [Description de l'organisation]

---

## Architecture conversationnelle initiale

J'ai déjà généré [X] conversations suggérées :

[Liste des conversations avec leurs objectifs]

---

## Modèles IA suggérés

Pour chaque conversation, voici les modèles recommandés avec justification :

[Liste des conversations avec modèles]

---

## Demande spécifique

1. Analyse si cette architecture conversationnelle est optimale pour ce projet
2. Suggère des ajustements si nécessaire (ajout/fusion/split de conversations)
3. Pour chaque conversation :
   - Affine le périmètre exact
   - Génère un prompt initial complet et optimisé pour le modèle suggéré
   - Définis les critères de succès de cette conversation
4. Propose un workflow de passage d'une conversation à l'autre
5. Identifie les points de synchronisation critiques entre conversations

---

## Contraintes pour les prompts

- Chaque prompt doit être optimisé pour le modèle Claude spécifique (Haiku 4.5, Sonnet 4.6 ou Opus 4.8)
- Inclure systématiquement le lien Notion et le protocole de mise à jour
- Définir clairement ce qui est IN et OUT of scope
- Fournir des exemples concrets quand c'est pertinent
- Adapter le niveau de détail au modèle (Opus peut gérer plus de complexité)

---

## Format de sortie attendu

Pour chaque conversation, je veux :
```
## Conversation [N] : [Titre]

Objectif : [...]
Périmètre : [...]
Modèle : [Claude Haiku 4.5 / Sonnet 4.6 / Opus 4.8]
Justification modèle : [...]

Prompt initial :
[Prompt complet optimisé]

Critères de succès :
- [...]

Points de synchronisation :
- [...]
```
```

## Phase 5 : Sortie finale

Après la génération de tous les fichiers, afficher :

```markdown
# ✅ Projet créé avec succès !

## Liens Notion

**Page principale** : [URL]

**Base de données** : [URL database]

---

## Fichiers générés

Les fichiers suivants ont été créés dans le répertoire de travail :

1. ✅ `instructions-projet.md` - Instructions complètes pour le projet Claude
2. ✅ `prompts-conversations.md` - [X] conversations avec prompts optimisés
3. ✅ `decisions-questionnaire.md` - Traçabilité des décisions
4. ✅ `rapport-creation.md` - Résumé de la création
[5. ✅ `prompt-pour-skill-prompt-engineering.md` - Prompt pré-formaté]

---

## Résumé

- **Tâches créées** : [X] tâches ([Y] parents, [Z] sous-tâches)
- **Conversations suggérées** : [X]
- **Modèles recommandés** : [répartition Sonnet/Opus]

---

## Prochaines étapes

1. Télécharger les fichiers générés
2. Créer le projet Claude avec le contenu de `instructions-projet.md`
3. Créer les conversations suggérées
[4. Si option activée : Utiliser le prompt engineering skill pour affiner]

Pour suivre l'avancement plus tard, il suffit de revenir avec une phrase comme "mets à jour l'avancement de [nom du projet]" ou "fais le point sur le projet" : le skill passera automatiquement en Mode Suivi (lecture de l'état Notion, mise à jour des tâches, recalcul de l'avancement, journal).

Le projet est prêt à être utilisé !
```

Puis utiliser `present_files` pour présenter tous les fichiers générés.

## Mode Suivi : maintenance de l'avancement

Ce mode est déclenché lorsqu'un projet a déjà été créé par ce skill et que l'utilisateur veut faire évoluer son avancement. Il ne recrée jamais la structure ; il lit l'état existant sur Notion, applique des changements ciblés et recalcule l'avancement.

### Déclencheurs typiques

- "Mets à jour l'avancement de mon projet [nom]"
- "J'ai fini la tâche X" / "X est en cours" / "X est bloqué par Y"
- "Fais le point sur le projet" / "Où en est-on ?"
- "Ajoute une tâche / une phase" / "Décale la deadline de X"

### Étape S.1 : Localiser le projet

1. Demander le lien Notion de la page projet (ou le réutiliser s'il est déjà connu dans la conversation / les instructions du projet).
2. Utiliser `Notion:notion-fetch` sur la page principale ET sur la base de données "Suivi des tâches" pour récupérer l'état réel et à jour. Ne jamais se fier à un état supposé ou mémorisé.

### Étape S.2 : Établir le point d'avancement

À partir des données récupérées, produire un point d'avancement avant toute modification :

```markdown
# Point d'avancement - [Nom du projet] - [date]

## Vue d'ensemble
- Tâches terminées : [X] / [total] ([pourcentage] %)
- En cours : [n]   |   Bloquées : [n]   |   À faire : [n]
- Jours restants avant deadline : [n] (deadline : [date])

## Par phase/sprint
| Phase/Sprint | Terminées | Total | Avancement |
|--------------|-----------|-------|------------|
| [...] | [...] | [...] | [...] % |

## Tâches bloquées (attention requise)
- [tâche] — bloquée par : [raison/dépendance]

## Prochaines tâches prioritaires
- [tâche] (priorité [Haute/Moyenne], échéance [date])

## Alertes
- [Ex : retard probable sur la phase X / tâche en retard sur son échéance / charge déséquilibrée]
```

Si l'utilisateur a seulement demandé "où en est le projet ?", s'arrêter ici après avoir affiché ce point. Aucune modification.

### Étape S.3 : Appliquer les changements demandés

Pour chaque changement demandé (changement de statut, nouvelle tâche, rééchelonnement, réaffectation) :

1. Identifier précisément la ou les pages de tâches concernées dans la base de données.
2. **Présenter la liste exacte des modifications proposées** (avant → après) et **attendre la confirmation explicite** de l'utilisateur. Ne jamais modifier Notion sans validation.
3. Après confirmation, exécuter :
   - Changement de statut / priorité / échéance / assigné : `Notion:notion-update-page` sur chaque tâche.
   - Ajout de tâches : `Notion:notion-create-pages` (en respectant le schéma et les relations parent/enfant existants).
   - Ajout/modification d'une phase ou d'un sprint : mettre à jour l'option correspondante de la propriété "[Phase/Sprint]" puis la section planning de la page principale.
4. Vérifier le résultat par un nouveau `Notion:notion-fetch` ciblé.

Règles de cohérence des statuts :
- Une tâche parent passe à "Terminé" uniquement si toutes ses sous-tâches sont "Terminé".
- Une tâche "Bloqué" doit indiquer la cause dans sa "Description" (ou la propriété "Notes" si elle existe).
- Ne jamais supprimer de tâche : marquer "Annulé" si nécessaire (ajouter cette option au statut si elle n'existe pas), la suppression définitive reste à la charge de l'utilisateur.

### Étape S.4 : Recalculer et mettre à jour l'avancement global

Après application des changements, mettre à jour la page principale via `Notion:notion-update-page` :

- Section "Avancement global" : `Tâches terminées : [X] / [total] — [pourcentage] %`.
- Mettre à jour tout tableau de répartition par phase/sprint présent sur la page.
- Si la deadline approche et que l'avancement est en retard, ajouter une ligne d'alerte visible dans la section "Avancement global".

### Étape S.5 : Journal d'avancement

Tenir un historique des points d'avancement dans un fichier `journal-avancement.md` (créé au premier passage en mode Suivi, puis complété en ajoutant chaque nouvelle entrée en haut du fichier) :

```markdown
# Journal d'avancement - [Nom du projet]

## [date] - [pourcentage] % terminé
**Changements appliqués** :
- [tâche] : [ancien statut] → [nouveau statut]
- [nouvelle tâche ajoutée] : [...]

**État** : [n] terminées / [total]  |  En cours : [n]  |  Bloquées : [n]
**Prochaine priorité** : [tâche]
**Note** : [observation libre, risque, décision]

---

[entrées précédentes en dessous]
```

Présenter le fichier mis à jour avec `present_files` et afficher un court résumé textuel : nouveau pourcentage, ce qui a changé, prochaine priorité.

### Règles spécifiques au Mode Suivi

1. Toujours `Notion:notion-fetch` AVANT de produire le point ou d'appliquer un changement : l'état Notion fait foi, pas la mémoire.
2. Toujours présenter les modifications et obtenir une confirmation explicite avant écriture.
3. Ne jamais recréer la structure ni dupliquer la base de données.
4. Pas d'émojis (voir règles strictes).
5. En cas d'incohérence détectée (tâche orpheline, statut parent/enfant incohérent, échéance dépassée), la signaler dans le point d'avancement plutôt que de la corriger silencieusement.

## Règles strictes et interdictions

### Interdictions absolues

1. **JAMAIS d'émojis** - Ni dans les conversations, ni dans les sorties Notion, ni dans les fichiers générés
2. **JAMAIS de modification Notion sans validation** - Toujours demander confirmation avant update/create
3. **JAMAIS de génération avant validation Phase 2** - Le récapitulatif est obligatoire
4. **JAMAIS d'assumptions** - Si une information manque, la demander explicitement

### Règles de nommage

- **Adaptation contextuelle** :
  - "Sprint" pour méthodologie Agile
  - "Phase" pour phases séquentielles
  - "État" pour Kanban
- **Standardisation** :
  - "Statut" dans les bases de données
  - "Date d'échéance" (jamais "Date cible")
  - "Nom de la tâche" (jamais juste "Tâche")

### Protocole Notion

1. Toujours `Notion:notion-fetch` avant toute modification
2. Présenter les modifications proposées
3. Attendre confirmation explicite
4. Exécuter la modification
5. Vérifier le résultat

### Gestion des erreurs

Si une erreur survient pendant la génération Notion :
1. **Arrêter immédiatement** le processus
2. **Expliquer l'erreur** à l'utilisateur
3. **Proposer des solutions** (retry, ajustement, support)
4. **NE PAS** continuer la génération

## Recommandations de modèles Claude

Gamme actuelle (mi-2026). Recommander toujours un modèle de cette liste, jamais une génération antérieure (pas de "Sonnet 4" ou "Opus 4" obsolètes).

### Logique de recommandation

**Claude Haiku 4.5** (tâches rapides et bien cadrées) :
- Sous-tâches répétitives, scaffolding, renommages
- Génération de boilerplate, petits scripts utilitaires
- Reformulation, mise en forme, tâches à faible enjeu de raisonnement

**Claude Sonnet 4.6** (par défaut) :
- Projets simples à moyens (<15 tâches)
- Conversations de développement standard
- Implémentation de fonctionnalités bien définies
- Documentation et rédaction

**Claude Opus 4.8** (pour la complexité) :
- Projets complexes (15+ tâches)
- Architecture système complexe
- Logique métier avancée
- Résolution de problèmes difficiles
- Analyse et conception

### Format de justification

Toujours 1 phrase courte expliquant le choix :
- ✅ "Opus 4.8 pour la conception d'architecture complexe avec microservices"
- ✅ "Sonnet 4.6 pour l'implémentation de formulaires web standards"
- ✅ "Haiku 4.5 pour générer le boilerplate des routes CRUD"
- ❌ "Opus 4.8 car c'est mieux"
- ❌ "Sonnet 4.6 parce que le projet utilise Go et HTTP"

## Adaptation selon le type de projet

### Projet Développement

**Propriétés spécifiques** :
- Type de tâche (Feature, Bug, Setup, Documentation, Polish)
- Assigné (si équipe)

**Phases suggérées** :
- Phase 0 : Setup et configuration
- Phase 1 : Architecture et modèles
- Phase 2 : Logique métier
- Phase 3 : Interface utilisateur
- Phase 4 : Tests et débogage
- Phase 5 : Documentation et déploiement

**Conversations types** :
- Scoping
- Architecture/Design
- Backend/API
- Frontend/UI
- Intégration/Tests
- Documentation finale

### Projet TP Académique

**Propriétés spécifiques** :
- Conversation Claude (segmentation par sections du TP)
- Phase (selon les livrables demandés)

**Sections additionnelles** :
- État de l'infrastructure (si TP réseau/système)
- Journal d'erreurs
- Bloc d'état de session

**Conversations types** :
- Scoping
- [Une conversation par grande section technique]
- Rédaction PDF/rapport

### Projet Agile

**Propriétés spécifiques** :
- Sprint (Sprint 0, Sprint 1, etc.)
- User Story (texte)
- Estimation (number)
- Complété (checkbox)

**Structure sprints** :
- Sprint 0 : Setup
- Sprint 1-N : Développement itératif
- Sprint N+1 : Finalisation

**Conversations types** :
- Scoping
- [Une conversation par sprint]
- Rétrospective et polish

## Conseils d'optimisation

### Pour la génération des tâches

1. **Analyser le domaine** du projet pour identifier les composants naturels
2. **Identifier les dépendances critiques** pour la priorisation
3. **Équilibrer la charge** entre phases/sprints
4. **Créer une progression logique** (setup → dev → tests → doc)
5. **Adapter la granularité** au niveau demandé

### Pour les prompts de conversations

1. **Contexte minimal suffisant** - pas de duplication inutile
2. **Périmètre clair** - IN/OUT of scope explicite
3. **Actions initiales suggérées** - faciliter le démarrage
4. **Références aux ressources** - lien Notion, fichiers, docs
5. **Optimisation par modèle** :
   - Sonnet : instructions claires et directives
   - Opus : contexte riche et raisonnement demandé

### Pour la structure Notion

1. **Sections essentielles en premier** - Contexte, Planning, Tâches
2. **Sections optionnelles à la fin** - Risques, Métriques
3. **Tableaux concis** - maximum 10-12 lignes visibles
4. **Propriétés utiles uniquement** - éviter la surcharge cognitive

## Maintenance et évolution

Ce skill peut être étendu pour supporter :
- Templates de projets pré-configurés
- Import de structures existantes
- Génération de rapports d'avancement
- Intégration avec d'autres outils (Jira, GitHub, etc.)

Pour toute amélioration, se référer au skill-creator.

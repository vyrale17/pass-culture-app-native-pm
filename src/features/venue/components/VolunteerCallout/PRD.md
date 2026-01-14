# PRD - Valorisation du Bénévolat dans l'App

## Description

Cette fonctionnalité permet de mettre en avant les partenaires proposant des opportunités de bénévolat dans l'application Pass Culture.

**Contexte :**

Le bénévolat peut être une autre réponse/verticale du Pass Culture, permettant aux jeunes de s'engager au-delà de la simple consommation culturelle.

**L'URL renseignée côté espace partenaires est affichée sur la page partenaire et renvoie vers jeveuxaider.gouv.fr.**

28% des réservations viennent des pages partenaires, ce qui représente un point de contact important avec les utilisateurs.

**Approche :**

- Sujet à travailler avec l'équipe engagement pro
- On ne souhaite pas réinventer la roue car jeveuxaider.gouv.fr le fait déjà très bien
- L'objectif est de valoriser ces opportunités et de rediriger vers la plateforme existante

## Objectifs

- Mieux valoriser les partenaires proposant du bénévolat (au-delà d'une simple URL)
- Mesurer l'appétence des jeunes pour le bénévolat en production
- Rediriger les utilisateurs vers jeveuxaider.gouv.fr
- Collecter des retours qualitatifs avec la question "Est-ce que ça t'intéresse ?"
- Créer des playlists de partenaires proposant du bénévolat via Contentful

## Mesure d'impact

**Métrique principale : Taux de clic sur la mention/lien**
- Baseline : 0% (n'existe pas)
- Goal : 2%

**Métriques de contrôle**

Temps de chargement page venue
- Seuil d'alerte : >2 secondes
- L'enrichissement des contenus ne doit pas dégrader la performance technique

## Delivery - Tâches Macro

### 🎨 Design (Thomas)
- [ ] Finaliser le design du callout bénévolat
- [ ] Valider le wording : "Wahou ce partenaire propose du bénévolat !"
- [ ] Définir le positionnement dans l'onglet "Informations pratiques"
- [ ] (Optionnel) Design de la question de feedback "Est-ce que ça t'intéresse ?"

### 📱 Frontend (App Native) - **FAIT** ✅
- [x] Créer le composant `VolunteerCallout` avec bannière et lien externe
- [x] Créer le composant `VolunteerInterestFeedback` (optionnel)
- [x] Intégrer dans `PracticalInformation`
- [x] Ajouter les événements analytics (clic, fermeture, feedback)
- [x] Créer l'extension de type `VenueResponseWithVolunteer`

### 🔧 Backend (API)
- [ ] Ajouter le champ `hasVolunteerOpportunities` (boolean) au modèle Venue
- [ ] Ajouter le champ `volunteerUrl` (string, optionnel) au modèle Venue
- [ ] Exposer ces champs dans l'endpoint GET `/venues/{id}`
- [ ] Permettre le filtrage des venues par tag "volunteer" dans l'API de recherche
- [ ] Migration BDD pour ajouter les colonnes

### 🤝 Espace Partenaires
- [ ] Permettre la saisie de l'URL jeveuxaider.gouv.fr dans l'espace partenaires
- [ ] Activer le flag `hasVolunteerOpportunities` depuis l'espace partenaires
- [ ] Documentation pour les partenaires sur comment renseigner cette information
- [ ] Validation que l'URL saisie pointe bien vers jeveuxaider.gouv.fr (ou autre plateforme approuvée)

### 📊 Contentful
- [ ] Créer un tag "volunteer" ou "benevol" dans Contentful
- [ ] Mettre à jour le modèle `VenuesParameters` pour supporter le tag
- [ ] Configurer les playlists pour filtrer les venues avec bénévolat
- [ ] Tester l'affichage des playlists dans la home

### 🔍 Data / Ops
- [ ] Identifier les partenaires proposant du bénévolat (liste initiale)
- [ ] Renseigner `hasVolunteerOpportunities = true` pour ces venues
- [ ] Ajouter les URLs spécifiques jeveuxaider.gouv.fr si disponibles
- [ ] Tagger ces venues avec "volunteer" dans Contentful

### 📈 Analytics
- [ ] Configurer le dashboard Firebase/Amplitude pour suivre :
  - `VOLUNTEER_CALLOUT_CLICK`
  - `VOLUNTEER_CALLOUT_CLOSE`
  - `VOLUNTEER_INTEREST_FEEDBACK` (si activé)
- [ ] Créer les rapports de suivi du taux de clic
- [ ] Mettre en place l'alerte si objectif 2% non atteint après 1 mois
- [ ] Tracker la provenance des clics (page partenaire vs autres sources)

### 👥 Équipe Engagement Pro
- [ ] Alignement sur la stratégie bénévolat/engagement
- [ ] Validation de l'approche avec jeveuxaider.gouv.fr
- [ ] Définir les partenaires prioritaires à valoriser
- [ ] Plan de communication vers les partenaires existants

### 🧪 QA / Tests
- [ ] Tests unitaires Frontend (composants React)
- [ ] Tests d'intégration API (nouveaux champs venues)
- [ ] Tests E2E : parcours utilisateur complet
- [ ] Tests de performance : temps de chargement page venue
- [ ] Vérification accessibilité (lecteur d'écran, contraste)
- [ ] Test de l'espace partenaires (saisie URL)

### 🚀 Déploiement
- [ ] Feature flag pour activer/désactiver le callout
- [ ] Release Backend en PROD
- [ ] Release App Native en PROD
- [ ] Activation du feature flag en PROD
- [ ] Communication interne (équipes support, partenaires)

### 📋 Post-Launch
- [ ] Monitoring des métriques (semaine 1, semaine 2, mois 1)
- [ ] Analyse des retours utilisateurs (si feedback activé)
- [ ] Itération sur le wording/design si taux de clic < 1%
- [ ] Élargissement progressif à plus de partenaires
- [ ] Bilan avec l'équipe engagement pro sur l'impact

## Dépendances

- ✅ Frontend app-native : **FAIT**
- 🔴 Backend API : En attente
- 🔴 Espace Partenaires : En attente
- 🔴 Contentful : En attente
- 🟠 Design : En cours (validation finale)
- 🟠 Équipe Engagement Pro : Alignement nécessaire

## Risques identifiés

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Peu de partenaires identifiés avec bénévolat | Faible volume de mesure | Commencer avec une liste restreinte et élargir progressivement |
| Taux de clic très faible (<0.5%) | Objectif non atteint | Itérer sur le design/wording, tester différents emplacements |
| Dégradation perf page venue | UX impactée | Feature flag pour désactiver rapidement, optimisation code |
| URL jeveuxaider.gouv.fr non pertinente | Mauvaise UX | Permettre des URLs spécifiques par venue via `volunteerUrl` |
| Partenaires ne renseignent pas l'info | Faible adoption | Communication et accompagnement des partenaires |
| Désalignement avec l'équipe engagement pro | Stratégie incohérente | Workshop d'alignement avant le lancement |

## Opportunités

**28% des réservations viennent des pages partenaires** - Ce trafic significatif représente une opportunité majeure pour :
- Mesurer l'appétence réelle pour le bénévolat
- Créer un nouveau type d'engagement au-delà de la consommation culturelle
- Renforcer les partenariats avec les acteurs du secteur associatif

## Questions ouvertes

- [ ] Activer ou non la question "Est-ce que ça t'intéresse ?" dès le lancement ?
  - **Recommandation** : Oui, si pas coûteux et donne des insights qualitatifs
- [ ] Faut-il un AB test avec/sans callout pour mesurer l'impact réel ?
- [ ] Quelle visibilité donner aux playlists "bénévolat" dans la home ?
- [ ] Comment inciter les partenaires à renseigner leur URL jeveuxaider.gouv.fr ?
- [ ] Y a-t-il d'autres plateformes de bénévolat à autoriser au-delà de jeveuxaider.gouv.fr ?

## Timeline estimée

| Phase | Durée | Équipe |
|-------|-------|--------|
| Alignement engagement pro | 1-2j | Product + Engagement |
| Design final | 2j | Design |
| Dev Backend + Espace Partenaires | 5-7j | Backend |
| Config Contentful | 1-2j | Product/CMS |
| Identification venues | 2-3j | Data/Ops |
| Communication partenaires | 3-5j | Engagement Pro |
| QA | 2-3j | QA |
| Release PROD | 1j | DevOps |
| **TOTAL** | **~3-4 semaines** | - |

## Prochaines étapes immédiates

1. ✅ **Frontend ready** - Code déployé et testé
2. 🔜 **Workshop engagement pro** - Aligner la stratégie bénévolat
3. 🔜 **Specs Backend** - Définir les champs exacts et l'intégration espace partenaires
4. 🔜 **Communication partenaires** - Informer et accompagner les premiers partenaires pilotes

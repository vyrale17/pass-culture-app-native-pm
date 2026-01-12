# Documentation Produit : Vidéos sur les Pages Offres

> Documentation fonctionnelle interne - Pass Culture App Native
>
> Dernière mise à jour : Janvier 2026

---

## Table des matières

1. [Présentation générale](#1-présentation-générale)
2. [Règles d'affichage : Quand voit-on une vidéo ?](#2-règles-daffichage--quand-voit-on-une-vidéo-)
3. [Parcours utilisateur détaillés](#3-parcours-utilisateur-détaillés)
4. [Gestion du consentement cookies (RGPD)](#4-gestion-du-consentement-cookies-rgpd)
5. [Système de feedback utilisateur](#5-système-de-feedback-utilisateur)
6. [Suivi et mesure (Analytics)](#6-suivi-et-mesure-analytics)
7. [Cas particuliers et limitations](#7-cas-particuliers-et-limitations)
8. [Feature flags et déploiement progressif](#8-feature-flags-et-déploiement-progressif)
9. [Questions fréquentes (FAQ)](#9-questions-fréquentes-faq)
10. [Références techniques (pour les équipes tech)](#10-références-techniques-pour-les-équipes-tech)

---

## 1. Présentation générale

### 🎯 Objectif de la fonctionnalité

Permettre aux utilisateurs de visionner des **vidéos YouTube** directement sur les fiches offres pour :
- **Enrichir** la présentation des offres avec du contenu multimédia attractif
- **Améliorer** la découvrabilité et la compréhension des offres
- **Collecter** des retours utilisateurs sur l'utilité du contenu vidéo

### 📱 Où trouve-t-on cette fonctionnalité ?

- **Page** : Fiche offre (page de détail d'un produit/offre)
- **Plateforme** : Application mobile (iOS, Android) et site web
- **Type de vidéo** : Vidéos YouTube uniquement

### 🧩 Les 4 éléments de la fonctionnalité

1. **Miniature vidéo cliquable**
   - Image d'aperçu de la vidéo
   - Bouton play au centre
   - Durée affichée en haut à droite
   - Titre en bas de la miniature

2. **Lecteur vidéo YouTube**
   - Lance la vidéo automatiquement après le clic
   - Contrôles YouTube standards (pause, volume, plein écran, etc.)
   - Optimisé selon la plateforme (mobile ou web)

3. **Écran de consentement cookies** (si nécessaire)
   - Message explicatif sur l'utilisation des cookies YouTube
   - Bouton pour accepter et voir la vidéo
   - Accès aux paramètres de gestion des cookies

4. **Système de feedback**
   - Question : "Trouves-tu le contenu de cette vidéo utile ?"
   - Boutons Oui/Non
   - Lien vers questionnaire détaillé selon la réponse

---

## 2. Règles d'affichage : Quand voit-on une vidéo ?

### ✅ Les 3 conditions obligatoires

Pour qu'une vidéo s'affiche sur une fiche offre, **TOUTES** ces conditions doivent être réunies :

#### Condition 1️⃣ : L'offre a une vidéo associée

**Règle** : La vidéo doit être renseignée dans les données de l'offre (backend)
- L'ID de la vidéo YouTube doit exister
- Exemple : ID YouTube `hWdLhB2okqA`

**💡 En pratique** :
- ✅ Si l'offre a `video.id = "hWdLhB2okqA"` → La vidéo peut s'afficher
- ❌ Si l'offre n'a pas de champ `video` ou si `video.id` est vide → Pas de section vidéo

#### Condition 2️⃣ : Le feature flag est activé

**Règle** : Le feature flag `WIP_OFFER_VIDEO_SECTION` doit être à `true`

**💡 En pratique** :
- Ce flag permet d'activer/désactiver la fonctionnalité globalement
- Utilisé pour un déploiement progressif (par exemple : Web d'abord, puis mobile)
- Permet un rollback rapide en cas de problème

**Exemple de scénario** :
- Feature flag à `false` sur Android → Aucun utilisateur Android ne voit les vidéos
- Feature flag à `true` sur iOS → Tous les utilisateurs iOS peuvent voir les vidéos

#### Condition 3️⃣ : L'utilisateur est dans le bon segment (si AB test activé)

**Règle** : Si le AB testing est activé (`ENABLE_VIDEO_AB_TESTING = true`), seul le segment A voit les vidéos

**💡 En pratique** :
- **AB test désactivé** → Tout le monde voit les vidéos (si conditions 1 et 2 OK)
- **AB test activé** :
  - Segment A (50% des utilisateurs) → Voit les vidéos
  - Segment B (50% des utilisateurs) → Ne voit pas les vidéos (groupe témoin)

**Objectif de l'AB test** :
Mesurer l'impact des vidéos sur :
- Le taux de réservation
- Le temps passé sur la fiche
- L'engagement global

### 📊 Tableau récapitulatif

| Offre a une vidéo | Feature flag | AB test | Résultat |
|-------------------|--------------|---------|----------|
| ✅ Oui | ✅ Activé | ❌ Désactivé | ✅ **Vidéo affichée pour tous** |
| ✅ Oui | ✅ Activé | ✅ Activé (Segment A) | ✅ **Vidéo affichée** |
| ✅ Oui | ✅ Activé | ✅ Activé (Segment B) | ❌ Pas de vidéo |
| ✅ Oui | ❌ Désactivé | - | ❌ Pas de vidéo |
| ❌ Non | ✅ Activé | - | ❌ Pas de vidéo |

### 🎨 Règles d'affichage du contenu

#### Titre de la vidéo
- **Priorité 1** : Si la vidéo a un titre → On l'affiche
- **Priorité 2** : Sinon → On affiche le nom de l'offre

**Exemple** :
- Offre : "Concert de Metallica"
- Titre vidéo : "Bande-annonce officielle tournée 2026"
- **Résultat** : On affiche "Bande-annonce officielle tournée 2026"

#### Miniature
- **Priorité 1** : Si URL de miniature fournie → On l'utilise
- **Priorité 2** : Sinon → YouTube génère automatiquement une miniature

#### Durée
- Format stocké : Nombre de secondes (ex: `125` secondes)
- Format affiché : Minutes:Secondes (ex: `2:05`)
- Position : Coin supérieur droit de la miniature

### 📐 Dimensionnement

**Format vidéo** : Ratio 16:9 (format standard YouTube)

**Largeur** :
- Maximum 540 pixels
- S'adapte à la largeur de l'écran si plus petit

**Exemples** :
- Mobile (375px) → Vidéo de 375px de large × 211px de haut
- Tablette (768px) → Vidéo de 540px de large × 304px de haut
- Desktop (1920px) → Vidéo de 540px de large × 304px de haut (plafond à 540px)

---

## 3. Parcours utilisateur détaillés

### 🟢 Scénario A : Utilisateur ayant déjà accepté les cookies vidéo

**Contexte** : L'utilisateur a précédemment accepté les cookies YouTube (soit sur cette fiche, soit dans les paramètres)

#### Étapes du parcours

1. **Arrivée sur la fiche offre**
   - L'utilisateur clique sur une offre depuis la page d'accueil ou une recherche
   - La page de détail de l'offre se charge

2. **Découverte de la vidéo**
   - En scrollant, l'utilisateur voit la section vidéo
   - Affichage : Miniature + bouton play + durée + titre

3. **Lancement de la vidéo**
   - L'utilisateur clique sur le bouton play OU n'importe où sur la miniature
   - Le lecteur YouTube apparaît et la vidéo démarre automatiquement
   - Un événement analytics est enregistré

4. **Visionnage**
   - L'utilisateur regarde la vidéo avec les contrôles YouTube standards
   - Possibilité de mettre en pause, ajuster le volume, passer en plein écran, etc.

5. **Feedback (après ou pendant le visionnage)**
   - Sous le lecteur, une question apparaît : "Trouves-tu le contenu de cette vidéo utile ?"
   - Deux boutons : "Oui" et "Non"

6. **Suite selon la réaction**
   - **Si "Oui"** :
     - Message : "Merci pour ton retour !"
     - Lien vers questionnaire Qualtrics détaillé (URL spécifique pour les retours positifs)
   - **Si "Non"** :
     - Message : "Merci pour ton retour !"
     - Lien vers questionnaire Qualtrics détaillé (URL spécifique pour les retours négatifs)
   - **Si aucune réaction** :
     - L'utilisateur peut continuer à explorer la fiche offre normalement

### 🔴 Scénario B : Utilisateur n'ayant PAS accepté les cookies vidéo

**Contexte** : L'utilisateur n'a jamais accepté les cookies YouTube ou les a refusés

#### Étapes du parcours

1. **Arrivée sur la fiche offre**
   - L'utilisateur clique sur une offre
   - La page de détail de l'offre se charge

2. **Découverte de la vidéo bloquée**
   - En scrollant, l'utilisateur voit une miniature grisée/désactivée
   - Un message apparaît : "En visionnant cette vidéo, tu t'engages à accepter les cookies liés à Youtube."
   - Deux boutons sont disponibles

3. **Choix de l'utilisateur - Option 1 : "Voir la vidéo"**
   - L'utilisateur clique sur "Voir la vidéo"
   - **Action automatique** : Les cookies vidéo sont acceptés
   - Le lecteur s'active immédiatement
   - La vidéo démarre
   - → Suite du parcours = Scénario A à partir de l'étape 4

4. **Choix de l'utilisateur - Option 2 : "Gérer mes cookies"**
   - L'utilisateur clique sur "Gérer mes cookies"
   - Redirection vers : Profil > Paramètres > Gestion des cookies
   - Dans les paramètres, l'utilisateur voit la catégorie "Vidéo"
   - Il peut activer ou laisser désactivé
   - **Si activé** : Retour à la fiche → Vidéo disponible (Scénario A)
   - **Si désactivé** : Retour à la fiche → Vidéo toujours bloquée (reste en Scénario B)

### 🔄 Cas particuliers

#### L'utilisateur revient sur une fiche où il a déjà donné son avis

**Règle** : Une seule réaction par offre est possible

**Comportement** :
- Si l'utilisateur a déjà cliqué "Oui" ou "Non" → Les boutons de feedback ne s'affichent plus
- Le système se souvient de la réaction grâce au stockage local
- Exception : Si l'utilisateur désinstalle et réinstalle l'application, il pourra redonner son avis

#### L'utilisateur met l'application en arrière-plan puis revient

**Règle** : Le message de remerciement est réinitialisé

**Comportement** :
- Si l'utilisateur avait cliqué "Oui" ou "Non" et voit le message "Merci"
- Puis met l'app en arrière-plan ou change de page
- Au retour : Le message "Merci" disparaît (mais la réaction reste enregistrée)

#### L'utilisateur révoque son consentement cookies

**Règle** : Le consentement est révocable à tout moment

**Comportement** :
- L'utilisateur va dans Profil > Paramètres > Gestion des cookies
- Désactive la catégorie "Vidéo"
- Retourne sur une fiche offre avec vidéo
- → La vidéo est de nouveau bloquée avec l'écran de consentement (Scénario B)

---

## 4. Gestion du consentement cookies (RGPD)

### 🔒 Principe RGPD

**Règle fondamentale** : Les cookies YouTube sont **optionnels** et nécessitent un consentement explicite

- **Type de cookie** : `VIDEO_PLAYBACK` (catégorie "Vidéo")
- **Nature** : Cookie non essentiel (optionnel)
- **Finalité** : Permettre la lecture de vidéos YouTube embarquées
- **Tiers** : YouTube / Google

### ⚖️ Conformité RGPD

| Exigence RGPD | Notre implémentation |
|---------------|----------------------|
| **Opt-in obligatoire** | ✅ La vidéo ne charge jamais sans consentement explicite |
| **Information claire** | ✅ Message explicite : "En visionnant cette vidéo, tu t'engages à accepter les cookies liés à Youtube" |
| **Facilité d'acceptation** | ✅ Bouton "Voir la vidéo" directement visible |
| **Facilité de refus** | ✅ Possibilité d'ignorer ou de gérer dans les paramètres |
| **Révocabilité** | ✅ Désactivation possible à tout moment dans les paramètres |
| **Persistance** | ✅ Le consentement est sauvegardé entre les sessions |
| **Accès aux paramètres** | ✅ Bouton "Gérer mes cookies" directement accessible |

### 🎯 Les 2 façons d'accepter les cookies vidéo

#### Méthode 1 : Acceptation rapide (depuis la fiche offre)

**Où** : Directement sur l'écran de consentement de la vidéo

**Comment** :
1. L'utilisateur voit le message de consentement
2. Il clique sur "Voir la vidéo"
3. Les cookies `VIDEO_PLAYBACK` sont automatiquement acceptés
4. La vidéo se lance immédiatement

**Avantage** : Parcours rapide et fluide (1 clic)

#### Méthode 2 : Gestion dans les paramètres

**Où** : Profil > Paramètres > Gestion des cookies

**Comment** :
1. L'utilisateur clique sur "Gérer mes cookies"
2. Redirection vers la page de paramètres des cookies
3. Il voit toutes les catégories (dont "Vidéo")
4. Il peut activer/désactiver chaque catégorie
5. Il enregistre ses préférences
6. Retour à l'application → Préférences appliquées

**Avantage** : Contrôle granulaire sur tous les cookies

### 🔄 Gestion du consentement dans le temps

**Première visite** :
- Par défaut, les cookies vidéo ne sont PAS acceptés
- L'utilisateur doit faire un choix actif

**Visites suivantes** :
- Si accepté → Toutes les vidéos se lancent directement
- Si refusé → Toutes les vidéos affichent l'écran de consentement

**Modification du consentement** :
- Possible à tout moment dans Paramètres > Gestion des cookies
- Effet immédiat sur toutes les fiches offres

**Réinstallation de l'app** :
- Les préférences sont perdues (stockage local effacé)
- L'utilisateur doit redonner son consentement

---

## 5. Système de feedback utilisateur

### 🎯 Objectif du feedback

**Pourquoi** : Mesurer la pertinence et l'utilité des vidéos pour :
- Améliorer la sélection des vidéos associées aux offres
- Comprendre ce qui fonctionne ou pas auprès des utilisateurs
- Optimiser la stratégie de contenu vidéo

### 💬 La question posée

> **"Trouves-tu le contenu de cette vidéo utile ?"**

**Positionnement** : Directement sous le lecteur vidéo

**Moment d'apparition** : Dès que le lecteur est chargé (pas besoin d'attendre la fin de la vidéo)

### ✅ ❌ Les 2 réponses possibles

#### Réponse 1 : "Oui" (Réaction positive)

**Que se passe-t-il** :
1. Un message s'affiche : "Merci pour ton retour !"
2. Un lien vers un questionnaire Qualtrics apparaît
3. Les boutons "Oui"/"Non" disparaissent (une seule réaction possible)
4. Un événement analytics est enregistré

**Questionnaire Qualtrics** :
- URL : `https://passculture.qualtrics.com/jfe/form/SV_238Dd248lT6UuJE`
- Paramètre ajouté : `subcategory={ID de la sous-catégorie de l'offre}`
- Objectif du questionnaire : Comprendre ce qui a plu à l'utilisateur

**Exemple d'URL complète** :
```
https://passculture.qualtrics.com/jfe/form/SV_238Dd248lT6UuJE?subcategory=CONCERT
```

#### Réponse 2 : "Non" (Réaction négative)

**Que se passe-t-il** :
1. Un message s'affiche : "Merci pour ton retour !"
2. Un lien vers un questionnaire Qualtrics apparaît (différent du précédent)
3. Les boutons "Oui"/"Non" disparaissent
4. Un événement analytics est enregistré

**Questionnaire Qualtrics** :
- URL : `https://passculture.qualtrics.com/jfe/form/SV_3lb1IPodkGiMzWe`
- Paramètre ajouté : `subcategory={ID de la sous-catégorie de l'offre}`
- Objectif du questionnaire : Identifier ce qui n'a pas plu et les axes d'amélioration

### 🔒 Règles de gestion du feedback

#### Règle 1 : Une seule réaction par offre

**Règle** : L'utilisateur ne peut donner son avis qu'une seule fois par offre

**Comment c'est géré** :
- La réaction est sauvegardée localement sur l'appareil
- Clé de stockage : `feedback_reaction_{ID de l'offre}`
- Une fois sauvegardée, les boutons ne s'affichent plus sur cette offre

**Cas d'exception** :
- Désinstallation / réinstallation de l'app → Stockage local effacé → Peut redonner son avis

#### Règle 2 : Pas besoin de regarder toute la vidéo

**Règle** : L'utilisateur peut donner son avis dès que la vidéo commence

**Raison** : Certains utilisateurs peuvent juger rapidement si le contenu est pertinent ou non

#### Règle 3 : Le feedback est optionnel

**Règle** : L'utilisateur peut ignorer complètement le feedback

**Comportement** :
- Pas de bouton "Fermer" ou "Plus tard"
- L'utilisateur peut simplement continuer à naviguer sur la fiche
- Aucune action forcée

#### Règle 4 : Réinitialisation du message de remerciement

**Règle** : Le message "Merci pour ton retour !" disparaît dans certaines situations

**Déclencheurs de réinitialisation** :
- L'utilisateur quitte la fiche offre
- L'utilisateur met l'application en arrière-plan
- L'utilisateur navigue vers une autre page

**Important** : La réaction reste enregistrée (seul le message visuel disparaît)

### 📊 Utilisation des données

**Données collectées** :
- Nombre de réactions positives vs négatives par offre
- Sous-catégorie de l'offre (pour segmentation)
- ID utilisateur (si connecté)

**Analyses possibles** :
- Taux de satisfaction par type d'offre
- Corrélation entre réaction positive et réservation
- Identification des vidéos à améliorer ou remplacer
- Benchmarking par catégorie (ex: Concerts vs Cinéma)

---

## 6. Suivi et mesure (Analytics)

### 📊 Les 2 événements principaux trackés

#### Événement 1 : Consultation de vidéo (`CONSULT_VIDEO`)

**Quand est-il déclenché** : À l'instant où l'utilisateur clique sur play (sur la miniature ou le bouton play)

**Informations enregistrées** :
- **Source** : `offer` (indique que la vidéo vient d'une fiche offre)
- **ID de l'offre** : Identifiant unique de l'offre
- **ID YouTube** : Identifiant de la vidéo YouTube (optionnel)

**Utilité** :
- Mesurer combien d'utilisateurs lancent les vidéos
- Identifier les offres dont les vidéos sont les plus visionnées
- Calculer le taux de clic sur la miniature

**Nom technique Firebase** : `CONSULT_VIDEO`

#### Événement 2 : Validation de réaction (`VALIDATE_REACTION`)

**Quand est-il déclenché** : Quand l'utilisateur clique sur "Oui" ou "Non" dans le feedback

**Informations enregistrées** :
- **ID de l'offre** : Identifiant unique de l'offre
- **Type de réaction** : `LIKE`, `DISLIKE` ou `NO_REACTION`
- **Source** : `OFFER_VIDEO_SURVEY`
- **ID utilisateur** : Si l'utilisateur est connecté

**Utilité** :
- Mesurer la satisfaction des vidéos
- Identifier les vidéos qui plaisent ou déplaisent
- Calculer le taux de réaction positive/négative

**Nom technique Firebase** : `VALIDATE_REACTION`

### 📈 Métriques clés à suivre

#### Performance des vidéos

| Métrique | Calcul | Objectif |
|----------|--------|----------|
| **Taux de clic** | (Clics sur play) / (Impressions miniature) × 100 | Mesurer l'attractivité de la miniature |
| **Taux de réaction** | (Réactions) / (Vues) × 100 | Mesurer l'engagement après visionnage |
| **Ratio satisfaction** | (LIKE) / (LIKE + DISLIKE) × 100 | Mesurer la qualité perçue |

#### Impact business

| Métrique | Objectif |
|----------|----------|
| **Taux de conversion** | Comparer le taux de réservation des offres avec vidéo vs sans vidéo |
| **Temps sur la page** | Mesurer si les vidéos augmentent le temps passé sur la fiche |
| **Scroll complet** | Vérifier si les utilisateurs qui regardent la vidéo explorent plus l'offre |

#### RGPD et consentement

| Métrique | Objectif |
|----------|----------|
| **Taux d'acceptation cookies** | % d'utilisateurs qui acceptent les cookies vidéo |
| **Taux d'abandon** | % d'utilisateurs qui quittent après voir le message de consentement |
| **Délai d'acceptation** | Temps moyen avant d'accepter les cookies |

### 🎯 Cas d'usage des analytics

**Cas 1 : Identifier les meilleures vidéos**
- Filtrer les vidéos avec ratio satisfaction > 80%
- Les promouvoir ou s'en inspirer pour d'autres offres

**Cas 2 : Détecter les vidéos problématiques**
- Filtrer les vidéos avec ratio satisfaction < 30%
- Les remplacer ou les améliorer

**Cas 3 : Mesurer l'impact sur les réservations**
- Segmenter les offres : avec vidéo / sans vidéo
- Comparer les taux de réservation
- Valider le ROI de la fonctionnalité

**Cas 4 : Optimiser par catégorie**
- Analyser les performances par sous-catégorie (Concert, Cinéma, Livre, etc.)
- Adapter la stratégie vidéo selon les catégories

---

## 7. Cas particuliers et limitations

### ⚠️ Limitations de la fonctionnalité

#### Limitation 1 : Seulement YouTube

**Règle** : La fonctionnalité ne supporte QUE les vidéos YouTube

**Plateforme NON supportées** :
- ❌ Vimeo
- ❌ Dailymotion
- ❌ Twitch
- ❌ Vidéos hébergées en direct (MP4, etc.)

**Raison** : L'intégration technique est faite spécifiquement pour l'API YouTube

#### Limitation 2 : Vidéos publiques et "embedables"

**Règle** : La vidéo YouTube doit autoriser l'embedding (intégration sur d'autres sites)

**Vidéos NON supportées** :
- ❌ Vidéos avec embedding désactivé par le propriétaire
- ❌ Vidéos privées (non accessibles au public)
- ❌ Vidéos avec restriction géographique stricte
- ⚠️ Vidéos "non répertoriées" (unlisted) : supportées si embedding autorisé

**Que se passe-t-il si la vidéo n'est pas embedable** :
- La miniature reste affichée
- Au clic : Erreur YouTube (code 101 ou 150)
- Pas de message d'erreur visible pour l'utilisateur
- L'événement analytics est quand même enregistré

#### Limitation 3 : Une seule vidéo par offre

**Règle** : Maximum 1 vidéo par fiche offre

**Pas de support pour** :
- ❌ Playlists YouTube
- ❌ Carrousels de vidéos
- ❌ Vidéos alternatives

**Si besoin de plusieurs vidéos** : Il faut créer une playlist YouTube et intégrer la vidéo de présentation

### 🔍 Cas d'erreur gérés

#### Cas 1 : Vidéo supprimée ou introuvable

**Scénario** : La vidéo YouTube a été supprimée ou l'ID est invalide

**Code d'erreur YouTube** : 100 (VIDEO_NOT_FOUND)

**Comportement** :
- La miniature reste visible
- Au clic : Lecteur YouTube affiche "Cette vidéo n'est pas disponible"
- Pas de gestion d'erreur spécifique côté Pass Culture

**Recommandation** : Surveiller régulièrement les vidéos associées aux offres actives

#### Cas 2 : Embedding désactivé

**Scénario** : Le propriétaire de la vidéo a désactivé l'intégration externe

**Code d'erreur YouTube** : 101 ou 150 (EMBED_NOT_ALLOWED)

**Comportement** :
- La miniature reste visible
- Au clic : Erreur YouTube
- Message YouTube : "Lecture sur d'autres sites Web a été désactivée par le propriétaire de la vidéo"

**Solution** : Choisir une autre vidéo ou demander au propriétaire d'autoriser l'embedding

#### Cas 3 : Connexion internet lente ou absente

**Scénario** : L'utilisateur n'a pas de connexion ou une connexion très lente

**Comportement** :
- **Miniature** : Se charge correctement (image légère)
- **Lecteur** : YouTube affiche un spinner de chargement
- **Si timeout** : Message d'erreur YouTube standard

**Gestion** : Pas de gestion spécifique Pass Culture, YouTube gère nativement

#### Cas 4 : ID YouTube invalide

**Scénario** : L'ID vidéo dans la base de données est mal formé

**Code d'erreur YouTube** : 2 (INVALID_PARAMETER)

**Comportement** :
- Erreur au chargement du lecteur
- Pas de vidéo affichée

**Prévention** : Validation de l'ID YouTube côté backoffice lors de l'association

### 📱 Spécificités par plateforme

#### Mobile (iOS / Android)

**Particularités** :
- Lecteur vidéo natif optimisé pour le tactile
- Mode plein écran natif iOS/Android
- Respect de l'économiseur de données (si activé dans les réglages du téléphone)
- Pause automatique si appel téléphonique entrant

**Divider de section** : Visible (séparation visuelle entre sections)

#### Web (Desktop / Mobile web)

**Particularités** :
- Lecteur YouTube iframe standard
- Contrôles clavier supportés (espace = play/pause, flèches = avance/recule)
- Qualité vidéo adaptée automatiquement par YouTube

**Divider de section** : Non visible sur desktop (design épuré)

### 🚫 Restrictions techniques

| Élément | Valeur max |
|---------|------------|
| **Largeur vidéo** | 540 pixels |
| **Durée vidéo** | Aucune limite (gérée par YouTube) |
| **Poids vidéo** | Géré par YouTube |
| **Nombre de vidéos par offre** | 1 |
| **Nombre de réactions par utilisateur et par offre** | 1 |

---

## 8. Feature flags et déploiement progressif

### 🚦 Les 3 feature flags

#### Feature flag 1 : `WIP_OFFER_VIDEO_SECTION`

**Nom** : WIP_OFFER_VIDEO_SECTION

**Rôle** : Interrupteur général de la fonctionnalité vidéo

**Valeurs possibles** :
- `true` : La fonctionnalité vidéo est activée
- `false` : Aucune vidéo ne s'affiche (même si les offres ont des vidéos)

**Cas d'usage** :
- **Déploiement progressif** : Activer d'abord sur Web, puis iOS, puis Android
- **Test en production** : Activer pour un % d'utilisateurs avant généralisation
- **Rollback rapide** : Désactiver immédiatement en cas de problème technique

**Exemple de stratégie de déploiement** :
1. Semaine 1 : `false` partout (développement)
2. Semaine 2 : `true` sur Web uniquement (10% des utilisateurs)
3. Semaine 3 : `true` sur Web (100%) + iOS (10%)
4. Semaine 4 : `true` partout (100%)

#### Feature flag 2 : `ENABLE_VIDEO_AB_TESTING`

**Nom** : ENABLE_VIDEO_AB_TESTING

**Rôle** : Activer le test A/B pour mesurer l'impact des vidéos

**Valeurs possibles** :
- `true` : Test A/B activé (seulement segment A voit les vidéos)
- `false` : Pas de test A/B (tout le monde voit les vidéos si flag 1 activé)

**Segmentation si activé** :
- **Segment A** (50% des utilisateurs) : Voit les vidéos → Groupe test
- **Segment B** (50% des utilisateurs) : Ne voit pas les vidéos → Groupe contrôle

**Objectif du test A/B** :
Mesurer l'impact des vidéos sur :
- Taux de réservation
- Temps passé sur la fiche
- Taux de complétion (scroll jusqu'en bas)
- Engagement global

**Durée recommandée** : 2-4 semaines pour avoir des données statistiquement significatives

**Métriques à comparer** :

| Métrique | Segment A (avec vidéo) | Segment B (sans vidéo) | Écart attendu |
|----------|------------------------|------------------------|---------------|
| Taux de réservation | À mesurer | À mesurer | > +5% ? |
| Temps moyen sur page | À mesurer | À mesurer | > +20% ? |
| Taux de scroll complet | À mesurer | À mesurer | > +10% ? |

#### Feature flag 3 : `WIP_OFFER_VIDEO_PREVIEW`

**Nom** : WIP_OFFER_VIDEO_PREVIEW

**Rôle** : Activer une page dédiée en plein écran pour la vidéo

**Statut** : Work In Progress (fonctionnalité en développement)

**Objectif** : Permettre un visionnage immersif sans distractions (page séparée de la fiche offre)

**Usage futur** : Potentiellement un bouton "Voir en plein écran" sur la vidéo

### 🎛️ Combinaisons des feature flags

| Flag 1 (VIDEO_SECTION) | Flag 2 (AB_TESTING) | Segment utilisateur | Résultat |
|------------------------|---------------------|---------------------|----------|
| `false` | - | - | ❌ Pas de vidéo |
| `true` | `false` | - | ✅ Vidéo pour tous |
| `true` | `true` | A | ✅ Vidéo visible |
| `true` | `true` | B | ❌ Pas de vidéo |

### 📊 Stratégie de déploiement recommandée

#### Phase 1 : Test interne (1 semaine)

- `WIP_OFFER_VIDEO_SECTION` = `true` (environnement de test uniquement)
- Validation par l'équipe produit
- Tests UX/UI
- Vérification analytics

#### Phase 2 : Soft launch (2 semaines)

- `WIP_OFFER_VIDEO_SECTION` = `true` (10% des utilisateurs)
- `ENABLE_VIDEO_AB_TESTING` = `false`
- Monitoring des erreurs et de la performance
- Collecte des premiers feedbacks

#### Phase 3 : AB test (3-4 semaines)

- `WIP_OFFER_VIDEO_SECTION` = `true` (100% des utilisateurs)
- `ENABLE_VIDEO_AB_TESTING` = `true`
- Mesure de l'impact sur les KPIs
- Analyse des résultats

#### Phase 4 : Déploiement complet

- `WIP_OFFER_VIDEO_SECTION` = `true`
- `ENABLE_VIDEO_AB_TESTING` = `false` (si test A/B concluant)
- Fonctionnalité disponible pour tous

---

## 9. Questions fréquentes (FAQ)

### ❓ Questions générales

**Q : Pourquoi seulement YouTube ?**
R : YouTube offre la meilleure stabilité, performance et couverture mondiale. L'API est mature et bien documentée. Ajouter d'autres plateformes augmenterait la complexité technique sans bénéfice clair à court terme.

**Q : Combien de vidéos peut-on associer à une offre ?**
R : Une seule vidéo par offre actuellement. Si besoin de plusieurs vidéos, créer une playlist YouTube et utiliser la vidéo de présentation.

**Q : Les vidéos consomment-elles beaucoup de données ?**
R : Non, grâce au "lazy loading" : la vidéo ne charge que si l'utilisateur clique sur play. La miniature est légère (quelques Ko).

**Q : Peut-on désactiver les vidéos pour certaines catégories d'offres ?**
R : Oui, il suffit de ne pas associer de vidéo aux offres concernées dans le backoffice.

### ❓ Questions RGPD et cookies

**Q : Pourquoi demander le consentement pour les vidéos ?**
R : YouTube (Google) dépose des cookies tiers pour le tracking et la publicité. Le RGPD impose un consentement explicite pour les cookies non essentiels.

**Q : Que se passe-t-il si un utilisateur refuse les cookies ?**
R : Il voit quand même la miniature avec un message explicatif. Il peut changer d'avis à tout moment en cliquant sur "Voir la vidéo" ou dans les paramètres.

**Q : Le consentement est-il sauvegardé ?**
R : Oui, entre les sessions. Exception : désinstallation de l'app (stockage local effacé).

**Q : Peut-on accepter les cookies vidéo sans accepter les autres cookies ?**
R : Oui, les catégories de cookies sont indépendantes. L'utilisateur a un contrôle granulaire.

### ❓ Questions feedback et analytics

**Q : À quel moment l'utilisateur peut-il donner son avis ?**
R : Dès que la vidéo est lancée. Pas besoin de la regarder en entier.

**Q : Peut-on changer son avis après avoir réagi ?**
R : Non, une seule réaction par offre. L'utilisateur peut cependant répondre au questionnaire Qualtrics pour nuancer.

**Q : Que faire des vidéos avec beaucoup de retours négatifs ?**
R : Les analyser, comprendre le problème (contenu inadapté, durée trop longue, etc.) et les remplacer ou améliorer.

**Q : Comment mesurer le ROI des vidéos ?**
R : Comparer les KPIs (taux de réservation, temps sur page) entre offres avec et sans vidéo, ou via un AB test.

### ❓ Questions techniques

**Q : Que se passe-t-il si la vidéo YouTube est supprimée ?**
R : La miniature reste visible mais la vidéo ne lance pas (erreur YouTube). Il faut manuellement retirer ou remplacer la vidéo dans le backoffice.

**Q : Comment savoir si une vidéo YouTube autorise l'embedding ?**
R : Tester l'URL de la vidéo sur YouTube, aller dans "Partager" > "Intégrer". Si disponible, l'embedding est autorisé.

**Q : Les vidéos fonctionnent-elles hors ligne ?**
R : Non, elles nécessitent une connexion internet pour se lancer (géré par YouTube).

**Q : Peut-on forcer des sous-titres ?**
R : Non, les sous-titres dépendent de la vidéo YouTube et des préférences utilisateur YouTube.

### ❓ Questions déploiement

**Q : Comment rollback si problème ?**
R : Désactiver le feature flag `WIP_OFFER_VIDEO_SECTION` → Effet immédiat sur toutes les plateformes.

**Q : Peut-on activer les vidéos seulement sur certaines offres ?**
R : Oui, en ne renseignant le champ vidéo que pour les offres concernées.

**Q : Les vidéos affectent-elles la performance de l'app ?**
R : Non, grâce au lazy loading. La miniature est légère et le lecteur YouTube ne charge que si déclenché.

---

## 10. Références techniques (pour les équipes tech)

### 📁 Fichiers sources principaux

#### Pages
- `/src/features/offer/pages/Offer/Offer.tsx` - Page offre principale
- `/src/features/offer/pages/OfferVideoPreview/OfferVideoPreview.tsx` - Page vidéo plein écran (WIP)

#### Composants vidéo
- `/src/features/offer/components/OfferContent/VideoSection/VideoSection.tsx` - Conteneur principal
- `/src/features/offer/components/OfferContent/VideoSection/GatedVideoSection.tsx` - Écran de consentement
- `/src/features/offer/components/OfferContent/VideoSection/FeedBackVideo.tsx` - Système de feedback
- `/src/features/home/components/modules/video/YoutubePlayer/YoutubePlayer.tsx` - Lecteur vidéo
- `/src/features/home/components/modules/video/PlayerPreview/PlayerPreview.tsx` - Miniature

#### Tests
- `/src/features/offer/components/OfferContent/VideoSection/VideoSection.native.test.tsx`
- `/src/features/offer/components/OfferContent/VideoSection/FeedBackVideo.native.test.tsx`

### 🛠️ Technologies utilisées

**Mobile (React Native)** :
- Package : `react-native-youtube-iframe`
- Lecteur natif optimisé pour iOS et Android

**Web** :
- Package : `react-youtube`
- Lecteur YouTube iframe standard

**Analytics** :
- Firebase Events : `CONSULT_VIDEO`, `VALIDATE_REACTION`

**Stockage** :
- AsyncStorage (React Native) pour les réactions utilisateur

### 📊 Structure des données

**Objet vidéo dans l'API** :
```
video: {
  id: string              // ID YouTube (ex: "hWdLhB2okqA")
  title?: string          // Titre optionnel
  thumbUrl?: string       // URL miniature
  durationSeconds?: number // Durée en secondes
}
```

**Stockage local des réactions** :
- Clé : `feedback_reaction_{offerId}`
- Valeur : `LIKE` ou `DISLIKE`

### 🎨 Spécifications design

- **Ratio vidéo** : 16:9 (standard YouTube)
- **Largeur max** : 540px
- **Positionnement miniature** :
  - Durée : Coin supérieur droit
  - Titre : Bas de la miniature (dégradé noir)
  - Bouton play : Centre

### 🔗 URLs externes

**Questionnaires Qualtrics** :
- Réaction positive : `https://passculture.qualtrics.com/jfe/form/SV_238Dd248lT6UuJE?subcategory={ID}`
- Réaction négative : `https://passculture.qualtrics.com/jfe/form/SV_3lb1IPodkGiMzWe?subcategory={ID}`

### 📚 Glossaire

- **Feature flag** : Interrupteur logiciel pour activer/désactiver une fonctionnalité sans redéployer
- **AB testing** : Méthodologie de test comparant deux variantes (A vs B) pour mesurer l'impact
- **Embed / Embedding** : Intégration d'une vidéo externe dans une page web/app
- **Lazy loading** : Chargement différé d'une ressource (ici : vidéo charge uniquement au clic)
- **AsyncStorage** : Système de stockage local persistant dans React Native
- **Analytics** : Système de mesure et de tracking des événements utilisateur
- **Qualtrics** : Plateforme de sondages et questionnaires en ligne
- **RGPD** : Règlement Général sur la Protection des Données (législation européenne)
- **Opt-in** : Consentement explicite (l'utilisateur doit activement accepter)
- **Cookies tiers** : Cookies déposés par un domaine externe (ici : YouTube/Google)

### 📋 Codes d'erreur YouTube

| Code | Signification | Action |
|------|---------------|--------|
| `2` | Paramètre invalide | Vérifier l'ID YouTube |
| `5` | Erreur HTML5 | Problème technique YouTube |
| `100` | Vidéo introuvable | Vidéo supprimée ou ID invalide |
| `101` / `150` | Embed désactivé | Choisir une autre vidéo |

### 📞 Contacts et maintenance

**Document maintenu par** : Équipe Produit Pass Culture

**Dernière mise à jour** : Janvier 2026

**Version** : 2.0 (version accessible et centrée sur les règles de gestion)

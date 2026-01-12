# Documentation Produit : Intégration Vidéo sur les Pages Offres

> Documentation fonctionnelle interne - Pass Culture App Native
>
> Dernière mise à jour : Janvier 2026

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture technique](#2-architecture-technique)
3. [Parcours utilisateur](#3-parcours-utilisateur)
4. [Gestion du consentement cookies](#4-gestion-du-consentement-cookies)
5. [Système de feedback](#5-système-de-feedback)
6. [Analytics et tracking](#6-analytics-et-tracking)
7. [Règles métier et conditions d'affichage](#7-règles-métier-et-conditions-daffichage)
8. [Spécifications techniques](#8-spécifications-techniques)
9. [Feature flags et AB testing](#9-feature-flags-et-ab-testing)
10. [Points d'attention](#10-points-dattention)

---

## 1. Vue d'ensemble

### Objectif

Permettre aux utilisateurs de visionner des vidéos YouTube directement sur les fiches offres, dans le but de :
- Enrichir la présentation des offres avec du contenu multimédia
- Améliorer la découvrabilité et l'attractivité des offres
- Collecter des feedbacks sur l'utilité du contenu vidéo

### Périmètre fonctionnel

- **Pages concernées** : Fiche offre (détail produit)
- **Type de contenu** : Vidéos YouTube uniquement
- **Formats supportés** : Toutes les vidéos YouTube publiques et embedables
- **Plateformes** : iOS, Android, Web

### Composants principaux

1. **Lecteur vidéo** : Intégration YouTube native
2. **Gestion du consentement** : Système de cookies optionnel
3. **Feedback utilisateur** : Système de collecte d'avis (like/dislike)
4. **Page de prévisualisation** : Vue fullscreen dédiée (WIP)

---

## 2. Architecture technique

### Flux de données

```
Backend API
    ↓
OfferResponseV2.video
    ├── id: string (YouTube Video ID)
    ├── title?: string (Titre de la vidéo)
    ├── thumbUrl?: string (URL miniature YouTube)
    └── durationSeconds?: number (Durée en secondes)
    ↓
Offer.tsx (Page principale)
    ↓
OfferContent.tsx (Conteneur responsive)
    ↓
OfferBody.tsx (Intégration des sections)
    ↓
VideoSection.tsx (Section vidéo)
    ├── YoutubePlayer (avec consentement)
    ├── GatedVideoSection (sans consentement)
    └── FeedBackVideo (après lecture)
```

### Composants React clés

#### VideoSection
**Localisation** : `/src/features/offer/components/OfferContent/VideoSection/VideoSection.tsx`

Conteneur principal qui orchestre :
- L'affichage du lecteur YouTube ou de la section de consentement
- La gestion de l'état de lecture
- L'intégration du système de feedback

**Props principales** :
- `videoId` : Identifiant YouTube de la vidéo
- `title` : Titre affiché
- `offerId` : ID de l'offre (pour analytics)
- `hasVideoCookiesConsent` : État du consentement
- `duration` : Durée en secondes
- `playerRatio` : Ratio d'affichage (défaut: 16:9)

#### YoutubePlayer
**Localisation** : `/src/features/home/components/modules/video/YoutubePlayer/YoutubePlayer.tsx`

Lecteur vidéo avec gestion de la miniature et de la lecture.

**Comportement** :
1. Affiche une miniature (PlayerPreview) par défaut
2. Au clic sur play → charge et lance le lecteur YouTube
3. Utilise `react-native-youtube-iframe` (mobile) ou `react-youtube` (web)

#### GatedVideoSection
**Localisation** : `/src/features/offer/components/OfferContent/VideoSection/GatedVideoSection.tsx`

Écran de consentement affiché quand l'utilisateur n'a pas accepté les cookies vidéo.

**Contenu** :
- Miniature de la vidéo (désactivée)
- Message : "En visionnant cette vidéo, tu t'engages à accepter les cookies liés à Youtube."
- Bouton "Voir la vidéo" (accepte les cookies + lance la lecture)
- Bouton "Gérer mes cookies" (redirection vers les paramètres)

#### FeedBackVideo
**Localisation** : `/src/features/offer/components/OfferContent/VideoSection/FeedBackVideo.tsx`

Système de collecte de feedback utilisateur.

**Fonctionnement** :
1. Affiche la question : "Trouves-tu le contenu de cette vidéo utile ?"
2. Deux boutons : "Oui" / "Non"
3. Enregistre la réaction dans AsyncStorage
4. Affiche un lien vers un questionnaire Qualtrics selon la réaction

---

## 3. Parcours utilisateur

### Cas 1 : Utilisateur avec consentement cookies

```
1. Utilisateur arrive sur la fiche offre
2. Scroll jusqu'à la section vidéo
3. Voit la miniature avec un bouton play et la durée
4. Clique sur play ou sur la miniature
   → Event analytics `logConsultVideo` envoyé
5. Le lecteur YouTube se charge et lance la vidéo automatiquement
6. Utilisateur regarde la vidéo (contrôles YouTube natifs)
7. À la fin ou après visionnage :
   → Section feedback apparaît
   → Peut réagir "Oui" (utile) ou "Non" (pas utile)
8. Si réaction positive ou négative :
   → Message de remerciement
   → Lien vers questionnaire Qualtrics détaillé
```

### Cas 2 : Utilisateur sans consentement cookies

```
1. Utilisateur arrive sur la fiche offre
2. Scroll jusqu'à la section vidéo
3. Voit la miniature (grisée/désactivée)
4. Voit le message de consentement
5. Deux choix :

   A. Clique "Voir la vidéo"
      → Cookies vidéo acceptés automatiquement
      → Lecteur s'active
      → Même flux que Cas 1 (étape 5)

   B. Clique "Gérer mes cookies"
      → Redirection vers Profil > Paramètres > Gestion des cookies
      → Peut accepter/refuser catégorie "Vidéo"
      → Retour à la fiche offre
```

### Interactions disponibles

**Sur la miniature (avant lecture)** :
- Clic sur le bouton play central
- Clic n'importe où sur la miniature
- Affichage de la durée (coin supérieur droit)
- Affichage du titre (bas de la miniature)

**Dans le lecteur YouTube (pendant lecture)** :
- Play / Pause
- Barre de progression
- Volume
- Paramètres (qualité, vitesse)
- Sous-titres (si disponibles)
- Mode plein écran
- Partage (selon paramètres d'embed YouTube)

**Système de feedback** :
- Bouton "Oui" (réaction positive)
- Bouton "Non" (réaction négative)
- Lien vers questionnaire (après réaction)
- Une seule réaction possible par offre

---

## 4. Gestion du consentement cookies

### Catégorie de cookie

- **Nom** : `VIDEO_PLAYBACK`
- **Catégorie** : `video`
- **Type** : Cookie optionnel (non essentiel)
- **Finalité** : Permettre la lecture de vidéos YouTube embarquées

### Vérification du consentement

Le consentement est vérifié à trois niveaux :

1. **Dans Offer.tsx** :
```typescript
const hasVideoCookiesConsent =
  cookiesConsent.state === ConsentState.HAS_CONSENT &&
  cookiesConsent.value.accepted.includes(CookieNameEnum.VIDEO_PLAYBACK)
```

2. **Transmission dans OfferContent.tsx** : Propagé via props

3. **Utilisation dans VideoSection.tsx** : Détermine quel composant afficher

### Acceptation du consentement

#### Depuis le bouton "Voir la vidéo"

```typescript
const handleOnVideoConsentPress = () => {
  const currentConsent = cookiesConsent.value ?? {
    accepted: [],
    mandatory: [],
    refused: []
  }

  setCookiesConsent({
    ...currentConsent,
    accepted: [...currentConsent.accepted, CookieNameEnum.VIDEO_PLAYBACK],
  })
}
```

**Effet immédiat** :
- Cookie `VIDEO_PLAYBACK` ajouté aux cookies acceptés
- VideoSection affiche le lecteur YouTube
- Vidéo lance automatiquement

#### Depuis les paramètres

Navigation vers : `ProfileStackNavigator > ConsentSettings`

L'utilisateur peut :
- Voir toutes les catégories de cookies
- Activer/désactiver la catégorie "Vidéo"
- Sauvegarder ses préférences
- Retourner à la fiche offre (consentement appliqué)

### RGPD et conformité

- **Opt-in obligatoire** : Vidéo ne charge pas sans consentement explicite
- **Information claire** : Message expliquant l'engagement avant lecture
- **Facilité de gestion** : Accès direct aux paramètres de cookies
- **Persistance** : Consentement sauvegardé entre les sessions
- **Révocabilité** : Utilisateur peut retirer son consentement à tout moment

---

## 5. Système de feedback

### Objectif

Mesurer la pertinence et l'utilité des vidéos pour améliorer la sélection de contenu.

### Question posée

> "Trouves-tu le contenu de cette vidéo utile ?"

### Réponses possibles

1. **"Oui"** → Réaction `LIKE`
2. **"Non"** → Réaction `DISLIKE`

### Traitement des réactions

#### Enregistrement local

Stockage dans AsyncStorage avec la clé : `feedback_reaction_{offerId}`

```typescript
await AsyncStorage.setItem(`feedback_reaction_${offerId}`, reactionType)
```

**Effet** :
- Une seule réaction possible par offre
- Réaction persistante entre les sessions
- Boutons masqués après réaction

#### Event analytics

Envoi d'un event `VALIDATE_REACTION` :

```typescript
analytics.logValidateReaction({
  offerId: number,
  reactionType: 'LIKE' | 'DISLIKE',
  from: 'OFFER_VIDEO_SURVEY',
  userId?: number,
})
```

### Questionnaires Qualtrics

Après réaction, un lien vers un questionnaire détaillé est affiché :

**Réaction positive (LIKE)** :
- URL : `https://passculture.qualtrics.com/jfe/form/SV_238Dd248lT6UuJE?subcategory={subcategoryId}`
- Objectif : Comprendre ce qui a plu

**Réaction négative (DISLIKE)** :
- URL : `https://passculture.qualtrics.com/jfe/form/SV_3lb1IPodkGiMzWe?subcategory={subcategoryId}`
- Objectif : Identifier les axes d'amélioration

**Paramètre transmis** :
- `subcategory` : Sous-catégorie de l'offre (pour segmentation des résultats)

### UX du feedback

1. **Affichage** : Juste en-dessous du lecteur vidéo
2. **Timing** : Visible dès que le lecteur est chargé (pas besoin d'attendre la fin)
3. **Persistance** : Message "Merci" + lien questionnaire affiché jusqu'à navigation
4. **Réinitialisation** : Réaction effacée si utilisateur quitte la page ou met l'app en arrière-plan

---

## 6. Analytics et tracking

### Event principal : `logConsultVideo`

**Déclenché** : Au moment où l'utilisateur clique sur play

**Paramètres** :
```typescript
{
  from: 'offer',              // Source de la consultation
  offerId: string,            // ID de l'offre
  youtubeId?: string,         // ID YouTube (optionnel)
  moduleId?: string,          // Pour home modules
  homeEntryId?: string,       // Pour home entry
}
```

**Fichiers concernés** :
- `VideoSection.tsx:58`
- `OfferVideoPreview.tsx:37`

**Firebase Event Name** : `CONSULT_VIDEO`

### Event de feedback : `logValidateReaction`

**Déclenché** : Quand l'utilisateur clique sur "Oui" ou "Non"

**Paramètres** :
```typescript
{
  offerId: number,
  reactionType: 'LIKE' | 'DISLIKE' | 'NO_REACTION',
  from: 'OFFER_VIDEO_SURVEY',
  userId?: number,
}
```

**Fichier concerné** :
- `FeedBackVideo.tsx:50`

**Firebase Event Name** : `VALIDATE_REACTION`

### Event général : `logConsultWholeOffer`

Envoyé quand l'utilisateur scroll jusqu'en bas de la fiche offre (pas spécifique vidéo mais peut indiquer que la vidéo a été vue dans le contexte global).

### Métriques d'intérêt

**Performance vidéo** :
- Taux de clic sur play (impressions vidéo / clics)
- Taux de réaction (vues / réactions)
- Ratio réactions positives / négatives

**Impact business** :
- Corrélation entre visionnage vidéo et réservation
- Taux de complétion de l'offre après vidéo
- Engagement moyen sur fiche avec vidéo vs sans vidéo

**RGPD** :
- Taux d'acceptation des cookies vidéo
- Taux d'abandon après message de consentement

---

## 7. Règles métier et conditions d'affichage

### Conditions obligatoires

Pour qu'une section vidéo s'affiche, **TOUTES** les conditions suivantes doivent être réunies :

#### 1. Présence d'une vidéo dans les données offre

```typescript
offer.video?.id // Doit être défini et non vide
```

L'ID YouTube doit être présent dans la réponse API de l'offre.

#### 2. Feature flag activé

```typescript
useFeatureFlag(RemoteStoreFeatureFlags.WIP_OFFER_VIDEO_SECTION) === true
```

Le feature flag `WIP_OFFER_VIDEO_SECTION` doit être activé.

#### 3. Segment AB testing (si activé)

```typescript
if (enableVideoABTesting) {
  segment === 'A' // Utilisateur doit être dans le segment A
}
```

Si le flag `ENABLE_VIDEO_AB_TESTING` est activé, seuls les utilisateurs du segment 'A' voient la vidéo.

### Logique d'affichage dans le code

**Fichier** : `OfferBody.tsx`

```typescript
{offer.video?.id && isVideoSectionEnabled ? (
  <VideoSection
    videoId={offer.video.id}
    videoThumbnail={<VideoThumbnailImage url={offer.video.thumbUrl ?? ''} />}
    title={offer.video?.title ?? offer.name}
    duration={offer.video.durationSeconds}
    offerId={offer.id}
    offerSubcategory={offer.subcategoryId}
    hasVideoCookiesConsent={hasVideoCookiesConsent}
    onManageCookiesPress={handleManageCookiesPress}
    onVideoConsentPress={handleOnVideoConsentPress}
    userId={userId}
  />
) : null}
```

### Calcul du flag `isVideoSectionEnabled`

**Fichier** : `OfferContent.tsx`

```typescript
const enableVideoABTesting = useFeatureFlag(
  RemoteStoreFeatureFlags.ENABLE_VIDEO_AB_TESTING
)
const segment = useABSegment()
const showVideoSection = useFeatureFlag(
  RemoteStoreFeatureFlags.WIP_OFFER_VIDEO_SECTION
)

const isVideoSectionEnabled =
  showVideoSection &&
  (!enableVideoABTesting || segment === 'A')
```

### Sélection du contenu vidéo

**Titre de la vidéo** :
- Priorité 1 : `offer.video.title` (si défini)
- Fallback : `offer.name` (nom de l'offre)

**Miniature** :
- Source : `offer.video.thumbUrl`
- Fallback : Miniature YouTube par défaut (générée automatiquement)

**Durée** :
- Format stocké : `offer.video.durationSeconds` (nombre de secondes)
- Format affiché : Converti en `MM:SS` via `formatDuration(durationSeconds, 'sec')`

### Limitations techniques

1. **YouTube uniquement** : Pas de support Vimeo, Dailymotion, etc.
2. **Vidéos embedables** : La vidéo doit autoriser l'embedding
3. **Vidéos publiques** : Pas de support pour vidéos privées/unlisted avec restriction
4. **Pas de playlist** : Une seule vidéo par offre

---

## 8. Spécifications techniques

### Responsive design

#### Ratio d'aspect

**Défaut** : 16:9 (ratio standard YouTube)

```typescript
const RATIO169 = 9 / 16 // Hauteur / Largeur
```

#### Dimensions

**Largeur maximale** : 540px (constante `MAX_WIDTH_VIDEO`)

**Calcul de la hauteur** :
```typescript
const videoHeight = Math.min(viewportWidth, maxWidth) * playerRatio
```

**Exemple** :
- Sur mobile (375px de large) : hauteur = 375 * (9/16) = 211px
- Sur tablette (768px de large) : hauteur = 540 * (9/16) = 304px
- Sur desktop (1920px de large) : hauteur = 540 * (9/16) = 304px

#### Adaptations selon plateforme

**Mobile (iOS/Android)** :
- Divider de section affiché
- Player pleine largeur (dans la limite de 540px)
- Contrôles YouTube natifs optimisés tactile

**Desktop (Web)** :
- Pas de divider de section
- Player centré avec max-width 540px
- Contrôles YouTube natifs web

### Technologies utilisées

#### Mobile (React Native)

**Package** : `react-native-youtube-iframe`

**Composant** : `YoutubeIframeRef`

**Paramètres d'initialisation** :
```typescript
{
  autoplay: true,
  controls: true,
  rel: false,         // Pas de vidéos recommandées à la fin
  showinfo: false,    // Pas d'info supplémentaire
  modestbranding: true // Logo YouTube discret
}
```

#### Web (React)

**Package** : `react-youtube`

**Composant** : `YouTube`

**Options** :
```typescript
{
  playerVars: {
    autoplay: 1,
    controls: 1,
    rel: 0,
    modestbranding: 1
  }
}
```

### États du lecteur

Définis dans `constants.ts` :

| Code | État | Description |
|------|------|-------------|
| `-1` | `UNSTARTED` | Vidéo non démarrée |
| `0` | `ENDED` | Lecture terminée |
| `1` | `PLAYING` | En cours de lecture |
| `2` | `PAUSED` | En pause |
| `3` | `BUFFERING` | Chargement en cours |
| `5` | `VIDEO_CUED` | Vidéo préparée (prête) |

### Erreurs gérées

| Code | Type | Description |
|------|------|-------------|
| `2` | `INVALID_PARAMETER` | Paramètre invalide (ex: mauvais ID) |
| `5` | `HTML5_ERROR` | Erreur HTML5 player |
| `100` | `VIDEO_NOT_FOUND` | Vidéo introuvable |
| `101` | `EMBED_NOT_ALLOWED` | Embed désactivé par le propriétaire |
| `150` | `EMBED_NOT_ALLOWED` | Embed désactivé (autre code) |

**Gestion** : Erreurs loggées mais pas d'affichage d'erreur utilisateur (la miniature reste affichée).

### Performance

**Lazy loading** : Le lecteur YouTube ne charge que lorsque l'utilisateur clique sur play (économise la bande passante).

**Cache miniatures** : Les miniatures YouTube sont mises en cache par le CDN YouTube.

**Pas de préchargement** : La vidéo ne précharge pas automatiquement (respecte la data de l'utilisateur).

---

## 9. Feature flags et AB testing

### Feature flag principal : `WIP_OFFER_VIDEO_SECTION`

**Objectif** : Contrôler le déploiement progressif de la fonctionnalité vidéo

**Impact** :
- Si `false` : Aucune section vidéo affichée, même si `offer.video.id` existe
- Si `true` : Section vidéo affichée selon les autres conditions

**Utilisation** :
- Déploiement progressif par plateforme (ex: Web d'abord, puis iOS, puis Android)
- Rollback rapide en cas de problème
- Test en production sur un échantillon d'utilisateurs

### AB testing : `ENABLE_VIDEO_AB_TESTING`

**Objectif** : Mesurer l'impact des vidéos sur l'engagement et les conversions

**Configuration** :
- Si `false` : Tous les utilisateurs voient la vidéo (si feature flag activé)
- Si `true` : Seulement le segment 'A' voit la vidéo

**Segmentation** :
- Segment 'A' : Vidéo affichée (groupe test)
- Segment 'B' : Pas de vidéo (groupe contrôle)
- Répartition : 50/50 (typiquement)

**Métriques à comparer** :
- Taux de réservation (segment A vs B)
- Temps passé sur la fiche offre
- Taux de scroll complet
- Taux de rebond

**Fichiers concernés** :
- `OfferContent.tsx` : Lecture du flag et du segment
- `OfferBody.tsx` : Application de la logique d'affichage

### Page de prévisualisation : `WIP_OFFER_VIDEO_PREVIEW`

**Objectif** : Tester une page dédiée en plein écran pour la vidéo

**État** : Work In Progress (WIP)

**Navigation** :
```typescript
navigation.navigate('OfferVideoPreview', { id: offerId })
```

**Utilisation** : Permet un visionnage immersif sans distractions

---

## 10. Points d'attention

### Sécurité et conformité

✅ **RGPD** : Consentement obligatoire avant chargement YouTube
✅ **Cookies tiers** : Gérés via le système de consentement
✅ **Données utilisateur** : Pas de transmission d'infos personnelles à YouTube
✅ **Contenu approprié** : Responsabilité du créateur d'offre (validation métier)

### UX / Accessibilité

⚠️ **Pas de sous-titres forcés** : Dépend de la vidéo YouTube
⚠️ **Contraste** : Vérifier le contraste du bouton play sur miniatures sombres
⚠️ **Navigation clavier** : À tester sur web (contrôles YouTube natifs)
⚠️ **Screen readers** : Vérifier l'annonce de la vidéo et des contrôles

### Performance

✅ **Lazy loading** : Lecteur charge uniquement au clic
✅ **Pas d'impact initial** : Miniature légère (image statique)
⚠️ **Data usage** : Informer l'utilisateur (consommation data mobile)
⚠️ **Autoplay** : Se déclenche au clic (pas automatique au scroll)

### Edge cases

❌ **Vidéo supprimée** : Erreur 100/101 → miniature reste affichée
❌ **Embed désactivé** : Erreur 101/150 → miniature reste affichée
❌ **Connexion lente** : Buffering géré par YouTube
❌ **Pas de connexion** : Erreur de chargement YouTube standard
❌ **ID YouTube invalide** : Erreur 2 → miniature reste affichée

### Maintenance

🔧 **Dépendances externes** :
- `react-native-youtube-iframe` (mobile)
- `react-youtube` (web)
- API YouTube IFrame (tier)

🔧 **Monitoring** :
- Taux d'erreur de chargement
- Taux d'abandons sur consentement
- Performance de lecture

🔧 **Évolutions potentielles** :
- Support d'autres plateformes vidéo (Vimeo, etc.)
- Playlists vidéo
- Chapitres / timestamps
- Picture-in-picture
- Téléchargement offline (pour abonnés Premium ?)

---

## Annexes

### Fichiers sources principaux

**Pages** :
- `/src/features/offer/pages/Offer/Offer.tsx`
- `/src/features/offer/pages/OfferVideoPreview/OfferVideoPreview.tsx`

**Composants** :
- `/src/features/offer/components/OfferContent/VideoSection/VideoSection.tsx`
- `/src/features/offer/components/OfferContent/VideoSection/GatedVideoSection.tsx`
- `/src/features/offer/components/OfferContent/VideoSection/FeedBackVideo.tsx`
- `/src/features/home/components/modules/video/YoutubePlayer/YoutubePlayer.tsx`
- `/src/features/home/components/modules/video/PlayerPreview/PlayerPreview.tsx`

**Tests** :
- `/src/features/offer/components/OfferContent/VideoSection/VideoSection.native.test.tsx`
- `/src/features/offer/components/OfferContent/VideoSection/FeedBackVideo.native.test.tsx`

### Glossaire

- **Feature flag** : Interrupteur logiciel pour activer/désactiver une fonctionnalité
- **AB testing** : Méthodologie de test comparant deux variantes
- **Embed** : Intégration d'une vidéo externe dans une page
- **Lazy loading** : Chargement différé d'une ressource
- **AsyncStorage** : Système de stockage local persistant React Native
- **Analytics** : Système de mesure et de tracking des événements
- **Qualtrics** : Plateforme de sondages et questionnaires

---

**Document maintenu par** : Équipe Produit Pass Culture
**Contact** : [À compléter]
**Version** : 1.0

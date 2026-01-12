# [Front] Ajouter le bouton "Se connecter avec Apple" sur l'écran de connexion

## Contexte

L'écran de connexion (`src/features/auth/pages/login/Login.tsx`) dispose déjà d'un bouton "Se connecter avec Google" sous le séparateur "ou".

Nous devons ajouter un bouton Apple en respectant les règles d'Apple qui imposent que le bouton Apple soit placé **au-dessus** du bouton Google sur iOS.

## User Story

En tant que jeune utilisateur iOS de l'app Pass Culture
J'aimerais voir un bouton "Se connecter avec Apple" sur l'écran de connexion
Afin de me connecter rapidement avec mon identifiant Apple sans saisir de mot de passe

## Règles de gestion

### Affichage et positionnement

- Le bouton Apple doit être ajouté **au-dessus** du bouton Google (obligation Apple App Store Review Guidelines - 4.8)
- Le texte du bouton est **"Se connecter avec Apple"** (cohérent avec le wording du bouton Google existant)
- Le bouton doit afficher le logo Apple officiel à gauche du texte
- Le séparateur "ou" reste positionné entre les boutons SSO et le formulaire email/password
- Le bouton doit être visible uniquement sur **iOS 13+** (Sign In with Apple n'est pas disponible sur iOS < 13)
  - Sur iOS < 13 : le bouton n'apparaît pas, seul le bouton Google reste visible

### Style et Design (IMPORTANT - Basé sur les maquettes)

**Light Mode:**
- Fond : **NOIR** (`#000000` ou token équivalent)
- Texte : **BLANC**
- Logo Apple : **BLANC**
- Pas de bordure visible

**Dark Mode:**
- Fond : **BLANC**
- Texte : **NOIR**
- Logo Apple : **NOIR**
- Bordure subtile (utiliser `theme.designSystem.color.border.subtle`)

**Dimensions:**
- Hauteur : identique au bouton Google (utiliser les tokens `theme.buttons.buttonHeights`)
- Largeur : pleine largeur dans le container Form.MaxWidth
- Border radius : `theme.designSystem.size.borderRadius.xl`
- Zone de touch minimum : 44x44pt (WCAG)

### États et interactions

- **État normal** : Bouton actif, fond plein (noir ou blanc selon le theme)
- **Pendant le chargement** (après tap) :
  - Afficher un spinner centré sur le bouton
  - Désactiver le bouton pour éviter les double-clics
  - Le spinner doit être blanc en light mode, noir en dark mode
- **État désactivé** : Utiliser les tokens `theme.designSystem.color.background.disabled`
- Si l'utilisateur tape sur le bouton Apple, puis annule et tape sur le bouton Google immédiatement après, le premier appel Apple doit être annulé/ignoré pour éviter les conflits

### Gestion des erreurs et edge cases

**Connexion internet absente :**
- Si l'utilisateur tape sur le bouton Apple sans connexion internet active, afficher immédiatement un message d'erreur :
  > "Aucune connexion internet. Vérifie ta connexion et réessaie."
- Le bouton ne doit pas passer en état "loading"

**Timeout :**
- Si l'authentification Apple prend plus de 30 secondes, afficher un message d'erreur :
  > "La connexion a pris trop de temps. Réessaie ou utilise une autre méthode."
- Le bouton redevient actif après le timeout

**Annulation utilisateur :**
- Si l'utilisateur annule la fenêtre d'authentification Apple (tap sur "Annuler" dans le prompt iOS), le bouton redevient immédiatement actif **sans message d'erreur**

**Échec de connexion (erreur serveur/réseau) :**
- Afficher le message :
  > "La connexion avec Apple a échoué. Veuillez réessayer."
- Le bouton redevient actif

## Critères d'acceptation

### Scenario 1: Affichage du bouton sur iOS 13+

**Given** je suis sur l'écran de connexion avec un device iOS 13 ou supérieur
**When** l'écran se charge
**Then** je vois le bouton "Se connecter avec Apple" avec le logo Apple
**And** le bouton Apple est positionné au-dessus du bouton "Se connecter avec Google"
**And** le séparateur "ou" est visible entre les boutons SSO et le formulaire email/password
**And** le bouton respecte les tokens du Design System (hauteur, padding, border-radius)

### Scenario 2: Bouton non visible sur iOS < 13

**Given** je suis sur l'écran de connexion avec un device iOS 12 ou inférieur
**When** l'écran se charge
**Then** je ne vois pas le bouton "Se connecter avec Apple"
**And** je vois uniquement le bouton "Se connecter avec Google"
**And** l'interface reste fonctionnelle et cohérente

### Scenario 3: Tap sur le bouton Apple - État de chargement

**Given** je suis sur l'écran de connexion (iOS 13+) avec connexion internet active
**When** je tape sur "Se connecter avec Apple"
**Then** un spinner s'affiche sur le bouton (blanc en light mode, noir en dark mode)
**And** le bouton est désactivé (état disabled)
**And** je ne peux pas taper à nouveau pendant le chargement

### Scenario 4: Adaptation au mode sombre

**Given** mon device est configuré en mode sombre (Dark Mode activé)
**When** j'ouvre l'écran de connexion
**Then** le bouton Apple s'affiche avec un fond blanc
**And** le texte "Se connecter avec Apple" est en noir
**And** le logo Apple est en noir
**And** une bordure subtile est visible
**And** le contraste respecte les ratios WCAG (4.5:1 minimum)

### Scenario 5: Adaptation au mode clair

**Given** mon device est configuré en mode clair (Light Mode activé)
**When** j'ouvre l'écran de connexion
**Then** le bouton Apple s'affiche avec un fond noir
**And** le texte "Se connecter avec Apple" est en blanc
**And** le logo Apple est en blanc
**And** aucune bordure n'est visible
**And** le contraste respecte les ratios WCAG (4.5:1 minimum)

### Scenario 6: Accessibilité - Lecteur d'écran

**Given** j'utilise VoiceOver sur iOS
**When** je navigue sur l'écran de connexion
**Then** le lecteur d'écran annonce "Se connecter avec Apple, bouton"
**And** la zone de touch du bouton fait au minimum 44x44pt
**And** le bouton est focusable et activable via VoiceOver

### Scenario 7: Absence de connexion internet

**Given** je suis sur l'écran de connexion (iOS 13+) sans connexion internet active
**When** je tape sur "Se connecter avec Apple"
**Then** je vois immédiatement le message d'erreur : "Aucune connexion internet. Vérifie ta connexion et réessaie."
**And** le bouton ne passe pas en état "loading"
**And** le bouton reste actif (pas désactivé)

### Scenario 8: Timeout de l'authentification

**Given** je tape sur "Se connecter avec Apple"
**When** l'authentification prend plus de 30 secondes
**Then** le spinner disparaît
**And** je vois le message d'erreur : "La connexion a pris trop de temps. Réessaie ou utilise une autre méthode."
**And** le bouton redevient actif

### Scenario 9: Annulation par l'utilisateur

**Given** je tape sur "Se connecter avec Apple"
**When** la fenêtre d'authentification Apple s'ouvre et je tape sur "Annuler"
**Then** la fenêtre se ferme
**And** le bouton redevient immédiatement actif
**And** aucun message d'erreur ne s'affiche

### Scenario 10: Changement de SSO pendant l'authentification

**Given** je tape sur "Se connecter avec Apple"
**When** j'annule et je tape immédiatement sur "Se connecter avec Google"
**Then** l'appel Apple est annulé/ignoré
**And** seul l'appel Google est traité
**And** aucun conflit entre les 2 authentifications ne se produit

### Scenario 11: Échec de connexion Apple (erreur serveur)

**Given** je tape sur "Se connecter avec Apple"
**When** l'authentification échoue (erreur réseau ou erreur serveur)
**Then** le spinner disparaît
**And** le bouton redevient actif
**And** un message d'erreur s'affiche : "La connexion avec Apple a échoué. Veuillez réessayer."

## Stratégie technique

### 1. Créer le composant bouton Apple

**Fichier à créer :** `src/features/auth/components/SSOButton/AppleSSOButton.tsx`

```tsx
// Structure similaire à SSOButtonBase mais avec style spécifique Apple
// - Utiliser ButtonPrimary ou créer un ButtonApple dédié
// - Props: type: 'login' | 'signup', onSuccess callback
// - Gérer le style noir/blanc selon le theme
```

**Icône Apple :** `src/ui/svg/icons/socialNetwork/Apple.tsx`
- Créer le composant SVG avec le logo Apple officiel
- Doit s'adapter au theme (blanc en light mode, noir en dark mode)

### 2. Intégrer la librairie Apple Sign In

**Package requis :** `@invertase/react-native-apple-authentication`

**Créer :** `src/libs/react-native-apple-sso/`
- `useAppleLogin.ts` (implementation native iOS)
- `useAppleLogin.web.ts` (implementation web avec Apple JS SDK)
- `configureAppleSignin.ts` (configuration)
- `appleLogout.ts` (déconnexion)

Structure similaire à `src/libs/react-native-google-sso/`

### 3. Modifier Login.tsx

**Fichier :** `src/features/auth/pages/login/Login.tsx`

- Ajouter le feature flag : `const enableAppleSSO = useFeatureFlag(RemoteStoreFeatureFlags.WIP_ENABLE_APPLE_SSO)`
- Afficher les deux boutons (Apple puis Google) si les deux flags sont activés
- Gérer la visibilité conditionnelle selon la version iOS (iOS 13+)
- Ordre d'affichage :
  1. Séparateur "ou"
  2. Bouton Apple (si disponible et activé)
  3. Bouton Google (si activé)

```tsx
{(enableAppleSSO || enableGoogleSSO) && (
  <StyledViewGap gap={4}>
    <SeparatorWithText label="ou" />
    {enableAppleSSO && Platform.OS === 'ios' && Platform.Version >= 13 && (
      <AppleSSOButton type="login" onSuccess={signIn} />
    )}
    {enableGoogleSSO && (
      <SSOButtonBase type="login" onSuccess={signIn} />
    )}
  </StyledViewGap>
)}
```

### 4. Gestion des erreurs

Ajouter dans `handleSigninFailure` les nouveaux codes d'erreur Apple :
- `SSO_APPLE_EMAIL_NOT_FOUND`
- `DUPLICATE_APPLE_ACCOUNT`
- `SSO_APPLE_ACCOUNT_DELETED`
- etc.

### 5. Feature Flag

Ajouter dans `libs/firebase/firestore/types.ts` :
```ts
WIP_ENABLE_APPLE_SSO = 'WIP_ENABLE_APPLE_SSO'
```

### 6. Analytics

Ajouter les events de tracking :
- `logAppleSignInStarted`
- `logAppleSignInSuccess`
- `logAppleSignInFailed`
- `logAppleSignInCancelled`

### 7. Tests

- Tests unitaires du composant `AppleSSOButton`
- Tests d'intégration de l'écran Login avec Apple SSO activé/désactivé
- Tests E2E du flow de connexion Apple
- Tests de non-régression pour le bouton Google existant

## Dépendances techniques

- `@invertase/react-native-apple-authentication`: ^2.x
- Configuration Xcode : Ajouter "Sign In with Apple" capability
- Apple Developer : Configurer Service ID et redirection URLs

## Notes importantes

- ⚠️ Le bouton Apple est **obligatoire au-dessus** du bouton Google selon les guidelines Apple
- ⚠️ Sign In with Apple n'est disponible que sur iOS 13+
- ⚠️ Le style du bouton est inversé par rapport à Google : fond plein (noir/blanc) au lieu de bordure transparente
- ⚠️ Apple impose l'utilisation du logo officiel sans modification
- 🔗 [Apple Human Interface Guidelines - Sign in with Apple](https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple)

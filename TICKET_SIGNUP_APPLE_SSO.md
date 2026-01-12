# [Front] Ajouter le bouton "S'inscrire avec Apple" sur l'écran d'inscription

## Contexte

L'écran d'inscription (`src/features/auth/pages/signup/SetEmail/SetEmail.tsx`) permet actuellement de saisir un email et une checkbox newsletter, avec un bouton "S'inscrire avec Google" en alternative.

Nous devons ajouter le bouton Apple en respectant les règles d'Apple qui imposent que le bouton Apple soit placé **au-dessus** du bouton Google sur iOS.

## User Story

En tant que nouvel utilisateur iOS de l'app Pass Culture
J'aimerais pouvoir démarrer mon inscription avec Apple dès le premier écran
Afin de gagner du temps et ne pas saisir mon email manuellement

## Règles de gestion

### Affichage et positionnement

- Le bouton Apple doit être ajouté **au-dessus** du bouton "S'inscrire avec Google" (obligation Apple App Store Review Guidelines - 4.8)
- Le texte du bouton est **"S'inscrire avec Apple"** (cohérent avec le wording du bouton Google existant)
- Le bouton doit afficher le logo Apple officiel à gauche du texte
- Le séparateur "ou" reste positionné entre les boutons SSO et le formulaire email/checkbox newsletter
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
- Si l'utilisateur annule l'authentification Apple et décide de remplir le formulaire email/newsletter manuel, les 2 méthodes doivent coexister sans conflit. Le formulaire manuel reste fonctionnel même après un échec/annulation de l'inscription Apple

### Gestion des erreurs et edge cases

**Connexion internet absente :**
- Si l'utilisateur tape sur le bouton Apple sans connexion internet active, afficher immédiatement un message d'erreur :
  > "Aucune connexion internet. Vérifie ta connexion et réessaie."
- Le bouton ne doit pas passer en état "loading"

**Timeout :**
- Si l'authentification Apple prend plus de 30 secondes, afficher un message d'erreur :
  > "L'inscription a pris trop de temps. Réessaie ou utilise une autre méthode."
- Le bouton redevient actif après le timeout

**Annulation utilisateur :**
- Si l'utilisateur annule la fenêtre d'authentification Apple (tap sur "Annuler" dans le prompt iOS), le bouton redevient immédiatement actif **sans message d'erreur**
- Le formulaire manuel email/newsletter reste utilisable

**Échec d'inscription (erreur serveur/réseau) :**
- Afficher le message :
  > "L'inscription avec Apple a échoué. Veuillez réessayer."
- Le bouton redevient actif

## Critères d'acceptation

### Scenario 1: Affichage du bouton sur iOS 13+

**Given** je suis sur l'écran d'inscription (étape 1/X) avec un device iOS 13 ou supérieur
**When** l'écran se charge
**Then** je vois le bouton "S'inscrire avec Apple" avec le logo Apple
**And** le bouton Apple est positionné au-dessus du bouton "S'inscrire avec Google"
**And** le séparateur "ou" est visible entre les boutons SSO et le formulaire email/newsletter
**And** le bouton respecte les tokens du Design System (hauteur, padding, border-radius)

### Scenario 2: Bouton non visible sur iOS < 13

**Given** je suis sur l'écran d'inscription avec un device iOS 12 ou inférieur
**When** l'écran se charge
**Then** je ne vois pas le bouton "S'inscrire avec Apple"
**And** je vois uniquement le bouton "S'inscrire avec Google"
**And** l'interface reste fonctionnelle et cohérente

### Scenario 3: Tap sur le bouton Apple - État de chargement

**Given** je suis sur l'écran d'inscription (iOS 13+) avec connexion internet active
**When** je tape sur "S'inscrire avec Apple"
**Then** un spinner s'affiche sur le bouton (blanc en light mode, noir en dark mode)
**And** le bouton est désactivé (état disabled)
**And** je ne peux pas taper à nouveau pendant le chargement

### Scenario 4: Adaptation au mode sombre

**Given** mon device est configuré en mode sombre (Dark Mode activé)
**When** j'ouvre l'écran d'inscription
**Then** le bouton Apple s'affiche avec un fond blanc
**And** le texte "S'inscrire avec Apple" est en noir
**And** le logo Apple est en noir
**And** une bordure subtile est visible
**And** le contraste respecte les ratios WCAG (4.5:1 minimum)

### Scenario 5: Adaptation au mode clair

**Given** mon device est configuré en mode clair (Light Mode activé)
**When** j'ouvre l'écran d'inscription
**Then** le bouton Apple s'affiche avec un fond noir
**And** le texte "S'inscrire avec Apple" est en blanc
**And** le logo Apple est en blanc
**And** aucune bordure n'est visible
**And** le contraste respecte les ratios WCAG (4.5:1 minimum)

### Scenario 6: Accessibilité - Lecteur d'écran

**Given** j'utilise VoiceOver sur iOS
**When** je navigue sur l'écran d'inscription
**Then** le lecteur d'écran annonce "S'inscrire avec Apple, bouton"
**And** la zone de touch du bouton fait au minimum 44x44pt
**And** le bouton est focusable et activable via VoiceOver

### Scenario 7: Absence de connexion internet

**Given** je suis sur l'écran d'inscription (iOS 13+) sans connexion internet active
**When** je tape sur "S'inscrire avec Apple"
**Then** je vois immédiatement le message d'erreur : "Aucune connexion internet. Vérifie ta connexion et réessaie."
**And** le bouton ne passe pas en état "loading"
**And** le bouton reste actif (pas désactivé)

### Scenario 8: Timeout de l'authentification

**Given** je tape sur "S'inscrire avec Apple"
**When** l'authentification prend plus de 30 secondes
**Then** le spinner disparaît
**And** je vois le message d'erreur : "L'inscription a pris trop de temps. Réessaie ou utilise une autre méthode."
**And** le bouton redevient actif

### Scenario 9: Annulation par l'utilisateur

**Given** je tape sur "S'inscrire avec Apple"
**When** la fenêtre d'authentification Apple s'ouvre et je tape sur "Annuler"
**Then** la fenêtre se ferme
**And** le bouton redevient immédiatement actif
**And** aucun message d'erreur ne s'affiche
**And** le formulaire manuel reste fonctionnel si je décide de l'utiliser

### Scenario 10: Changement de SSO pendant l'authentification

**Given** je tape sur "S'inscrire avec Apple"
**When** j'annule et je tape immédiatement sur "S'inscrire avec Google"
**Then** l'appel Apple est annulé/ignoré
**And** seul l'appel Google est traité
**And** aucun conflit entre les 2 authentifications ne se produit

### Scenario 11: Échec d'inscription Apple (erreur serveur)

**Given** je tape sur "S'inscrire avec Apple"
**When** l'authentification échoue (erreur réseau ou erreur serveur)
**Then** le spinner disparaît
**And** le bouton redevient actif
**And** un message d'erreur s'affiche : "L'inscription avec Apple a échoué. Veuillez réessayer."

### Scenario 12: Retour au formulaire manuel après annulation

**Given** je tape sur "S'inscrire avec Apple"
**When** j'annule l'authentification Apple
**And** je décide de remplir manuellement le formulaire email + checkbox newsletter
**Then** le formulaire est fonctionnel
**And** je peux saisir mon email
**And** je peux cocher la checkbox
**And** je peux taper sur "Continuer"
**And** aucun conflit entre l'annulation Apple et le formulaire manuel ne se produit

## Stratégie technique

### 1. Réutiliser le composant bouton Apple (partagé avec Login)

**Fichier à utiliser :** `src/features/auth/components/SSOButton/AppleSSOButton.tsx`

Ce composant doit être créé dans le ticket Login et réutilisé ici :
- Props: `type: 'login' | 'signup'`, `onSuccess` callback, `onFailure` callback
- Gérer le wording dynamiquement : "Se connecter avec Apple" vs "S'inscrire avec Apple"
- Gérer le style noir/blanc selon le theme

### 2. Modifier SetEmail.tsx

**Fichier :** `src/features/auth/pages/signup/SetEmail/SetEmail.tsx`

- Ajouter le feature flag : `const enableAppleSSO = useFeatureFlag(RemoteStoreFeatureFlags.WIP_ENABLE_APPLE_SSO)`
- Afficher les deux boutons (Apple puis Google) si les deux flags sont activés
- Gérer la visibilité conditionnelle selon la version iOS (iOS 13+)
- Ordre d'affichage :
  1. Séparateur "ou"
  2. Bouton Apple (si disponible et activé)
  3. Bouton Google (si activé)

```tsx
{(enableAppleSSO || enableGoogleSSO) && (
  <SSOViewGap gap={4}>
    <SeparatorWithText label="ou" />
    {enableAppleSSO && Platform.OS === 'ios' && Platform.Version >= 13 && (
      <AppleSSOButton
        type="signup"
        onSuccess={(data) => {
          // Navigation vers le flow SSO_STEP_CONFIG
          onSSOEmailNotFoundError()
          goToNextStep({ accountCreationToken: data.accountCreationToken })
        }}
        onFailure={onSSOSignInFailure}
      />
    )}
    {enableGoogleSSO && (
      <SSOButton type="signup" onSignInFailure={onSSOSignInFailure} />
    )}
  </SSOViewGap>
)}
```

### 3. Gestion du flow d'inscription SSO

Le flow d'inscription Apple doit suivre le même schéma que Google :

1. **Cas 1 : Email Apple déjà associé à un compte Pass Culture existant**
   - L'utilisateur est connecté automatiquement (pas de création de compte)
   - Redirection vers l'écran d'accueil

2. **Cas 2 : Email Apple non trouvé dans la base Pass Culture (SSO_EMAIL_NOT_FOUND)**
   - Le backend retourne un `accountCreationToken`
   - Appeler `onSSOEmailNotFoundError()` pour passer au flow SSO
   - Utiliser `SSO_STEP_CONFIG` qui skip l'étape SetPassword :
     - ✅ SetEmail (pré-rempli avec l'email Apple)
     - ❌ SetPassword (skipped car mot de passe géré par Apple)
     - ✅ SetBirthday
     - ✅ AcceptCgu
     - ✅ SignupConfirmationEmailSent

**Fichier :** `src/features/auth/stepConfig.ts` (déjà configuré pour Google, fonctionne pour Apple aussi)

### 4. Gestion des erreurs spécifiques Apple

Ajouter dans `onSSOSignInFailure` callback les nouveaux codes d'erreur Apple :
- `SSO_APPLE_EMAIL_NOT_FOUND` → Démarrer le flow d'inscription SSO
- `DUPLICATE_APPLE_ACCOUNT` → Afficher erreur "Ton compte Apple semble ne pas être valide..."
- `SSO_APPLE_ACCOUNT_DELETED` → Afficher erreur compte supprimé
- `SSO_APPLE_EMAIL_NOT_VALIDATED` → Demander validation email Apple

### 5. Analytics

Ajouter les events de tracking dans `onSSOSignInFailure` et `onSuccess` :
- `logAppleSignUpStarted`
- `logAppleSignUpSuccess`
- `logAppleSignUpFailed`
- `logAppleSignUpCancelled`

### 6. Tests

- Tests unitaires du composant `AppleSSOButton` avec `type="signup"`
- Tests d'intégration de l'écran SetEmail avec Apple SSO activé/désactivé
- Tests E2E du flow d'inscription Apple complet (SetEmail → SetBirthday → AcceptCgu)
- Tests du fallback vers formulaire manuel après annulation
- Tests de non-régression pour le bouton Google existant

## Dépendances

- ⚠️ **Prérequis** : Le ticket Login doit être complété en premier pour créer le composant `AppleSSOButton` réutilisable
- Backend : Les endpoints SSO doivent supporter Apple (codes d'erreur, `accountCreationToken`, etc.)
- `@invertase/react-native-apple-authentication`: ^2.x (installé dans le ticket Login)
- Configuration Xcode : "Sign In with Apple" capability (configuré dans le ticket Login)

## Notes importantes

- ⚠️ Le bouton Apple est **obligatoire au-dessus** du bouton Google selon les guidelines Apple
- ⚠️ Sign In with Apple n'est disponible que sur iOS 13+
- ⚠️ Le style du bouton est inversé par rapport à Google : fond plein (noir/blanc) au lieu de bordure transparente
- ⚠️ Le flow d'inscription Apple skip l'étape SetPassword (utilise `SSO_STEP_CONFIG`)
- ⚠️ Si l'utilisateur annule, il doit pouvoir revenir au formulaire manuel sans problème
- 🔗 [Apple Human Interface Guidelines - Sign in with Apple](https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple)
- 🔗 Code de référence existant : `src/features/auth/pages/signup/SetEmail/SetEmail.tsx` (ligne 67-81 pour le flow Google)

# Feature Flag - Recommandations des Pros

## 🎯 Objectif

Créer un feature flag permettant de contrôler l'activation de la fonctionnalité de recommandations des professionnels (pros) dans l'application, avec possibilité de désactivation via un numéro de version minimum.

## 📋 Contexte

La fonctionnalité de recommandations des pros va être ajoutée prochainement dans l'application. Pour assurer un déploiement progressif et maîtrisé, nous avons besoin d'un feature flag qui permettra de :
- Activer/désactiver la fonctionnalité à distance via Firebase Firestore
- Contrôler l'accès par version d'application (minimalBuildNumber / maximalBuildNumber)
- Désactiver rapidement la feature en cas de problème en production

## ✅ Critères d'acceptation

- [ ] Un nouveau feature flag `WIP_PRO_RECOMMENDATIONS` est ajouté dans l'enum `RemoteStoreFeatureFlags`
- [ ] Le feature flag supporte la configuration `minimalBuildNumber` pour définir la version minimum d'application
- [ ] Le feature flag supporte la configuration `maximalBuildNumber` pour définir la version maximum d'application (optionnel)
- [ ] Le feature flag peut être configuré depuis Firebase Firestore
- [ ] La documentation du feature flag est mise à jour
- [ ] Des tests unitaires couvrent les différents cas d'activation/désactivation selon les versions

## 🛠️ Implémentation technique

### 1. Ajout du feature flag dans l'enum

**Fichier**: `src/libs/firebase/firestore/types.ts`

Ajouter dans l'enum `RemoteStoreFeatureFlags` :
```typescript
WIP_PRO_RECOMMENDATIONS = 'wipProRecommendations',
```

### 2. Configuration Firebase Firestore

**Collection**: `featureFlags`
**Document**: `root`

Structure de configuration recommandée :
```json
{
  "wipProRecommendations": {
    "minimalBuildNumber": 10380000,
    "owner": "decouverte",
    "options": {}
  }
}
```

### 3. Utilisation dans le code

Le feature flag pourra être utilisé dans les composants avec le hook `useFeatureFlag` :

```typescript
import { useFeatureFlag } from 'libs/firebase/firestore/featureFlags/useFeatureFlag'
import { RemoteStoreFeatureFlags } from 'libs/firebase/firestore/types'

const MyComponent = () => {
  const enableProRecommendations = useFeatureFlag(
    RemoteStoreFeatureFlags.WIP_PRO_RECOMMENDATIONS
  )

  if (!enableProRecommendations) {
    return null // ou afficher un contenu alternatif
  }

  return <ProRecommendationsComponent />
}
```

### 4. Tests à ajouter

Créer des tests dans le fichier de tests approprié pour vérifier :
- Feature activée quand la version de l'app >= minimalBuildNumber
- Feature désactivée quand la version de l'app < minimalBuildNumber
- Feature désactivée quand maximalBuildNumber est défini et version > maximalBuildNumber
- Comportement par défaut (désactivée) quand le flag n'existe pas dans Firestore

## 📝 Documentation

### Gestion du feature flag

Le feature flag suit le même pattern que les autres feature flags de l'application :

- **Activation progressive** : Augmenter progressivement le `minimalBuildNumber` pour activer sur des versions plus anciennes
- **Désactivation d'urgence** : Mettre `minimalBuildNumber` à une valeur très élevée (ex: 99999999) pour désactiver complètement
- **Désactivation pour une plage de versions** : Utiliser `maximalBuildNumber` pour cibler une plage spécifique

### Exemples de configuration

**Activation pour toutes les versions > 1.380.0** :
```json
{
  "wipProRecommendations": {
    "minimalBuildNumber": 10380000
  }
}
```

**Désactivation complète** :
```json
{
  "wipProRecommendations": {
    "minimalBuildNumber": 99999999
  }
}
```

**Activation uniquement pour les versions 1.380.0 à 1.390.0** :
```json
{
  "wipProRecommendations": {
    "minimalBuildNumber": 10380000,
    "maximalBuildNumber": 10390000
  }
}
```

## 🔍 Points d'attention

1. **Préfixe WIP** : Le feature flag commence par `WIP_` car la fonctionnalité est en cours de développement
2. **Ownership** : Définir l'équipe propriétaire (squad) dans la configuration Firestore
3. **Version de référence** : Le format de version suit le pattern : `version 1.X.Y` → `build number 10XY000X`
4. **Cache** : Les feature flags sont cachés 24h côté client, prévoir ce délai pour les changements
5. **Fallback** : Par défaut, si Firestore est inaccessible, le feature flag retourne `false` (désactivé)

## 🔗 Références

- Documentation feature flags : `src/libs/firebase/firestore/featureFlags/`
- Enum des feature flags : `src/libs/firebase/firestore/types.ts`
- Hook d'utilisation : `src/libs/firebase/firestore/featureFlags/useFeatureFlag.ts`
- Tests de référence : `src/libs/firebase/firestore/featureFlags/useFeatureFlag.native.test.ts`

## 📊 Estimation

- **Complexité** : Faible (pattern existant à suivre)
- **Temps estimé** : 1-2h (ajout flag + tests + documentation)

## 🏷️ Labels suggérés

- `feature-flag`
- `infrastructure`
- `pro-recommendations`
- `squad:decouverte`

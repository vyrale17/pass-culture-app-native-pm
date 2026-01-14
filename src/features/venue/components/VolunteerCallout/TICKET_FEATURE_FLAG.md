# Ticket - Feature Flag Bénévolat

## Contexte

La fonctionnalité de valorisation du bénévolat permet d'afficher un callout visible dans l'onglet "Informations pratiques" des partenaires proposant des opportunités de bénévolat, avec redirection vers jeveuxaider.gouv.fr.

**Objectif du Feature Flag :**
- Permettre l'activation/désactivation de la fonctionnalité en production sans redéploiement
- Tester progressivement sur un échantillon d'utilisateurs avant un déploiement complet
- Désactiver rapidement en cas de problème (dégradation de performance, taux de clic très faible)
- Permettre un A/B test pour mesurer l'impact réel

**Contexte technique :**
- Le code frontend est déjà implémenté et déployé
- Le backend doit exposer les champs `hasVolunteerOpportunities` et `volunteerUrl`
- Le callout s'affiche uniquement si `hasVolunteerOpportunities === true` ET si le feature flag est activé

## User Story

**En tant que** Product Manager

**Je veux** pouvoir activer/désactiver le callout bénévolat via un feature flag

**Afin de** :
- Contrôler le déploiement progressif de la fonctionnalité
- Réagir rapidement en cas de problème
- Mesurer l'impact avec un A/B test
- Activer la fonctionnalité uniquement quand tous les éléments sont prêts (backend, Contentful, partenaires identifiés)

## Règles de Gestion

### RG1 - Nom du Feature Flag
- **Nom** : `WIP_ENABLE_VOLUNTEER_CALLOUT`
- **Type** : Boolean
- **Valeur par défaut** : `false` (désactivé par défaut)

### RG2 - Portée du Feature Flag
Le feature flag contrôle :
- ✅ L'affichage du callout bénévolat dans `PracticalInformation`
- ✅ L'affichage du composant `VolunteerInterestFeedback` (si `showVolunteerInterestFeedback = true`)
- ✅ Le tracking des événements analytics associés
- ❌ N'impacte PAS les appels API backend (les champs sont toujours récupérés)

### RG3 - Logique d'affichage

Le callout bénévolat s'affiche SI ET SEULEMENT SI :
1. `WIP_ENABLE_VOLUNTEER_CALLOUT === true` (feature flag activé)
2. **ET** `venue.hasVolunteerOpportunities === true` (données backend)
3. **ET** l'utilisateur est dans l'onglet "Infos pratiques" d'une venue

Si le feature flag est à `false`, le callout ne s'affiche jamais, même si `hasVolunteerOpportunities === true`.

### RG4 - Stratégie de Rollout

**Phase 1 - Pilote (10% des utilisateurs)**
- Activation progressive sur 10% des utilisateurs
- Durée : 1 semaine
- Monitoring intensif des métriques

**Phase 2 - Élargissement (50% des utilisateurs)**
- Si métriques OK (taux de clic > 0.5%, pas de dégradation perf)
- Durée : 1 semaine

**Phase 3 - Déploiement complet (100%)**
- Si goal atteint ou en bonne voie (taux de clic vers 2%)
- Feature flag reste actif pour pouvoir désactiver si besoin

### RG5 - Analytics

Les événements analytics ne sont envoyés que si :
- Le feature flag est activé **ET** le callout est affiché

Si le feature flag est désactivé, aucun événement `VOLUNTEER_CALLOUT_*` n'est envoyé.

### RG6 - Feedback utilisateur optionnel

Le composant `VolunteerInterestFeedback` peut être activé/désactivé via un paramètre **indépendant** du feature flag principal :
- Paramètre : `showVolunteerInterestFeedback` (props du composant)
- Peut être utilisé pour un A/B test : callout seul vs callout + feedback

### RG7 - Cas de désactivation d'urgence

Le feature flag doit être désactivé si :
- Temps de chargement page venue > 2 secondes (dégradation perf)
- Taux de fermeture du callout > 80% (perçu comme intrusif)
- Bug critique remonté par les utilisateurs
- URL jeveuxaider.gouv.fr indisponible

## Acceptance Criteria

### AC1 - Feature Flag désactivé par défaut

**Given** le feature flag `WIP_ENABLE_VOLUNTEER_CALLOUT` est à `false` (valeur par défaut)

**When** un utilisateur consulte l'onglet "Infos pratiques" d'un partenaire ayant `hasVolunteerOpportunities = true`

**Then** le callout bénévolat ne s'affiche pas

**And** aucun événement analytics `VOLUNTEER_CALLOUT_*` n'est envoyé

**And** les autres sections de "Infos pratiques" s'affichent normalement

---

### AC2 - Feature Flag activé + Venue avec bénévolat

**Given** le feature flag `WIP_ENABLE_VOLUNTEER_CALLOUT` est à `true`

**And** une venue a `hasVolunteerOpportunities = true`

**When** un utilisateur consulte l'onglet "Infos pratiques" de cette venue

**Then** le callout bénévolat s'affiche en haut de l'onglet

**And** le callout affiche le texte "Wahou ce partenaire propose du bénévolat !"

**And** un lien "En savoir plus" est présent

**And** un bouton de fermeture (X) est visible

---

### AC3 - Feature Flag activé + Venue sans bénévolat

**Given** le feature flag `WIP_ENABLE_VOLUNTEER_CALLOUT` est à `true`

**And** une venue a `hasVolunteerOpportunities = false` ou `hasVolunteerOpportunities` non défini

**When** un utilisateur consulte l'onglet "Infos pratiques" de cette venue

**Then** le callout bénévolat ne s'affiche pas

**And** les autres sections de "Infos pratiques" s'affichent normalement

---

### AC4 - Clic sur le lien "En savoir plus"

**Given** le feature flag `WIP_ENABLE_VOLUNTEER_CALLOUT` est à `true`

**And** le callout bénévolat est affiché

**When** l'utilisateur clique sur "En savoir plus"

**Then** l'utilisateur est redirigé vers `jeveuxaider.gouv.fr` (ou l'URL spécifique `volunteerUrl`)

**And** un événement analytics `VOLUNTEER_CALLOUT_CLICK` est envoyé avec `{ venueId, venueName }`

**And** le lien s'ouvre dans le navigateur externe (pas dans l'app)

---

### AC5 - Fermeture du callout

**Given** le feature flag `WIP_ENABLE_VOLUNTEER_CALLOUT` est à `true`

**And** le callout bénévolat est affiché

**When** l'utilisateur clique sur le bouton de fermeture (X)

**Then** le callout disparaît immédiatement

**And** un événement analytics `VOLUNTEER_CALLOUT_CLOSE` est envoyé avec `{ venueId, venueName }`

**And** le callout ne réapparaît pas lors d'une nouvelle visite de cette page venue (pendant la session)

---

### AC6 - Feedback utilisateur activé

**Given** le feature flag `WIP_ENABLE_VOLUNTEER_CALLOUT` est à `true`

**And** le paramètre `showVolunteerInterestFeedback` est à `true`

**And** le callout bénévolat est affiché

**When** l'utilisateur consulte le callout

**Then** la question "Est-ce que ça t'intéresse ?" s'affiche sous le callout

**And** deux boutons sont visibles : "Ça m'intéresse" et "Pas pour moi"

**When** l'utilisateur clique sur un des boutons

**Then** un événement analytics `VOLUNTEER_INTEREST_FEEDBACK` est envoyé avec `{ venueId, venueName, isInterested: true/false }`

**And** les boutons sont remplacés par le message "Merci pour ton retour !"

---

### AC7 - Performance non dégradée

**Given** le feature flag `WIP_ENABLE_VOLUNTEER_CALLOUT` est à `true`

**And** le callout bénévolat est affiché

**When** on mesure le temps de chargement de la page venue

**Then** le temps de chargement reste < 2 secondes

**And** aucune régression de performance n'est détectée par rapport à la version sans callout

---

### AC8 - Rollout progressif (A/B test)

**Given** le feature flag `WIP_ENABLE_VOLUNTEER_CALLOUT` est configuré pour 10% des utilisateurs

**When** 100 utilisateurs différents consultent une venue avec `hasVolunteerOpportunities = true`

**Then** environ 10 utilisateurs voient le callout

**And** les 90 autres ne le voient pas

**And** un utilisateur reste dans le même groupe tout au long de sa session (sticky bucket)

---

### AC9 - Désactivation d'urgence

**Given** le feature flag `WIP_ENABLE_VOLUNTEER_CALLOUT` est à `true` en production

**And** un problème critique est détecté (perf, bug, etc.)

**When** un admin désactive le feature flag via le dashboard (ex: Firebase Remote Config)

**Then** le callout disparaît immédiatement pour tous les utilisateurs (après refresh)

**And** aucun événement analytics n'est plus envoyé

**And** les venues continuent de s'afficher normalement

---

## Implémentation Technique

### Frontend

```typescript
// Dans PracticalInformation.tsx
import { useFeatureFlag } from 'libs/firebase/remoteConfig/useFeatureFlag'

export const PracticalInformation: FunctionComponent<Props> = ({
  venue,
  enableAccesLibre,
  showVolunteerInterestFeedback = false,
}) => {
  const isVolunteerCalloutEnabled = useFeatureFlag('WIP_ENABLE_VOLUNTEER_CALLOUT')

  const venueWithVolunteer = venue as VenueResponseWithVolunteer
  const hasVolunteerOpportunities =
    venueWithVolunteer.hasVolunteerOpportunities === true

  const shouldShowVolunteerCallout =
    isVolunteerCalloutEnabled && hasVolunteerOpportunities

  return (
    <Container>
      {shouldShowVolunteerCallout ? (
        <VolunteerCallout
          venueId={venue.id}
          venueName={venue.publicName ?? venue.name}
          volunteerUrl={venueWithVolunteer.volunteerUrl}
          showInterestFeedback={showVolunteerInterestFeedback}
        />
      ) : null}
      {/* ... reste du code */}
    </Container>
  )
}
```

### Configuration Remote Config

**Firebase Remote Config / Contentful / autre système :**

```json
{
  "WIP_ENABLE_VOLUNTEER_CALLOUT": {
    "type": "boolean",
    "defaultValue": false,
    "description": "Active le callout bénévolat dans les pages partenaires",
    "rolloutStrategy": "percentage",
    "rolloutPercentage": 0
  }
}
```

### Analytics

Tous les événements doivent inclure le statut du feature flag :

```typescript
analytics.logVolunteerCalloutClick({
  venueId,
  venueName,
  featureFlagEnabled: true
})
```

## Tests

### Tests unitaires
- [ ] Test avec feature flag à `false` → callout non affiché
- [ ] Test avec feature flag à `true` + `hasVolunteerOpportunities = true` → callout affiché
- [ ] Test avec feature flag à `true` + `hasVolunteerOpportunities = false` → callout non affiché
- [ ] Test analytics envoyés uniquement si feature flag activé

### Tests E2E
- [ ] Parcours complet avec feature flag désactivé
- [ ] Parcours complet avec feature flag activé (clic, fermeture, feedback)
- [ ] Vérification performance (temps de chargement < 2s)

## Monitoring

**Dashboard à créer :**
- Taux d'activation du feature flag (% d'utilisateurs)
- Taux de clic sur le callout (parmi ceux qui le voient)
- Taux de fermeture du callout
- Temps de chargement page venue (avec/sans callout)
- Feedback utilisateur (si activé) : ratio intéressé/pas intéressé

**Alertes :**
- ⚠️ Temps de chargement > 2s
- ⚠️ Taux de clic < 0.2% après 1 semaine
- ⚠️ Taux de fermeture > 80%
- 🚨 Crash rate augmente après activation du feature flag

## Dépendances

- ✅ Code frontend (composants React)
- 🔴 Hook `useFeatureFlag` (si pas déjà existant)
- 🔴 Configuration Firebase Remote Config (ou équivalent)
- 🔴 Backend : champs `hasVolunteerOpportunities` et `volunteerUrl`
- 🔴 Dashboard monitoring

## Timeline

| Tâche | Durée |
|-------|-------|
| Implémentation hook feature flag | 0.5j |
| Intégration dans PracticalInformation | 0.5j |
| Tests unitaires | 0.5j |
| Tests E2E | 1j |
| Configuration Remote Config | 0.5j |
| Dashboard monitoring | 1j |
| **TOTAL** | **4j** |

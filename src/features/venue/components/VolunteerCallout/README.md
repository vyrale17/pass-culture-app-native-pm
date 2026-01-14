# Volunteer Callout - Valorisation du Bénévolat

## 📋 Description

Cette fonctionnalité permet de mettre en avant les partenaires proposant des opportunités de bénévolat dans l'application Pass Culture. Elle affiche un callout visible dans l'onglet "Informations pratiques" des venues concernées.

## 🎯 Objectifs

- Mieux valoriser les partenaires proposant du bénévolat (au-delà d'une simple URL)
- Mesurer l'appétence des jeunes pour le bénévolat en production
- Rediriger les utilisateurs vers jeveuxaider.gouv.fr
- Optionnellement : collecter des retours qualitatifs avec la question "Est-ce que ça t'intéresse ?"

## 🏗️ Architecture

### Composants

1. **VolunteerCallout** (`VolunteerCallout.tsx`)
   - Affiche un banner avec icône, texte accrocheur et lien externe
   - Bouton de fermeture pour masquer le callout
   - Option pour afficher le feedback utilisateur
   - Tracking analytics des interactions

2. **VolunteerInterestFeedback** (`VolunteerInterestFeedback.tsx`)
   - Composant optionnel de feedback
   - Question "Est-ce que ça t'intéresse ?"
   - Boutons "Ça m'intéresse" / "Pas pour moi"
   - Message de remerciement après réponse

### Types

Extension du type `VenueResponse` dans `src/features/venue/types.ts` :

```typescript
export interface VenueResponseWithVolunteer extends BaseVenueResponse {
  hasVolunteerOpportunities?: boolean
  volunteerUrl?: string
}
```

**Note** : Ces champs devront être ajoutés côté backend. En attendant, cette extension TypeScript permet de préparer le frontend.

### Analytics

Trois événements sont trackés :

1. **VOLUNTEER_CALLOUT_CLICK** : Clic sur le lien "En savoir plus"
   - Paramètres : `venueId`, `venueName`

2. **VOLUNTEER_CALLOUT_CLOSE** : Fermeture du callout
   - Paramètres : `venueId`, `venueName`

3. **VOLUNTEER_INTEREST_FEEDBACK** : Réponse à la question d'intérêt
   - Paramètres : `venueId`, `venueName`, `isInterested`

## 🚀 Utilisation

### Intégration dans PracticalInformation

Le composant est automatiquement affiché si `venue.hasVolunteerOpportunities === true` :

```typescript
<PracticalInformation
  venue={venue}
  enableAccesLibre={true}
  showVolunteerInterestFeedback={false} // optionnel, false par défaut
/>
```

### Paramètres

- `venue` : Objet venue avec potentiellement les champs `hasVolunteerOpportunities` et `volunteerUrl`
- `showVolunteerInterestFeedback` : Active/désactive la question de feedback (défaut: `false`)

### Exemple de données

```typescript
const venue: VenueResponseWithVolunteer = {
  id: 123,
  name: "Bibliothèque Municipale",
  publicName: "Biblio Centre",
  hasVolunteerOpportunities: true,
  volunteerUrl: "https://jeveuxaider.gouv.fr",
  // ... autres champs standard
}
```

## 📊 Mesure de l'impact

### Métriques principales

1. **Nombre de clics** sur le lien "En savoir plus"
   - Event : `VOLUNTEER_CALLOUT_CLICK`
   - Permet de mesurer l'intérêt direct

2. **Taux de fermeture** du callout
   - Event : `VOLUNTEER_CALLOUT_CLOSE`
   - Indique si le callout est perçu comme intrusif

3. **Feedback qualitatif** (si activé)
   - Event : `VOLUNTEER_INTEREST_FEEDBACK`
   - Ratio intéressé / pas intéressé

### Dashboard Analytics

Les événements peuvent être consultés dans Firebase Analytics / Amplitude avec les filtres :
- `VOLUNTEER_CALLOUT_*`
- Groupés par `venueId` ou `venueName`

## 🎨 Design

### Callout
- **Type** : Banner de type INFO (fond bleu clair)
- **Icône** : Ampoule (Bulb) - symbolise l'opportunité
- **Titre** : "Wahou ce partenaire propose du bénévolat !"
- **Description** : "Découvre les opportunités de bénévolat disponibles"
- **CTA** : "En savoir plus" (lien externe)
- **Fermeture** : Bouton X en haut à droite

### Feedback (optionnel)
- Affiché sous le callout si activé
- Question en gras : "Est-ce que ça t'intéresse ?"
- Deux boutons : "Ça m'intéresse" (primaire) / "Pas pour moi" (secondaire)
- Message de remerciement après interaction

## 🔧 Backend Requirements

Pour activer cette fonctionnalité en production, le backend doit :

1. Ajouter les champs à l'API `/venues/{id}` :
   ```json
   {
     "hasVolunteerOpportunities": boolean,
     "volunteerUrl": string (optionnel, défaut: "https://jeveuxaider.gouv.fr")
   }
   ```

2. Permettre le filtrage des venues avec bénévolat dans Contentful/Algolia pour créer des playlists

## 📝 Contentful Integration

Pour créer des playlists de partenaires proposant du bénévolat :

1. Ajouter un tag `volunteer` ou `benevol` dans Contentful
2. Utiliser le filtre dans les modules de playlist :
   ```typescript
   {
     activities: ['...'],
     tags: ['volunteer']
   }
   ```

## 🧪 Tests

### Tests manuels

1. Créer une venue mock avec `hasVolunteerOpportunities: true`
2. Naviguer vers l'onglet "Infos pratiques"
3. Vérifier l'affichage du callout
4. Cliquer sur "En savoir plus" → vérifier la redirection
5. Cliquer sur X → vérifier la fermeture
6. Activer `showVolunteerInterestFeedback` → tester les boutons de feedback

### Tests unitaires à créer

- [ ] `VolunteerCallout.test.tsx`
- [ ] `VolunteerInterestFeedback.test.tsx`
- [ ] Analytics tracking tests

## 🚧 TODO Backend

- [ ] Ajouter `hasVolunteerOpportunities` au modèle Venue
- [ ] Ajouter `volunteerUrl` (optionnel) au modèle Venue
- [ ] Permettre le filtrage par tag "volunteer" dans l'API de recherche
- [ ] Intégration Contentful pour les playlists

## 📞 Contact

Pour toute question sur cette fonctionnalité :
- PM : Thomas (design)
- Dev : Équipe Pass Culture App Native

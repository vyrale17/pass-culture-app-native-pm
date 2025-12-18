# Documentation : Affichage des artistes sur l'app Jeune

## **Récupération et exposition des données artistes**

### **Sources de données**

Il y a **deux sources distinctes** pour les artistes d'une offre :

| **Source** | **Table** | **Quand utilisée ?** | **Exemple** |
| --- | --- | --- | --- |
| **Artistes du produit** | `ArtistProductLink` | Offre **avec** produit (`offer.product != null`) | Film "Parasite" → Réalisateur + acteurs du film |
| **Artistes de l'offre** | `ArtistOfferLink` | Offre **sans** produit (`offer.product == null`) | Festival Vieilles Charrues → Line-up saisi par le pro |

### **Logique de sélection (côté backend)**

**Règle d'exclusion mutuelle** :

1. **Si l'offre a un produit associé** (`offer.product != null`)
   → Retourner **UNIQUEMENT** les artistes du produit (via `ArtistProductLink`)

2. **Si l'offre n'a pas de produit** (`offer.product == null`)
   → Retourner **UNIQUEMENT** les artistes liés directement à l'offre (via `ArtistOfferLink`)

**Règle métier clé** :

- ❌ On ne fusionne **jamais** les deux sources
- ✅ C'est soit l'une, soit l'autre (exclusion mutuelle)

**Pourquoi ?**

Selon les specs de l'équipe Pro : *"Seules les offres non liées à un produit peuvent être liées à un artiste"*

Cela signifie qu'un partenaire culturel qui veut créer un événement avec des invités spéciaux (ex: avant-première avec le réalisateur) doit créer une **offre spéciale sans produit** et ajouter manuellement tous les artistes.

**Cas d'usage concrets** :

| **Cas** | **Type d'offre** | **Source artistes** | **Exemple** |
| --- | --- | --- | --- |
| Film standard | Offre synchronisée avec produit | `product.artists` | "Parasite" → Bong Joon Ho, acteurs du film |
| Avant-première | Offre spéciale sans produit | `offer.artists` | Projection + débat → artistes ajoutés manuellement |
| Concert | Offre synchronisée avec produit | `product.artists` | "Katy Perry Live" → Katy Perry |
| Festival | Offre sans produit | `offer.artists` | Vieilles Charrues → line-up complet saisi par le pro |
| Atelier | Offre sans produit | `offer.artists` | Cours de peinture → intervenant saisi par le pro |

---

## **Format exposé par l'API**

### **Endpoint**

```
GET /native/v1/offer/<offer_id>
```

### **Champ ajouté : `artists`**

Liste d'objets représentant les artistes de l'offre.

**Structure de chaque artiste** :

| **Champ** | **Type** | **Description** | **Exemple** |
| --- | --- | --- | --- |
| `id` | `string` ou `null` | Identifiant de l'artiste. `null` si artiste custom (non référencé) | `"456"` ou `null` |
| `name` | `string` | Nom de l'artiste | `"Katy Perry"` |
| `image` | `string` ou `null` | URL de la photo de l'artiste. `null` si custom ou pas de photo | `"https://storage.passculture.app/artists/katy-perry.jpg"` |
| `role` | `string` | Rôle de l'artiste (enum) | `"PERFORMER"`, `"STAGE_DIRECTOR"`, `"AUTHOR"`, etc. |

### **Exemple de réponse API**

**Cas 1 : Offre avec produit (film "Parasite")**

```json
{
  "id": "123",
  "name": "Parasite",
  "artists": [
    {
      "id": "artist-uuid-1",
      "name": "Bong Joon Ho",
      "image": "https://storage.passculture.app/artists/bong-joon-ho.jpg",
      "role": "STAGE_DIRECTOR"
    },
    {
      "id": "artist-uuid-2",
      "name": "Song Kang-ho",
      "image": "https://storage.passculture.app/artists/song-kang-ho.jpg",
      "role": "PERFORMER"
    }
  ]
}
```

**Cas 2 : Offre sans produit (avant-première avec invité)**

```json
{
  "id": "456",
  "name": "Avant-première Parasite + débat",
  "artists": [
    {
      "id": "artist-uuid-1",
      "name": "Bong Joon Ho",
      "image": "https://storage.passculture.app/artists/bong-joon-ho.jpg",
      "role": "STAGE_DIRECTOR"
    },
    {
      "id": null,
      "name": "Invité surprise",
      "image": null,
      "role": "SPEAKER"
    }
  ]
}
```

---

## **Filtrage des artistes blacklistés**

**Règle** : Les artistes avec le champ `is_blacklisted = true` sont **automatiquement exclus** de la réponse API.

**Où ?** Côté backend, avant de retourner la liste au frontend.

**Sources concernées** : Le filtrage s'applique aux **deux sources** de données :
- Artistes du produit (via `ArtistProductLink`)
- Artistes de l'offre (via `ArtistOfferLink`)

---

## **Gestion des artistes custom (non référencés)**

Les partenaires culturels peuvent saisir des artistes qui ne sont **pas dans la base pass Culture** (artistes locaux, émergents, guides touristiques, invités surprise).

| **Champ** | **Artiste référencé** | **Artiste custom** |
| --- | --- | --- |
| `id` | `"123"` (identifiant unique) | `null` |
| `name` | Nom provenant de la table `Artist` | Valeur du champ `custom_name` |
| `image` | URL de la photo | `null` |
| `role` | Rôle défini | Rôle défini |

**Règle technique** :

Si le champ `ArtistOfferLink.artist_id` est `null`, alors on utilise le champ `ArtistOfferLink.custom_name` comme nom de l'artiste.

**Contrainte base de données** : `(artist_id IS NOT NULL) XOR (custom_name IS NOT NULL)`

---

## **Ordre des artistes retournés**

**Règle** : L'ordre suit la **priorité métier** définie dans la base de données.

- **Pour les offres avec produit** : Ordre défini dans la table `ArtistProductLink`
- **Pour les offres sans produit** : Ordre de saisie par le partenaire culturel (ordre d'insertion dans `ArtistOfferLink`)

---

## **Distinction "de" vs "Avec" selon le rôle**

### **Règle de mapping**

| **Préfixe** | **Rôles concernés (valeur du champ `role`)** | **Usage linguistique** | **Exemple** |
| --- | --- | --- | --- |
| **"de"** | `AUTHOR`, `STAGE_DIRECTOR`, `SPEAKER` | Créateur, concepteur, auteur de l'œuvre | "de Bong Joon Ho" (réalisateur)<br>"de Molière" (auteur)<br>"de Laurent Hopman" (intervenant) |
| **"Avec"** | `PERFORMER` | Interprète, performer, exécutant | "Avec Katy Perry" (interprète)<br>"Avec Song Kang-ho" (acteur) |

### **⚠️ Enums en cours d'ajout**

Certains types d'artistes utilisent actuellement des enums **temporaires** en attendant la création de nouveaux enums côté backend :

| **Rôle réel** | **Enum actuel** | **Enum futur** | **Préfixe** | **Statut** |
| --- | --- | --- | --- | --- |
| Auteur | `AUTHOR` ✅ | `AUTHOR` | "de" | Existe |
| Réalisateur (film) | `STAGE_DIRECTOR` ⚠️ | `DIRECTOR` | "de" | En attente |
| Metteur en scène (théâtre) | `STAGE_DIRECTOR` ✅ | `STAGE_DIRECTOR` | "de" | Existe |
| Compositeur | `AUTHOR` ⚠️ | `COMPOSER` | "de" | En attente |
| Scénariste | `AUTHOR` ⚠️ | `SCREENWRITER` | "de" | En attente |
| Intervenant | `SPEAKER` ✅ | `SPEAKER` | "de" | Existe |
| Interprète | `PERFORMER` ✅ | `PERFORMER` | "Avec" | Existe |
| Acteur | `PERFORMER` ⚠️ | `ACTOR` | "Avec" | En attente |
| Musicien | `PERFORMER` ⚠️ | `MUSICIAN` | "Avec" | En attente |

**Impact actuel** :
- Impossible de distinguer un compositeur d'un auteur de livre
- Impossible de distinguer un acteur d'un interprète musical
- Un réalisateur de film et un metteur en scène de théâtre partagent le même enum

**Évolution** : Ces nouveaux enums seront créés dans une prochaine version après validation backend.

### **Logique appliquée côté frontend**

Le frontend **reçoit le champ `role`** depuis l'API et applique le mapping ci-dessus pour déterminer le préfixe à afficher.

**Pourquoi cette distinction ?**

- **Clarté** : Permet de distinguer immédiatement le créateur des interprètes
- **Convention culturelle** : Usage français naturel ("un film **de** Spielberg **avec** Tom Hanks")

---

## **Affichage condensé selon le nombre d'artistes**

### **Objectif**

Limiter l'espace occupé sur mobile tout en restant informatif.

### **Règles d'affichage**

| **Nombre d'artistes** | **Affichage** | **Chevron** | **Exemple** |
| --- | --- | --- | --- |
| **0 artiste** | Section masquée | Non | *(rien)* |
| **1 artiste référencé** (`id != null`) | "de/Avec [Artiste]" | Oui 〉 | "de Bong Joon Ho 〉" |
| **1 artiste custom** (`id == null`) | "de/Avec [Artiste]" | Oui 〉 | "de Intervenant local 〉" |
| **2 artistes** | "de/Avec [A1], [A2]" | Oui 〉 | "Avec Katy Perry, Gims 〉" |
| **3+ artistes** | "de/Avec [A1], [A2] et X autres" | Oui 〉 | "Avec Katy Perry, Gims et 8 autres 〉" |

### **Limites d'affichage**

- **Maximum 2 artistes affichés en clair** par ligne
- **Maximum 2 lignes** par section artiste
- **Crop intelligent** : Si un nom dépasse 2 lignes → ellipsis `...`
    - ⚠️ Seulement les **noms d'artistes** sont croppés
    - ✅ Les préfixes "de", "Avec" et le texte "et X autres" ne sont **jamais croppés** (restent toujours lisibles)

### **Calcul du compteur "et X autres"**

**Formule** : `X = nombre total d'artistes - 2 artistes affichés`

**Exemple** : 10 artistes → "Avec [A1], [A2] et **8** autres"

---

## **Patterns d'affichage par type d'offre**

| **Type d'offre** | **Pattern d'affichage** | **Exemple** |
| --- | --- | --- |
| **Cinéma** | "de [Réalisateur]" 〉<br>"Avec [Acteurs]" 〉 | "de Bong Joon Ho" 〉<br>"Avec Song Kang-ho, Lee Sun-kyun et 5 autres" 〉 |
| **Livre / BD** | "de [Auteur]" 〉 | "de Haruki Murakami" 〉 |
| **Musique enregistrée** | "de [Artiste/Auteur]" 〉 | "de Katy Perry" 〉 |
| **Musique live (concert)** | "Avec [Interprète]" 〉 | "Avec Katy Perry" 〉 |
| **Musique live (classique)** | "de [Compositeur]" 〉<br>"Avec [Interprète]" 〉 | "de Mozart" 〉<br>"Avec Orchestre Philharmonique" 〉 |
| **Spectacle vivant** | "de [Metteur en scène]" 〉<br>"Avec [Comédiens]" 〉 | "de Thomas Ostermeier" 〉<br>"Avec Isabelle Huppert" 〉 |
| **Pratique artistique** | "de [Intervenant]" 〉 | "de Laurent Hopman" 〉 |
| **Festival** | "Avec [Line-up]" 〉 | "Avec Katy Perry, Gims et 12 autres" 〉 |
| **Musée (exposition)** | "de [Artiste exposé]" 〉 | "de Picasso" 〉 |

---

## **Comportement du clic (navigation conditionnelle)**

### **Règle générale**

| **Situation** | **Comportement au clic** | **Raison** |
| --- | --- | --- |
| **1 seul artiste référencé** (champ `id != null`) | Navigation directe vers la page artiste | Pas d'ambiguïté, gain de temps pour l'utilisateur |
| **1 seul artiste custom** (champ `id == null`) | Ouverture de la modal (artiste non cliquable) | Pas de page artiste disponible |
| **2+ artistes** | Ouverture de la modal avec liste complète | Besoin de choisir quel artiste consulter |

### **Exemples**

**Scénario 1** : `"de Bong Joon Ho 〉"` (1 artiste référencé)
- Clic → Navigation directe vers la page artiste de Bong Joon Ho

**Scénario 2** : `"de Intervenant local 〉"` (1 artiste custom)
- Clic → Ouverture de la modal affichant l'artiste non cliquable

**Scénario 3** : `"Avec Katy Perry, Gims et 8 autres 〉"` (10 artistes)
- Clic → Ouverture de la modal affichant les 10 artistes

### **Détermination de la cliquabilité**

Le frontend vérifie le champ `id` de l'artiste :

- Si `id != null` → Artiste référencé → Peut naviguer vers sa page
- Si `id == null` → Artiste custom → Pas de page disponible (non cliquable dans la modal)

---

## **Modal liste complète des artistes**

### **Déclenchement**

**Condition** : Clic sur une ligne affichant **2+ artistes** ou **1 artiste custom**

**Type de modal** : Bottom sheet (animation slide up depuis le bas)

**Pourquoi bottom sheet ?** Pattern natif iOS/Android familier pour les utilisateurs

### **Structure de la modal**

| **Élément** | **Description** |
| --- | --- |
| **Titre** | "Artistes" (affiché en haut de la modal) |
| **Bouton fermeture** | Croix (×) en haut à droite |
| **Liste** | Tous les artistes de l'offre, sans limite de nombre |
| **Format** | Liste unique continue (pas de sections séparées par rôle) |
| **Ordre** | Ordre retourné par l'API (ordre de priorité métier) |
| **Scroll** | Si la liste dépasse la hauteur de l'écran → scroll vertical |

### **Éléments affichés pour chaque artiste**

- **Avatar rond** : Photo de l'artiste si le champ `image` est renseigné, sinon placeholder générique
- **Nom de l'artiste** en bold (champ `name`)
- **Chevron 〉** à droite **uniquement si** le champ `id != null` (indique que l'artiste est cliquable)

### **Cliquabilité conditionnelle**

**Règle** : Seuls les artistes **référencés** (avec un `id`) sont cliquables

| **Type d'artiste** | **Champ `id`** | **Champ `custom_name`** | **Cliquable ?** | **Chevron affiché ?** | **Raison** |
| --- | --- | --- | --- | --- | --- |
| **Référencé** | `"123"` | `null` | ✅ Oui | ✅ Oui | A une page artiste dédiée dans l'app |
| **Custom** | `null` | `"John Doe"` | ❌ Non | ❌ Non | Artiste saisi manuellement, pas de page disponible |

### **Exemple visuel de la modal**

```
┌─────────────────────────────────────────────┐
│  Artistes                              × │
├─────────────────────────────────────────────┤
│                                             │
│  [👤] Bong Joon Ho                      〉  │
│                                             │
│  [👤] Song Kang-ho                      〉  │
│                                             │
│  [👤] Lee Sun-kyun                      〉  │
│                                             │
│  [👤] Cho Yeo-jeong                     〉  │
│                                             │
│  [👤] Invité surprise                       │  ← Pas de chevron (custom)
│                                             │
└─────────────────────────────────────────────┘
```

### **Fermeture de la modal**

**Actions possibles** :

| **Action** | **Description** |
| --- | --- |
| Clic sur croix (×) | Bouton de fermeture explicite en haut à droite |
| Swipe down | Geste natif iOS/Android (glisser vers le bas) |
| Clic sur backdrop | Clic sur la zone sombre derrière la modal |
| Touche Escape | Pour les utilisateurs avec clavier (accessibilité) |
| Navigation vers page artiste | Clic sur un artiste cliquable → ferme la modal et navigue |

---

## **Récapitulatif des règles métier**

### ✅ Ce qui est implémenté

- [x] Récupération des artistes depuis 2 sources (`ArtistProductLink` ou `ArtistOfferLink`)
- [x] **Exclusion mutuelle** : jamais de fusion des deux sources
- [x] Ajout du champ `role` dans l'API
- [x] Distinction "de" vs "Avec" selon le rôle
- [x] Affichage condensé avec "et X autres"
- [x] Modal avec liste complète
- [x] Cliquabilité conditionnelle (référencé vs custom)
- [x] Filtrage automatique des artistes blacklistés

### ⏳ En attente (enums manquants)

- [ ] Création de `DIRECTOR` (réalisateur film)
- [ ] Création de `COMPOSER` (compositeur)
- [ ] Création de `SCREENWRITER` (scénariste)
- [ ] Création de `ACTOR` (acteur)
- [ ] Création de `MUSICIAN` (musicien)

---

## **Glossaire**

| **Terme** | **Définition** |
| --- | --- |
| **Offre** | Proposition culturelle (place de cinéma, billet de concert, atelier, etc.) |
| **Produit** | Œuvre culturelle (film, album, livre, spectacle) référencée dans la base |
| **Artiste référencé** | Artiste provenant de la base Wikidata (avec ID unique) |
| **Artiste custom** | Artiste ajouté manuellement par un pro (sans ID Wikidata) |
| **Exclusion mutuelle** | Règle qui empêche de combiner deux sources de données (soit l'une, soit l'autre) |
| **Bottom sheet** | Modal native qui slide depuis le bas de l'écran |
| **Blacklisté** | Artiste marqué comme interdit d'affichage (filtrage automatique) |

---

**Version** : 1.1
**Date** : Décembre 2024
**Statut** : ✅ Validé avec règle d'exclusion mutuelle

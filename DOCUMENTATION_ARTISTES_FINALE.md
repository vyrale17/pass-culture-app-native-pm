# Documentation : Affichage des artistes sur l'app Jeune

## 🎯 Vue d'ensemble

Cette documentation explique comment les artistes sont récupérés et affichés sur l'app pass Culture côté Jeune, suite à la nouvelle fonctionnalité développée par l'équipe Pro permettant d'ajouter des artistes directement sur les offres.

---

## 📊 Sources de données

Les artistes d'une offre peuvent provenir de **2 sources différentes** :

### Source 1 : Artistes du produit (existant)
- **Table** : `ArtistProductLink`
- **Cas d'usage** : Offres synchronisées (films, albums, livres, spectacles)
- **Exemple** : Film "Inception" → artistes = Christopher Nolan, Leonardo DiCaprio, Marion Cotillard

### Source 2 : Artistes de l'offre (nouveau)
- **Table** : `ArtistOfferLink`
- **Cas d'usage** : Offres spéciales créées manuellement par les pros
- **Exemple** : Avant-première avec invité → le pro ajoute manuellement le réalisateur + l'invité surprise

---

## 🔄 Règle de gestion : Exclusion mutuelle

**Règle critique** : Une offre affiche **soit** les artistes du produit, **soit** les artistes ajoutés manuellement, **jamais les deux**.

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Si offre liée à un produit                            │
│  ├─> Afficher les artistes du PRODUIT                  │
│  └─> Ignorer les artistes de l'offre (si existants)    │
│                                                         │
│  Si offre SANS produit                                 │
│  ├─> Afficher les artistes de l'OFFRE                  │
│  └─> Pas d'artistes de produit (le produit n'existe pas)│
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Pourquoi cette règle ?

Selon les specs de l'équipe Pro :
> "Seules les offres non liées à un produit peuvent être liées à un artiste"

**Cas d'usage concret :**
- Un cinéma veut organiser une avant-première avec le réalisateur présent
- Il doit créer une **offre spéciale sans produit**
- Il ajoute manuellement : le réalisateur + les acteurs principaux + l'invité

---

## 🎭 Types d'artistes et affichage

Les artistes sont affichés différemment selon leur **rôle** :

### Préfixe "de" (créateurs)
- Auteur
- Réalisateur
- Metteur en scène
- Compositeur
- Scénariste
- Intervenant

**Exemple d'affichage** : "de Christopher Nolan, Quentin Tarantino et 2 autres"

### Préfixe "Avec" (interprètes)
- Interprète
- Acteur
- Musicien

**Exemple d'affichage** : "Avec Leonardo DiCaprio, Marion Cotillard et 5 autres"

---

## 📱 Affichage sur l'app Jeune

### Format condensé sur la page offre

Les artistes sont affichés de manière condensée avec un maximum de **2 noms visibles** :

```
┌─────────────────────────────────────────────────────┐
│  Page Offre : Inception                             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  de Christopher Nolan  〉                            │
│                                                     │
│  Avec Leonardo DiCaprio, Marion Cotillard et 5... 〉│
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Modal avec liste complète

Quand l'utilisateur clique sur "et 5 autres", une modale s'ouvre avec la liste complète :

```
┌─────────────────────────────────────────────────────┐
│  Interprètes                                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Leonardo DiCaprio  〉  (cliquable → page artiste)   │
│  Marion Cotillard   〉                               │
│  Tom Hardy          〉                               │
│  Cillian Murphy     〉                               │
│  Michael Caine      〉                               │
│  Ellen Page         〉                               │
│  Ken Watanabe       〉                               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Note** : Les artistes avec un `id` sont cliquables et mènent vers leur page dédiée.

---

## 🔌 API et format de données

### Endpoint

```
GET /native/v1/offer/{offer_id}
```

### Réponse API - Structure

```json
{
  "id": "offer-123",
  "name": "Inception",
  "artists": [
    {
      "id": "artist-uuid-1",
      "name": "Christopher Nolan",
      "image": "https://image.url/nolan.jpg",
      "role": "STAGE_DIRECTOR"
    },
    {
      "id": "artist-uuid-2",
      "name": "Leonardo DiCaprio",
      "image": "https://image.url/dicaprio.jpg",
      "role": "PERFORMER"
    }
  ]
}
```

### Champ `role` - Valeurs possibles

| Valeur | Type d'artiste | Affichage |
|--------|----------------|-----------|
| `AUTHOR` | Auteur | "de" |
| `STAGE_DIRECTOR` | Réalisateur / Metteur en scène | "de" |
| `SPEAKER` | Intervenant | "de" |
| `PERFORMER` | Interprète / Acteur / Musicien | "Avec" |

**⚠️ Note** : D'autres valeurs seront ajoutées ultérieurement (DIRECTOR, COMPOSER, SCREENWRITER, ACTOR, MUSICIAN) après validation côté backend.

---

## 📋 Exemples concrets

### Exemple 1 : Film synchronisé (Inception)

**Contexte** :
- Offre liée au produit "Inception" (film)
- Le produit contient déjà tous les artistes

**API appelée** :
```
GET /native/v1/offer/123
```

**Réponse** :
```json
{
  "id": "123",
  "name": "Inception",
  "artists": [
    {
      "id": "nolan-uuid",
      "name": "Christopher Nolan",
      "role": "STAGE_DIRECTOR"
    },
    {
      "id": "dicaprio-uuid",
      "name": "Leonardo DiCaprio",
      "role": "PERFORMER"
    },
    {
      "id": "cotillard-uuid",
      "name": "Marion Cotillard",
      "role": "PERFORMER"
    }
  ]
}
```

**Affichage app** :
```
de Christopher Nolan  〉
Avec Leonardo DiCaprio, Marion Cotillard  〉
```

---

### Exemple 2 : Avant-première avec invité

**Contexte** :
- Offre spéciale créée manuellement (pas de produit)
- Le pro ajoute les artistes à la main, dont un invité surprise

**API appelée** :
```
GET /native/v1/offer/456
```

**Réponse** :
```json
{
  "id": "456",
  "name": "Avant-première Inception avec débat",
  "artists": [
    {
      "id": "nolan-uuid",
      "name": "Christopher Nolan",
      "role": "STAGE_DIRECTOR"
    },
    {
      "id": null,
      "name": "Invité surprise",
      "role": "SPEAKER"
    }
  ]
}
```

**Affichage app** :
```
de Christopher Nolan, Invité surprise  〉
```

**Note** : "Invité surprise" n'a pas d'`id` → il n'est **pas cliquable** (pas de page artiste dédiée).

---

### Exemple 3 : Concert (Katy Perry)

**Contexte** :
- Offre de concert liée au produit "Katy Perry" (artiste)
- Le produit contient l'artiste principal

**API appelée** :
```
GET /native/v1/offer/789
```

**Réponse** :
```json
{
  "id": "789",
  "name": "Concert Katy Perry - Paris",
  "artists": [
    {
      "id": "katy-perry-uuid",
      "name": "Katy Perry",
      "role": "PERFORMER"
    }
  ]
}
```

**Affichage app** :
```
Avec Katy Perry  〉
```

---

### Exemple 4 : Pratique artistique (Cours de peinture)

**Contexte** :
- Offre sans produit (session de cours spécifique)
- Le pro ajoute l'intervenant manuellement

**API appelée** :
```
GET /native/v1/offer/999
```

**Réponse** :
```json
{
  "id": "999",
  "name": "Cours de peinture à l'huile",
  "artists": [
    {
      "id": "painter-uuid",
      "name": "Laurent Hopman",
      "role": "SPEAKER"
    }
  ]
}
```

**Affichage app** :
```
de Laurent Hopman  〉
```

---

## 🗂️ Patterns d'affichage par type d'offre

| Type d'offre | Artistes affichés | Exemple |
|--------------|-------------------|---------|
| **Cinéma** | "de [Réalisateur]" 〉<br>"Avec [Acteurs]" 〉 | "de Christopher Nolan" 〉<br>"Avec Leonardo DiCaprio, Marion..." 〉 |
| **Livre / BD** | "de [Auteur]" 〉 | "de Haruki Murakami" 〉 |
| **Musique enregistrée** | "de [Artiste/Auteur]" 〉 | "de Katy Perry" 〉 |
| **Musique live** | "Avec [Interprète]" 〉<br>ou "de [Compositeur]" + "Avec [Interprète]" | "Avec Katy Perry" 〉<br>ou "de Mozart" + "Avec Orchestre..." 〉 |
| **Spectacle vivant** | "de [Metteur en scène]" 〉<br>"Avec [Comédiens]" 〉 | "de Thomas Ostermeier" 〉<br>"Avec Isabelle Huppert" 〉 |
| **Pratique artistique** | "de [Intervenant]" 〉 | "de Laurent Hopman" 〉 |
| **Festival** | "Avec [Line-up]" 〉 | "Avec Katy Perry, Gims et 12 autres" 〉 |
| **Musée** | "de [Artiste exposé]" 〉 | "de Picasso" 〉 |

---

## 🔍 Flux de données

### Scénario 1 : Offre avec produit

```
┌──────────────┐
│  Pro crée    │
│  une offre   │
│  pour le     │
│  film        │
│  "Inception" │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────┐
│  Base de données                         │
│                                          │
│  Offer                                   │
│  ├─ id: 123                              │
│  ├─ name: "Inception"                    │
│  └─ product_id: 456  ───────────┐        │
│                                 │        │
│  Product (id: 456)              │        │
│  ├─ name: "Inception"  ◀────────┘        │
│  └─ artists:                             │
│      ├─ Christopher Nolan (STAGE_DIR)    │
│      ├─ Leonardo DiCaprio (PERFORMER)    │
│      └─ Marion Cotillard (PERFORMER)     │
└──────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│  API /native/v1/offer/123                │
│                                          │
│  Logique : offer.product existe ?       │
│  ✅ OUI → Retourner product.artists      │
└──────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│  App Jeune                               │
│                                          │
│  Affichage :                             │
│  • "de Christopher Nolan" 〉              │
│  • "Avec Leonardo DiCaprio, Marion..." 〉 │
└──────────────────────────────────────────┘
```

---

### Scénario 2 : Offre sans produit

```
┌──────────────┐
│  Pro crée    │
│  une offre   │
│  spéciale    │
│  "Avant-     │
│  première"   │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────┐
│  Base de données                         │
│                                          │
│  Offer                                   │
│  ├─ id: 456                              │
│  ├─ name: "Avant-première..."            │
│  ├─ product_id: NULL  ◀────── Pas de    │
│  └─ artists:                    produit  │
│      ├─ Christopher Nolan (STAGE_DIR)    │
│      └─ Invité surprise (SPEAKER)        │
│          └─ custom_name (pas d'id)       │
└──────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│  API /native/v1/offer/456                │
│                                          │
│  Logique : offer.product existe ?       │
│  ❌ NON → Retourner offer.artists        │
└──────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│  App Jeune                               │
│                                          │
│  Affichage :                             │
│  • "de Christopher Nolan, Invité..."〉   │
│                                          │
│  Note : "Invité surprise" non cliquable  │
│         (pas d'id)                       │
└──────────────────────────────────────────┘
```

---

## ✅ Règles de cliquabilité des artistes

| Cas | `id` artiste | Cliquable ? | Comportement |
|-----|--------------|-------------|--------------|
| Artiste de Wikidata | UUID valide | ✅ Oui | Ouvre la page artiste |
| Artiste customisé | `null` | ❌ Non | Texte simple, pas de lien |

**Exemple de données** :
```json
{
  "artists": [
    {
      "id": "uuid-123",           // ← Cliquable
      "name": "Nolan"
    },
    {
      "id": null,                 // ← Non cliquable
      "name": "Invité surprise"
    }
  ]
}
```

---

## 🚧 Limitations actuelles et évolutions futures

### Enums de rôles manquants

Actuellement, certains types d'artistes utilisent des enums temporaires :

| Rôle réel | Enum actuel | Enum futur |
|-----------|-------------|------------|
| Compositeur | `AUTHOR` (temporaire) | `COMPOSER` |
| Scénariste | `AUTHOR` (temporaire) | `SCREENWRITER` |
| Acteur | `PERFORMER` (temporaire) | `ACTOR` |
| Musicien | `PERFORMER` (temporaire) | `MUSICIAN` |
| Réalisateur film | `STAGE_DIRECTOR` (conflit) | `DIRECTOR` |

**Impact** : Pour l'instant, impossible de distinguer :
- Un compositeur d'un auteur de livre
- Un acteur d'un interprète musical
- Un réalisateur de film d'un metteur en scène de théâtre

**Évolution** : Ces enums seront créés dans une prochaine version après validation backend.

---

## 📞 Points de contact

**Équipe Jeune** : Implémente l'affichage sur l'app mobile
**Équipe Pro** : Développe l'interface d'ajout d'artistes pour les structures culturelles
**Équipe Backend** : Gère les APIs et la base de données

---

## 📚 Glossaire

- **Offre** : Proposition culturelle (place de cinéma, billet de concert, atelier, etc.)
- **Produit** : Œuvre culturelle (film, album, livre, spectacle) référencée dans la base
- **Artiste Wikidata** : Artiste provenant de la base Wikidata (avec ID unique)
- **Artiste customisé** : Artiste ajouté manuellement par un pro (sans ID Wikidata)
- **Exclusion mutuelle** : Règle qui empêche de combiner deux sources de données (soit l'une, soit l'autre)
- **ArtistProductLink** : Table reliant un artiste à un produit
- **ArtistOfferLink** : Table reliant un artiste directement à une offre

---

**Version** : 1.0
**Date** : Décembre 2024
**Statut** : ✅ Validé avec règle d'exclusion mutuelle

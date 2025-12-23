# [Back] Gestion multi-sources artistes - Exclusion mutuelle Produit OU Offre

## Contexte

Actuellement, les artistes d'une offre proviennent uniquement du produit associé (film, album, livre).

Avec la nouvelle fonctionnalité Pro, il est possible d'ajouter des artistes directement sur une offre sans produit. Cela permet de gérer :
- Festivals avec line-up spécifique
- Avant-premières avec invités spéciaux
- Pratiques artistiques avec intervenant

L'endpoint doit récupérer les artistes depuis 2 sources possibles :
1. **Artistes du produit** via `ArtistProductLink` (existant)
2. **Artistes de l'offre** via `ArtistOfferLink` (nouveau)

---

## User Story

**En tant qu'** utilisateur
**J'aimerais** voir les artistes associés à une offre (du produit OU spécifiques à l'offre)
**Afin d'** avoir l'information complète sur qui sera présent/impliqué

---

## Règles de gestion

### ⚠️ EXCLUSION MUTUELLE (confirmée avec équipe Pro)

**Règle principale** :
- Si offre **avec produit** → retourner UNIQUEMENT `product.artists`
- Si offre **sans produit** → retourner UNIQUEMENT `offer.artists`
- **JAMAIS** les deux sources en même temps

### Justification

Specs équipe Pro : *"Seules les offres non liées à un produit peuvent être liées à un artiste"*

Un pro qui veut ajouter des invités doit créer une offre spéciale sans produit et ajouter manuellement tous les artistes.

### Cas d'usage

| Cas | Source | Exemple |
|-----|--------|---------|
| Offre synchronisée (film, concert) | `product.artists` | Film "Inception" → artistes du produit |
| Offre spéciale (festival, atelier) | `offer.artists` | Avant-première → artistes saisis par le pro |

---

## Modifications techniques

### 1. Query dans `get_offer_details`

**Fichier** : `api/src/pcapi/core/offers/repository.py#L375`

**Action** :
- Ajouter les jointures pour charger `offer.artist_links` en plus de `product.artist_links`
- Vérifier le nom exact de la relation côté `Offer` (probablement `artist_links`)

---

### 2. Serializer `BaseOfferResponseGetterDict`

**Fichier** : `api/src/pcapi/routes/native/v1/serialization/offers.py#L287`

**Action** :
- Implémenter la logique d'exclusion mutuelle : `if offer.product:` retourner product.artists, `else:` retourner offer.artists
- Filtrer les artistes blacklistés (uniquement pour `product.artists`)
- Gérer les artistes customisés (quand `artist_id` est null, utiliser `custom_name`)

---

### 3. Règle de cliquabilité des artistes

**✅ Règle confirmée** :

> Un artiste avec un `id` a toujours une page artiste. Un artiste sans `id` (saisi manuellement) n'en a pas.

**Conclusion** :
- ❌ Pas besoin du champ `hasArtistPage` (serait redondant)
- ✅ Le frontend utilise simplement `id != null` pour déterminer la cliquabilité

**Logique frontend** :
- Si `id != null` → Artiste référencé → Afficher chevron + permettre navigation
- Si `id === null` → Artiste custom → Pas de chevron, texte simple

---

## Structure de réponse API

**Endpoint** : `GET /native/v1/offer/<offer_id>`

### Champs pour chaque artiste

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `string` ou `null` | ID artiste ou null si custom. Frontend utilise `id != null` pour la cliquabilité |
| `name` | `string` | Nom de l'artiste |
| `image` | `string` ou `null` | URL photo |
| `role` | `string` | Type d'artiste (AUTHOR, STAGE_DIRECTOR, PERFORMER, SPEAKER) |

### Exemples de réponses

**Exemple 1 : Offre avec produit**

```json
{
  "id": "123",
  "artists": [
    {
      "id": "uuid-nolan",
      "name": "Christopher Nolan",
      "image": "https://...",
      "role": "STAGE_DIRECTOR"
    },
    {
      "id": "uuid-dicaprio",
      "name": "Leonardo DiCaprio",
      "image": "https://...",
      "role": "PERFORMER"
    }
  ]
}
```

**Exemple 2 : Offre sans produit**

```json
{
  "id": "456",
  "artists": [
    {
      "id": "789",
      "name": "Quentin Tarantino",
      "image": "https://...",
      "role": "DIRECTOR"
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

**Note** : Le frontend détermine la cliquabilité avec `id != null`. Pas besoin de champ supplémentaire.

---

## Tests à ajouter

**Fichier** : `api/tests/routes/native/v1/offers_test.py`

### Test 1 : Exclusion mutuelle
- Créer une offre avec produit + artistes du produit
- Ajouter aussi des artistes sur l'offre directement
- Vérifier que seuls les artistes du produit sont retournés

### Test 2 : Offre sans produit
- Créer une offre sans produit
- Ajouter des artistes (référencés + custom)
- Vérifier que les artistes de l'offre sont retournés
- Vérifier que `id` est null pour les artistes custom

### Test 3 : Blacklistés
- Vérifier que les artistes blacklistés sont filtrés (product.artists uniquement)

---

## Sandbox

**Fichier** : `api/src/pcapi/sandboxes/scripts/creators/test_cases/__init__.py#L292`

**Action** :
- Enrichir `create_artists()` avec 2 cas de test :
  1. Offre avec produit (ex: film "Inception")
  2. Offre sans produit (ex: avant-première spéciale avec invité custom)

---

## Validation PM

✅ **Offre avec produit** :
- [ ] Seuls les artistes du produit s'affichent
- [ ] Les artistes ajoutés sur l'offre (si existants) ne s'affichent PAS

✅ **Offre sans produit** :
- [ ] Les artistes ajoutés manuellement s'affichent
- [ ] Les artistes custom (sans ID) s'affichent correctement

✅ **Affichage frontend** :
- [ ] Artistes avec `role = AUTHOR/STAGE_DIRECTOR/SPEAKER` → "de [X]"
- [ ] Artistes avec `role = PERFORMER` → "Avec [Y]"
- [ ] Artistes avec `id != null` → chevron + cliquable (navigation vers page artiste)
- [ ] Artistes avec `id === null` (custom) → pas de chevron, non cliquable

---

## Dépendances

- 🔗 Dépend du Ticket 1 (champ `role` doit être implémenté d'abord)
- ⚠️ Coordination avec équipe Pro pour vérifier la contrainte d'exclusion mutuelle

---

## Résumé

| Fichier | Modification |
|---------|-------------|
| `repository.py#L375` | Ajouter jointures `offer.artist_links` |
| `serialization/offers.py#L287` | Logique exclusion mutuelle (if offer.product) |
| `offers_test.py` | 3 tests (exclusion, sans produit, blacklistés) |
| `sandboxes/creators` | 2 cas de test |

---

## Points d'attention

1. **Nom de la relation** : Vérifier le nom exact `Offer.artist_links` dans le modèle (pourrait être `artists` ou `offer_artists`)

2. **Edge case** : Comportement si un artiste est à la fois dans `product.artists` et `offer.artists` (normalement bloqué côté Pro par la contrainte d'exclusion mutuelle)

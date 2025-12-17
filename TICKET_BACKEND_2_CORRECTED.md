# [Back] Gestion multi-sources artistes - Exclusion mutuelle Produit OU Offre

## Contexte

Actuellement, les artistes d'une offre proviennent **uniquement du produit** (ex : film, album, livre) associé à l'offre.

Avec la nouvelle fonctionnalité proposée aux pros, il est possible d'ajouter des artistes directement sur une offre (sans passer par le produit). Cela permet de gérer des cas spécifiques comme :

- **Offre spéciale sans produit** : Pratique artistique avec intervenant spécifique à la session
- **Événement personnalisé** : Festival avec line-up spécifique à une date/lieu
- **Projection unique** : Avant-première avec invités spéciaux

L'endpoint qui retourne les artistes d'une offre doit maintenant être capable de récupérer les artistes depuis **2 sources possibles** :

1. **Artistes du produit** (source actuelle) → via `ArtistProductLink`
2. **Artistes ajoutés directement sur l'offre** (nouvelle source) → via `ArtistOfferLink`

---

## User Story

**En tant qu'** utilisateur
**J'aimerais** voir les artistes associés à une offre (du produit OU spécifiques à l'offre)
**Afin d'** avoir une information complète sur qui sera présent/impliqué dans cet événement

---

## Règles de gestion

### ⚠️ EXCLUSION MUTUELLE (confirmée avec équipe Pro)

**Règle** : La route `/native/v1/offer/<offer_id>` doit appliquer une **exclusion mutuelle** entre les deux sources d'artistes :

- **Si l'offre est liée à un produit** → retourner **UNIQUEMENT** `product.artists`
- **Si l'offre n'est PAS liée à un produit** → retourner **UNIQUEMENT** `offer.artists`
- **JAMAIS les deux en même temps**

### Cas d'usage

| Cas | Description | Source artistes | Exemple |
|-----|-------------|-----------------|---------|
| **Offre synchronisée** | Offre liée à un produit (film, album, livre) | `product.artists` | Film "Inception" → Nolan, DiCaprio, etc. |
| **Offre spéciale** | Offre créée manuellement sans produit | `offer.artists` | Avant-première avec guest → artistes ajoutés manuellement par le pro |

### ❌ Ce qui n'est PAS permis

- Fusionner `product.artists` + `offer.artists` pour une même offre
- Ajouter des invités supplémentaires sur une offre déjà liée à un produit

### Justification métier

Selon les specs de l'équipe Pro :
> "Seules les offres **non liées à un produit** peuvent être liées à un artiste"

Cela signifie qu'un pro qui veut ajouter un invité spécial (ex: avant-première avec réalisateur) doit créer une **offre spéciale sans produit** et ajouter manuellement tous les artistes (y compris ceux du film).

---

## Stratégie technique

### 1. Modifier la query dans `get_offer_details`

**Fichier** : `api/src/pcapi/core/offers/repository.py#L375`

**Actuellement** :
```python
.options(
    sa_orm.joinedload(models.Offer.product)
        .selectinload(models.Product.artists)
)
```

**À modifier** :
```python
.options(
    # Charger les artistes du produit (si existe)
    sa_orm.joinedload(models.Offer.product)
        .selectinload(models.Product.artist_links)  # ← Récupère ArtistProductLink
        .selectinload(models.ArtistProductLink.artist),

    # Charger les artistes de l'offre (si existe)
    sa_orm.selectinload(models.Offer.artist_links)  # ← Récupère ArtistOfferLink
        .selectinload(models.ArtistOfferLink.artist)
)
```

**⚠️ Note** : Vérifier le nom exact de la relation côté `Offer` (probablement `artist_links` et non `artists`).

### 2. Modifier le getter dans `BaseOfferResponseGetterDict`

**Fichier** : `api/src/pcapi/routes/native/v1/serialization/offers.py#L287`

**Actuellement** :
```python
[OfferArtist.from_orm(artist) for artist in product.artists if not artist.is_blacklisted]
```

**❌ NE PAS FAIRE** (fusion incorrecte) :
```python
# ❌ INCORRECT - FUSION
[OfferArtist.from_orm(artist) for artist in product.artists + offer.artists
 if not artist.is_blacklisted]
```

**✅ À implémenter** (exclusion mutuelle) :
```python
def _get_artists(self, offer: models.Offer) -> list[OfferArtist]:
    """
    Retourne les artistes selon la règle d'exclusion mutuelle :
    - Si produit existe → artistes du produit uniquement
    - Sinon → artistes de l'offre uniquement
    """
    artists = []

    # Cas 1 : Offre avec produit → artistes du produit uniquement
    if offer.product:
        artists = [
            OfferArtist(
                id=str(link.artist.id),
                name=link.artist.name,
                image=link.artist.image,
                role=link.artist_type  # Depuis Ticket 1
            )
            for link in offer.product.artist_links
            if not link.artist.is_blacklisted
        ]

    # Cas 2 : Offre sans produit → artistes de l'offre uniquement
    else:
        artists = [
            OfferArtist(
                id=str(link.artist.id) if link.artist else None,
                name=link.custom_name if link.custom_name else link.artist.name,
                image=link.artist.image if link.artist else None,
                role=link.artist_type  # Depuis Ticket 1
            )
            for link in offer.artist_links
        ]

    return artists
```

### 3. Gérer les artistes customisés (sans `artist_id`)

Pour les offres sans produit, les pros peuvent ajouter :
- **Artistes existants** : `artist_id` renseigné, `custom_name` = NULL
- **Artistes customisés** : `artist_id` = NULL, `custom_name` renseigné

**Contrainte** : `(artist_id IS NOT NULL) XOR (custom_name IS NOT NULL)`

**Exemple** :
```python
# Artiste existant de la base Wikidata
ArtistOfferLink(artist_id=123, custom_name=None, artist_type="DIRECTOR")

# Artiste customisé (pas dans Wikidata)
ArtistOfferLink(artist_id=None, custom_name="Invité surprise", artist_type="SPEAKER")
```

---

## Endpoint modifié

**Endpoint** : `GET /native/v1/offer/<offer_id>`

### Exemple 1 : Offre AVEC produit

**Requête** : `GET /native/v1/offer/123`

**Données** :
```python
offer.product = Film("Inception")
offer.product.artists = [Nolan, DiCaprio, Cotillard]
offer.artist_links = []  # Vide (ou ignoré si rempli)
```

**Réponse** :
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

### Exemple 2 : Offre SANS produit

**Requête** : `GET /native/v1/offer/456`

**Données** :
```python
offer.product = None
offer.artist_links = [
    ArtistOfferLink(artist_id=789, custom_name=None, artist_type="DIRECTOR"),
    ArtistOfferLink(artist_id=None, custom_name="Invité surprise", artist_type="SPEAKER")
]
```

**Réponse** :
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

---

## Tests

### Test 1 : Offre AVEC produit → ignore `offer.artists`

```python
def test_get_offer_with_product_ignores_offer_artists():
    """
    Vérifie que si une offre a un produit, on retourne UNIQUEMENT product.artists
    et on ignore offer.artist_links (exclusion mutuelle)
    """
    # Given
    product = create_product()
    offer = create_offer(product=product)

    # Artistes du produit
    nolan_link = create_artist_product_link(
        product=product,
        artist=create_artist(name="Nolan"),
        artist_type="STAGE_DIRECTOR"
    )
    dicaprio_link = create_artist_product_link(
        product=product,
        artist=create_artist(name="DiCaprio"),
        artist_type="PERFORMER"
    )

    # Artiste ajouté sur l'offre (ne doit PAS apparaître)
    custom_guest = create_artist_offer_link(
        offer=offer,
        artist=create_artist(name="Guest"),
        artist_type="SPEAKER"
    )

    # When
    response = client.get(f"/native/v1/offer/{offer.id}")

    # Then
    assert len(response.json()["artists"]) == 2
    assert response.json()["artists"][0]["name"] == "Nolan"
    assert response.json()["artists"][1]["name"] == "DiCaprio"
    # "Guest" ne doit PAS être dans la réponse (exclusion mutuelle)
    assert "Guest" not in [a["name"] for a in response.json()["artists"]]
```

### Test 2 : Offre SANS produit → utilise `offer.artists`

```python
def test_get_offer_without_product_uses_offer_artists():
    """
    Vérifie que si une offre n'a pas de produit, on retourne offer.artist_links
    """
    # Given
    offer = create_offer(product=None)  # Pas de produit

    # Artistes ajoutés directement sur l'offre
    artist_link_1 = create_artist_offer_link(
        offer=offer,
        artist=create_artist(name="Tarantino"),
        artist_type="STAGE_DIRECTOR"
    )
    artist_link_2 = create_artist_offer_link(
        offer=offer,
        custom_name="Invité surprise",  # Artiste customisé
        artist_id=None,
        artist_type="SPEAKER"
    )

    # When
    response = client.get(f"/native/v1/offer/{offer.id}")

    # Then
    assert len(response.json()["artists"]) == 2
    assert response.json()["artists"][0]["name"] == "Tarantino"
    assert response.json()["artists"][0]["id"] is not None

    # Artiste customisé
    assert response.json()["artists"][1]["name"] == "Invité surprise"
    assert response.json()["artists"][1]["id"] is None
```

### Test 3 : Offre avec produit blacklisté

```python
def test_get_offer_filters_blacklisted_artists():
    """
    Vérifie que les artistes blacklistés sont filtrés (uniquement pour product.artists)
    """
    # Given
    product = create_product()
    offer = create_offer(product=product)

    blacklisted_artist = create_artist(name="Blacklisted", is_blacklisted=True)
    create_artist_product_link(
        product=product,
        artist=blacklisted_artist,
        artist_type="AUTHOR"
    )

    # When
    response = client.get(f"/native/v1/offer/{offer.id}")

    # Then
    assert len(response.json()["artists"]) == 0
    assert "Blacklisted" not in [a["name"] for a in response.json()["artists"]]
```

---

## Sandbox / Environnement de test

### Enrichir la sandbox avec des offres de test

**Fichier** : `api/src/pcapi/sandboxes/scripts/creators/test_cases/__init__.py#L292`

**Ajouter des offres de test pour les 2 cas :**

```python
def create_artists():
    # ... code existant ...

    # CAS 1 : Offre avec produit (artistes du produit)
    product_with_artists = create_product(name="Inception")
    offer_with_product = create_offer(product=product_with_artists)

    create_artist_product_link(
        product=product_with_artists,
        artist=nolan,
        artist_type="STAGE_DIRECTOR"
    )

    # CAS 2 : Offre sans produit (artistes ajoutés manuellement par pro)
    offer_without_product = create_offer(product=None, name="Avant-première spéciale")

    create_artist_offer_link(
        offer=offer_without_product,
        artist=tarantino,
        artist_type="STAGE_DIRECTOR"
    )

    create_artist_offer_link(
        offer=offer_without_product,
        custom_name="Invité surprise",
        artist_id=None,
        artist_type="SPEAKER"
    )
```

---

## Validation PM

**Sur la sandbox :**

1. **Offre avec produit** :
   - [ ] Consulter une offre liée à un produit (ex: film "Inception")
   - [ ] Vérifier que seuls les artistes du produit sont affichés
   - [ ] Vérifier que les artistes ajoutés sur l'offre (si existants) ne sont PAS affichés

2. **Offre sans produit** :
   - [ ] Consulter une offre spéciale sans produit (ex: pratique artistique, festival)
   - [ ] Vérifier que les artistes ajoutés manuellement par le pro sont affichés
   - [ ] Vérifier que les artistes customisés (custom_name) s'affichent correctement

3. **Affichage frontend** :
   - [ ] Les artistes avec `role = "AUTHOR/STAGE_DIRECTOR/SPEAKER"` apparaissent dans "de [X]"
   - [ ] Les artistes avec `role = "PERFORMER"` apparaissent dans "Avec [Y]"

---

## Dépendances

- 🔗 **Dépend de Ticket 1** : Le champ `role` doit être implémenté d'abord
- ⚠️ **Coordination avec équipe Pro** : Vérifier que la contrainte d'exclusion mutuelle est bien appliquée côté Pro (un pro ne peut pas ajouter d'artistes sur une offre déjà liée à un produit)

---

## Points d'attention

### Noms de relations à vérifier

Les noms de relations SQLAlchemy peuvent varier. Vérifier dans le modèle `Offer` :
- `offer.product` ✅
- `offer.artist_links` ⚠️ (à vérifier, pourrait être `artists` ou `offer_artists`)

### Gestion des artistes customisés

Les artistes customisés (sans `artist_id`) doivent retourner :
```json
{
  "id": null,
  "name": "Invité surprise",
  "image": null,
  "role": "SPEAKER"
}
```

L'app frontend devra gérer le cas `id === null` → artiste non cliquable (pas de page artiste).

---

## Résumé des changements

| Fichier | Modification |
|---------|-------------|
| `repository.py#L375` | Ajouter jointures pour `offer.artist_links` |
| `serialization/offers.py#L287` | Implémenter logique d'exclusion mutuelle `if offer.product` |
| `offers_test.py` | Ajouter tests pour les 2 cas (avec/sans produit) |
| `sandboxes/creators/__init__.py#L292` | Créer offres de test pour les 2 cas |

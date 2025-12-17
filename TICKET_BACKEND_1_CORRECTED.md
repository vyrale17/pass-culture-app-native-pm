# [Back] Update endpoint artistes - Ajout distinction rôles pour affichage "de/Avec"

## Contexte

Actuellement, l'endpoint qui retourne la liste des artistes d'une offre ne permet pas de distinguer les rôles des artistes (réalisateur, interprète, auteur, metteur en scène, etc.). Cette distinction est nécessaire pour afficher correctement les artistes sur la page offre selon les patterns définis :

- "de [Réalisateur/Auteur/Metteur en scène]"
- "Avec [Interprètes]"

Nous devons enrichir l'endpoint existant pour ajouter le champ `role` et permettre au frontend d'afficher les artistes dans les bons champs selon leur rôle.

**Jira** : https://passculture.atlassian.net/browse/PC-39044

---

## User Story

**En tant que** frontend developer
**J'aimerais** recevoir le rôle de chaque artiste depuis l'API
**Afin de** pouvoir afficher correctement "de [X]" et "Avec [Y]" selon les rôles

---

## Règles de gestion

### Ajout du champ `role`

Ajouter un champ `role` pour chaque artiste afin que l'app puisse déterminer le wording d'affichage :

- **"de [X]"** → `AUTHOR`, `STAGE_DIRECTOR`, `SPEAKER`
- **"Avec [Y]"** → `PERFORMER`

### ⚠️ Enums manquants (traités dans un ticket séparé)

Les enums suivants n'existent pas encore et seront ajoutés ultérieurement après validation backend :
- `DIRECTOR` (réalisateur de film)
- `COMPOSER` (compositeur)
- `SCREENWRITER` (scénariste)
- `ACTOR` (acteur)
- `MUSICIAN` (musicien)

**En attendant leur création, utiliser les mappings temporaires suivants :**
- Compositeur → `AUTHOR` (temporaire)
- Scénariste → `AUTHOR` (temporaire)
- Acteur → `PERFORMER` (temporaire)
- Musicien → `PERFORMER` (temporaire)
- Réalisateur film → `STAGE_DIRECTOR` (temporaire, conflit avec metteur en scène théâtre)

---

## Stratégie Technique

### 1. Ajouter le champ `role` dans `OfferArtist`

**Fichier** : `api/src/pcapi/routes/native/v1/serialization/offers.py#L446`

```python
class OfferArtist(BaseModel):
    id: str
    name: str
    image: str | None = None
    role: str  # ← NOUVEAU CHAMP
```

### 2. Remplir le champ `role` depuis `artist_type`

Le champ `role` doit provenir de `artist_type` selon la source :

**Si artiste vient du produit** :
```python
# Source : ArtistProductLink.artist_type
role = artist_product_link.artist_type
```

**Si artiste vient de l'offre directement** (nouveau cas, voir Ticket 2) :
```python
# Source : ArtistOfferLink.artist_type
role = artist_offer_link.artist_type
```

### 3. Modifier la query dans `get_offer_details`

**Fichier** : `api/src/pcapi/core/offers/repository.py#L375`

Ajouter les jointures pour récupérer `artist_type` :

```python
.options(
    sa_orm.joinedload(models.Offer.product)
        .selectinload(models.Product.artist_links)  # ← Récupère ArtistProductLink
        .selectinload(models.ArtistProductLink.artist),
    sa_orm.selectinload(models.Offer.artist_links)  # ← Récupère ArtistOfferLink
        .selectinload(models.ArtistOfferLink.artist)
)
```

### 4. Mettre à jour le serializer

**Fichier** : `api/src/pcapi/routes/native/v1/serialization/offers.py#L287`

```python
# Exemple pour product.artists
artists = [
    OfferArtist(
        id=str(link.artist.id),
        name=link.artist.name,
        image=link.artist.image,
        role=link.artist_type  # ← Nouveau champ depuis ArtistProductLink
    )
    for link in product.artist_links
    if not link.artist.is_blacklisted
]
```

---

## Endpoint à modifier

**Endpoint** : `GET /native/v1/offer/<offer_id>`

**Réponse actuelle** :
```json
{
  "artists": [
    {
      "id": "uuid",
      "name": "Christopher Nolan",
      "image": "https://..."
    }
  ]
}
```

**Réponse attendue** :
```json
{
  "artists": [
    {
      "id": "uuid",
      "name": "Christopher Nolan",
      "image": "https://...",
      "role": "STAGE_DIRECTOR"
    }
  ]
}
```

---

## Besoin produit

### Patterns d'affichage attendus par type d'offre

| Type d'offre | Pattern page offre | Nombre de champs | Exemple |
|--------------|-------------------|------------------|---------|
| **Cinéma** | "de [Réalisateur]" 〉<br>"Avec [Interprètes]" 〉 | 2 champs (si les 2 rôles existent) | "de Bong Joon Ho" 〉<br>"Avec Robert Pattinson, Anamaria... et 2 autres" 〉 |
| **Livres/BD** | "de [Auteur]" 〉 | 1 champ | "de Laurent Hopman" 〉 |
| **Musique Live** | **Cas 1** : "Avec [Interprètes]" 〉<br>**Cas 2** : "de [Auteur]" 〉<br>"Avec [Interprètes]" 〉 | 1 champ<br>2 champs | "Avec Katy Perry, Gims et 2 autres" 〉<br><br>"de Bong Joon Ho" 〉<br>"Avec Robert Pattinson, Anamaria... et 2 autres" 〉 |
| **Musique enregistrée** | "de [Auteur]" 〉 | 1 champ | "de Laurent Hopman" 〉 |
| **Spectacle vivant** | "de [Metteur en scène, Auteur]" 〉<br>"Avec [Interprètes]" 〉 | 2 champs (si les 2 rôles existent) | "de Bong Joon Ho, Molière" 〉<br>"Avec Robert Pattinson, Anamaria... et 2 autres" 〉 |
| **Musée** | "de [Auteur]" 〉<br>"Avec [Interprètes]" 〉 | 2 champs (si les 2 rôles existent) | "de Bong Joon Ho" 〉<br>"Avec Robert Pattinson, Anamaria... et 2 autres" 〉 |
| **Festivals** | **Cas 1** : "Avec [Interprètes]" 〉<br>**Cas 2** : "de [Auteur]" 〉<br>"Avec [Interprètes]" 〉 | 1 champ<br><br>2 champs | "Avec Katy Perry, Gims et 2 autres" 〉<br><br>"de Bong Joon Ho" 〉<br>"Avec Robert Pattinson, Anamaria... et 2 autres" 〉 |
| **Pratique artistique** | "de [Intervenant]" 〉 | 1 champ | "de Laurent Hopman" 〉 |

---

## Champ rôle - Valeurs possibles

### Mapping complet des rôles

| Type artiste | Enum actuel | Préfixe | Commentaire |
|--------------|-------------|---------|-------------|
| Auteur | `AUTHOR` ✅ | "de" | ✅ Confirmé - Existe dans ArtistType + ExtraDataFieldEnum |
| Réalisateur | `STAGE_DIRECTOR` ⚠️ | "de" | ⚠️ Utilisé temporairement pour réalisateur de films ET metteur en scène |
| Metteur en scène | `STAGE_DIRECTOR` ✅ | "de" | ✅ Confirmé - Existe dans ExtraDataFieldEnum |
| Compositeur | ❌ manquant | "de" | ⚠️ Temporairement mappé vers `AUTHOR` |
| Scénariste | ❌ manquant | "de" | ⚠️ N'existe pas - À créer dans ticket séparé |
| Interprète | `PERFORMER` ✅ | "Avec" | ✅ OK |
| Acteur | ❌ manquant | "Avec" | ⚠️ Temporairement mappé vers `PERFORMER` |
| Musicien | ❌ manquant | "Avec" | ⚠️ Temporairement mappé vers `PERFORMER` |
| Intervenant | `SPEAKER` ✅ | "de" | ✅ Confirmé - Existe dans ExtraDataFieldEnum |

### Mapping Frontend (pour référence)

| Rôle | Valeur `role` | Utilisation frontend |
|------|---------------|---------------------|
| Réalisateur | `STAGE_DIRECTOR` (temporaire) | Champ "de [Réalisateur]" |
| Auteur | `AUTHOR` | Champ "de [Auteur]" |
| Compositeur | `AUTHOR` (temporaire) | Champ "de [Compositeur]" |
| Metteur en scène | `STAGE_DIRECTOR` | Champ "de [Metteur en scène]" |
| Scénariste | `AUTHOR` (temporaire) | Champ "de [Scénariste]" |
| Interprète/Acteur | `PERFORMER` | Champ "Avec [Interprètes]" |
| Musicien | `PERFORMER` (temporaire) | Champ "Avec [Musiciens]" |
| Intervenant | `SPEAKER` | Champ "de [Intervenant]" |

---

## Validation PM

- [ ] Le champ `role` est présent dans la réponse API pour tous les artistes
- [ ] Les valeurs correspondent aux enums existants (`AUTHOR`, `STAGE_DIRECTOR`, `PERFORMER`, `SPEAKER`)
- [ ] L'app mobile affiche correctement "de [X]" et "Avec [Y]" selon les rôles
- [ ] Les artistes avec des rôles temporaires (ex: compositeur → `AUTHOR`) sont affichés correctement

---

## Tests

### Tests unitaires à ajouter

```python
def test_offer_artist_has_role_field():
    """Vérifie que le champ role est présent dans la réponse"""
    # Given
    offer = create_offer_with_product()
    artist_link = create_artist_product_link(
        product=offer.product,
        artist=create_artist(name="Nolan"),
        artist_type="STAGE_DIRECTOR"
    )

    # When
    response = client.get(f"/native/v1/offer/{offer.id}")

    # Then
    assert "role" in response.json()["artists"][0]
    assert response.json()["artists"][0]["role"] == "STAGE_DIRECTOR"
```

---

## Dépendances

- ✅ Aucune dépendance bloquante
- ⚠️ Les enums manquants seront traités dans un ticket séparé (non bloquant)
- 🔗 Ce ticket est un prérequis pour le Ticket 2 (Gestion multi-sources)

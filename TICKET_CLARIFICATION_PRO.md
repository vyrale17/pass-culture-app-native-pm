# 🎯 Clarification : Gestion des artistes côté Pro → Jeune

**Date** : 2025-12-17
**Destinataires** : PM Pro + Lead Tech Pro
**Émetteur** : Équipe Jeune
**Contexte** : Intégration de la fonctionnalité d'ajout d'artistes par les pros

---

## 📌 Contexte

L'équipe Pro a développé une fonctionnalité permettant aux structures culturelles d'ajouter des artistes directement sur leurs offres via la table `ArtistOfferLink`.

L'équipe Jeune doit maintenant afficher ces artistes sur l'app mobile, mais nous avons identifié **des ambiguïtés et contradictions** qui bloquent l'implémentation côté Jeune.

---

## ❓ Questions critiques à clarifier

### 1. 🔀 Fusion ou Exclusion mutuelle ?

Nous avons deux sources contradictoires :

#### 📋 Vos specs disent :
> "Seules les offres **non liées à un produit** peuvent être liées à un artiste"

➡️ **Interprétation** : Exclusion mutuelle
- Si `offer.product` existe → afficher `product.artists`
- Si `offer.product` est NULL → afficher `offer.artist_links`
- **Jamais les deux en même temps**

#### 🎫 Mais le ticket backend Jeune suggère :
```python
artists = []
if offer.product:
    artists.extend(offer.product.artists)
if offer.artist_links:
    artists.extend(offer.artist_links)
return artists  # Fusion des deux sources
```

➡️ **Interprétation** : Fusion (product + offer)

**Question : Quelle est la bonne règle métier ?**

**Cas d'usage à clarifier :**
- Une offre liée à un produit (ex: film "Inception") peut-elle avoir des artistes supplémentaires ajoutés par le pro ?
- Exemple concret : Un cinéma fait une séance avec un invité surprise → veut ajouter cet invité en plus du casting du film
- Est-ce un cas d'usage valide ou interdit ?

---

### 2. 🎭 Types d'artistes manquants

Nous avons analysé les enums `ArtistType` actuels côté backend et identifié des **manques critiques** :

| Rôle demandé | Enum existant ? | Problème |
|--------------|-----------------|----------|
| Réalisateur (film) | ❌ NON | `STAGE_DIRECTOR` utilisé pour films ET théâtre → confusion |
| Compositeur | ❌ NON | Mappé vers `AUTHOR` → impossible de distinguer compositeur vs écrivain |
| Scénariste | ❌ NON | N'existe pas du tout |
| Acteur | ❌ NON | Films utilisent `cast: list[str]` → pas de pages artistes cliquables |
| Musicien | ❌ NON | Mappé vers champ générique `artist` |

**Questions :**
- Êtes-vous d'accord pour créer ces nouveaux types : `DIRECTOR`, `COMPOSER`, `SCREENWRITER`, `ACTOR`, `MUSICIAN` ?
- Ou avez-vous une autre stratégie (ex: garder `STAGE_DIRECTOR` pour tout) ?
- Quid du champ `cast` des films → migration vers `ArtistProductLink` avec type `ACTOR` ?

---

### 3. 🎬 Cas spécifique : Acteurs de films

**État actuel :**
- Films ont un champ `cast: list[str]` (liste de strings simples)
- Pas d'objets `Artist` associés
- Impossible de créer des pages artistes cliquables

**Scénario Pro :**
- Est-ce que les pros pourront ajouter des acteurs via `ArtistOfferLink` ?
- Si oui, comment gérer la cohabitation avec `cast: list[str]` ?
- Faut-il migrer `cast` vers des vraies entités `Artist` ?

---

## 🔄 Impact côté Jeune

Selon vos réponses, l'implémentation côté Jeune sera **radicalement différente** :

### Scénario A : Exclusion mutuelle
```typescript
// Logique simple
const artists = offer.product
  ? offer.product.artists
  : offer.artistLinks
```
✅ Simple à implémenter
✅ Cohérent avec specs Pro
❌ Limite les cas d'usage (pas de guests)

### Scénario B : Fusion
```typescript
// Logique complexe
const artists = [
  ...(offer.product?.artists || []),
  ...(offer.artistLinks || [])
]
// + Déduplication si même artist.id
// + Gestion de l'ordre d'affichage
```
✅ Plus flexible (cas des invités)
❌ Plus complexe (déduplication, ordre)
❌ Contredit specs Pro

---

## 📊 Données attendues côté Jeune

Pour afficher correctement les artistes, l'API `/native/v1/offer/<offer_id>` doit retourner :

```json
{
  "artists": [
    {
      "id": "uuid-or-null",
      "name": "Nom Artiste",
      "image": "url-or-null",
      "role": "DIRECTOR" // ← NOUVEAU CHAMP
    }
  ]
}
```

**Règles d'affichage Jeune :**
- Rôles "de" : AUTHOR, DIRECTOR, STAGE_DIRECTOR, COMPOSER, SCREENWRITER, SPEAKER
  - Affichage : "de Christopher Nolan, Quentin Tarantino et 2 autres"
- Rôles "Avec" : PERFORMER, ACTOR, MUSICIAN
  - Affichage : "Avec Leonardo DiCaprio, Marion Cotillard et 5 autres"

---

## ✅ Actions attendues

**PM Pro :**
- [ ] Confirmer règle métier : Fusion ou Exclusion mutuelle ?
- [ ] Valider cas d'usage : invités supplémentaires sur offres avec produit ?
- [ ] Préciser périmètre : quels types d'artistes les pros peuvent ajouter ?

**Lead Tech Pro :**
- [ ] Valider enums manquants : `DIRECTOR`, `COMPOSER`, `SCREENWRITER`, `ACTOR`, `MUSICIAN`
- [ ] Confirmer format API : ajout du champ `role` dans `artists[]`
- [ ] Clarifier migration : `cast: list[str]` vers `ArtistProductLink` ?

**Délai souhaité :** 📅 Avant le prochain sprint Jeune (semaine du XX/XX)

---

## 📞 Contact

Pour toute question ou pour organiser un point de synchronisation :
**Équipe Jeune** : [ton contact]

---

**TL;DR** : Nous avons besoin de clarifier la règle métier (fusion ou exclusion) et de valider les types d'artistes manquants avant de pouvoir implémenter côté Jeune. Merci ! 🙏

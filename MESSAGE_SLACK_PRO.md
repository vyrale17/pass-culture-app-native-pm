# Message Slack pour l'équipe Pro

---

Salut @PM-Pro @LeadTech-Pro 👋

On avance sur l'intégration de votre fonctionnalité d'ajout d'artistes côté Jeune, mais on a besoin de clarifier quelques points avant de coder. On a identifié **des contradictions** entre vos specs et nos tickets backend.

---

## 🔴 Question bloquante #1 : Fusion ou Exclusion ?

Vos specs disent :
> "Seules les offres **non liées à un produit** peuvent être liées à un artiste"

➡️ Ça veut dire : exclusion mutuelle (soit `product.artists` SOIT `offer.artists`, jamais les deux) ?

**Mais** si c'est le cas, impossible de gérer ce cas d'usage :
- Un ciné projette "Inception" (= produit avec ses artistes)
- Il organise une séance avec un invité surprise
- Il veut ajouter cet invité **en plus** du casting

**Question** : Ce cas existe ou pas ? Si oui, on doit fusionner les deux sources d'artistes au lieu de faire une exclusion.

---

## ⚠️ Question bloquante #2 : Types d'artistes manquants

On a analysé les enums `ArtistType` côté backend et il **manque des types critiques** :

| Rôle | Enum existant ? | Problème |
|------|-----------------|----------|
| **Réalisateur** | ❌ | `STAGE_DIRECTOR` utilisé pour films ET théâtre |
| **Compositeur** | ❌ | Mappé vers `AUTHOR` (confusion auteur livre/compositeur) |
| **Scénariste** | ❌ | N'existe pas |
| **Acteur** | ❌ | Films utilisent `cast: list[str]` sans objets Artist |
| **Musicien** | ❌ | Mappé vers champ générique |

**Question** : Vous êtes OK pour que le backend crée ces nouveaux types (`DIRECTOR`, `COMPOSER`, `SCREENWRITER`, `ACTOR`, `MUSICIAN`) ?

Sinon, comment vous gérez ces cas côté Pro actuellement ?

---

## 📊 Format de données attendu

Pour qu'on puisse afficher correctement côté Jeune, on a besoin de ce format dans l'API `/native/v1/offer/<id>` :

```json
{
  "artists": [
    {
      "id": "uuid-or-null",
      "name": "Christopher Nolan",
      "image": "url",
      "role": "DIRECTOR"  // ← Ce champ n'existe pas encore
    }
  ]
}
```

Le champ `role` est critique pour qu'on puisse afficher :
- "**de** Christopher Nolan" (réalisateur)
- "**Avec** Leonardo DiCaprio" (acteur)

---

## 🎯 Ce qu'on attend de vous

**PM Pro** :
- Confirmer la règle métier : fusion ou exclusion mutuelle ?
- Valider les cas d'usage (invités sur offres avec produit ?)

**Lead Tech Pro** :
- Valider la création des enums manquants
- Confirmer l'ajout du champ `role` dans l'API

---

On peut organiser un **quick sync 15min** cette semaine pour débloquer ça ? 🙏

Sans ces clarifs, on ne peut pas avancer sur l'implémentation Jeune. Merci !

cc @equipe-jeune pour info

---

**TL;DR** : On a besoin de savoir si on doit fusionner `product.artists` + `offer.artists` et si vous pouvez créer les types d'artistes manquants (DIRECTOR, COMPOSER, ACTOR, etc.).

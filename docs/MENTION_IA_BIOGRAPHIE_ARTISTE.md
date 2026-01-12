# Mention IA sur la Biographie d'Artiste 🎨

## 📋 Vue d'ensemble

Cette documentation explique le fonctionnement de la mention "Contenu généré par IA" qui s'affiche sur les pages artistes de l'application pass Culture.

---

## 🎯 Objectif de la fonctionnalité

Lorsqu'une biographie d'artiste est générée ou enrichie par intelligence artificielle, l'application affiche une mention claire pour informer l'utilisateur de la source du contenu. Cette transparence respecte les bonnes pratiques en matière d'information et de traçabilité des contenus.

---

## 👤 Parcours utilisateur

### Étape 1 : Consultation de la page artiste

L'utilisateur accède à une page artiste (par exemple : Avril Lavigne) et voit :
- La photo de l'artiste
- Son nom
- Une biographie **tronquée** à environ 250 caractères
- Un bouton **"Voir plus"**

```
┌─────────────────────────────────┐
│   [Photo de l'artiste]          │
│                                 │
│   AVRIL LAVIGNE                 │
│                                 │
│   À propos                      │
│   Il s'agit d'une chanteuse     │
│   canadienne qui a connu un     │
│   grand succès avec ses         │
│   albums pop-punk...            │
│                                 │
│   [Voir plus ▼]                 │
└─────────────────────────────────┘
```

**Important** : À ce stade, la mention IA n'est **PAS visible**.

---

### Étape 2 : Expansion de la biographie

L'utilisateur clique sur **"Voir plus"** pour lire la biographie complète.

```
┌─────────────────────────────────┐
│   [Photo de l'artiste]          │
│                                 │
│   AVRIL LAVIGNE                 │
│                                 │
│   À propos                      │
│   Il s'agit d'une chanteuse     │
│   canadienne qui a connu un     │
│   grand succès avec ses         │
│   albums pop-punk dans les      │
│   années 2000. Elle est         │
│   notamment connue pour ses     │
│   hits comme "Complicated"      │
│   et "Sk8er Boi"...             │
│                                 │
│   © Contenu généré par IA       │
│   Source : Wikipédia            │
│                                 │
│   [Voir moins ▲]                │
└─────────────────────────────────┘
```

**La mention IA apparaît maintenant** avec :
- Le texte : **"© Contenu généré par IA"**
- Un lien cliquable : **"Source : Wikipédia"**

---

## 📐 Règles d'affichage

| Condition | Mention IA visible ? | Lien source visible ? |
|-----------|---------------------|----------------------|
| Biographie **non étendue** (tronquée) | ❌ Non | ❌ Non |
| Biographie **étendue** + source Wikipedia disponible | ✅ Oui | ✅ Oui |
| Biographie **étendue** + source non disponible | ❌ Non | ❌ Non |

### Conditions techniques

La mention IA s'affiche **uniquement si** :
1. ✅ L'utilisateur a cliqué sur "Voir plus"
2. ✅ Le champ `descriptionCredit` contient du texte (ex: "© Contenu généré par IA")
3. ✅ Le champ `descriptionSource` contient une URL Wikipedia

---

## 🔍 Détails techniques (pour référence)

### Données affichées

Les informations proviennent de l'API backend :

```json
{
  "id": "cb22d035-f081-4ccb-99d8-8f5725a8ac9c",
  "name": "Avril Lavigne",
  "description": "Il s'agit d'une chanteuse canadienne...",
  "descriptionCredit": "© Contenu généré par IA",
  "descriptionSource": "https://fr.wikipedia.org/wiki/Avril_Lavigne"
}
```

### Composants impliqués

| Composant | Rôle |
|-----------|------|
| `Artist.tsx` | Page principale de l'artiste |
| `ArtistBody.tsx` | Affiche la biographie avec la mention IA |
| `CollapsibleText.tsx` | Gère le mécanisme "Voir plus / Voir moins" |

---

## 📊 Suivi analytique

Lorsque l'utilisateur clique sur **"Voir plus"**, un événement est enregistré :

**Événement** : `CLICK_EXPAND_ARTIST_BIO`

**Données collectées** :
- `artistId` : Identifiant de l'artiste
- `artistName` : Nom de l'artiste
- `from` : Point d'entrée (généralement "artist")

Cela permet de mesurer l'engagement des utilisateurs avec les biographies d'artistes.

---

## 🚀 Activation de la fonctionnalité

La page artiste est contrôlée par un **feature flag** (activation progressive) :

- **Nom du flag** : `WIP_ARTIST_PAGE`
- **Statut** : Activé/Désactivé selon l'environnement

Si le flag est désactivé, la page artiste n'est pas accessible et les utilisateurs sont redirigés.

---

## ❓ Questions fréquentes

### Pourquoi la mention IA n'apparaît pas immédiatement ?

Pour ne pas surcharger visuellement la page. L'utilisateur voit d'abord un aperçu de la biographie. La mention n'apparaît que lorsqu'il demande explicitement à lire le texte complet.

### Que se passe-t-il si je clique sur "Source : Wikipédia" ?

Un lien externe s'ouvre vers la page Wikipedia correspondante de l'artiste.

### Est-ce que tous les artistes ont cette mention ?

Non, seulement les artistes dont la biographie a été générée ou enrichie par IA. Si le backend ne fournit pas le champ `descriptionCredit`, la mention ne s'affiche pas.

### Peut-on personnaliser le texte de la mention ?

Le texte de la mention (ex: "© Contenu généré par IA") est défini par le backend. L'application mobile l'affiche tel quel.

---

## 📝 Résumé pour les équipes métier

**En une phrase** : La mention "© Contenu généré par IA" s'affiche en bas de la biographie complète d'un artiste, accompagnée d'un lien vers Wikipedia, pour informer l'utilisateur de la source du contenu.

**Bénéfices** :
- ✅ Transparence sur l'origine du contenu
- ✅ Conformité réglementaire
- ✅ Crédibilité et confiance de l'utilisateur
- ✅ Lien direct vers la source originale (Wikipedia)

**Point d'attention** :
- La mention n'est visible qu'après un clic sur "Voir plus"
- Si la biographie est courte (< 250 caractères), il n'y a pas de bouton "Voir plus" et donc la mention peut ne jamais s'afficher

---

## 📅 Historique

| Date | Version | Modification |
|------|---------|--------------|
| 2026-01 | 1.0 | Création de la documentation |

---

**Contact** : Pour toute question sur cette fonctionnalité, contactez l'équipe produit ou l'équipe technique mobile.

# Message Slack - Question sur les enums de rôles

---

Salut @PM-Pro @LeadTech-Pro 👋

Suite à nos échanges sur les artistes, j'ai confirmé qu'on part sur une **exclusion mutuelle** (soit `product.artists` soit `offer.artists`, jamais les deux) ✅

Par contre, il me reste une question importante sur les **rôles d'artistes** :

---

## 🎭 Question : Enums de rôles - d'où ça vient ?

Quand on a analysé les types d'artistes côté backend, on a trouvé :

**Enums existants :**
- `AUTHOR` ✅
- `STAGE_DIRECTOR` ✅
- `PERFORMER` ✅
- `SPEAKER` ✅

**Enums manquants :**
- `DIRECTOR` ❌ (réalisateur film)
- `COMPOSER` ❌ (compositeur)
- `SCREENWRITER` ❌ (scénariste)
- `ACTOR` ❌ (acteur)
- `MUSICIAN` ❌ (musicien)

**Mes questions :**

1️⃣ **Est-ce que ces enums viennent de votre côté (équipe Pro) ?**
   - Ou c'est défini côté backend commun/jeune ?

2️⃣ **Dans votre interface de création d'offre, quels rôles les pros peuvent sélectionner aujourd'hui ?**
   - Juste les 4 existants (`AUTHOR`, `STAGE_DIRECTOR`, `PERFORMER`, `SPEAKER`) ?
   - Ou vous avez déjà les autres (`DIRECTOR`, `COMPOSER`, etc.) ?

3️⃣ **Qu'est-ce que vous allez renvoyer comme données selon le type ?**
   - Format actuel : `{ id, name, image }` (sans champ `role`)
   - Format attendu : `{ id, name, image, role }` ← ce champ existe côté Pro ?

---

## 📊 Contexte : pourquoi c'est important

Côté Jeune, on doit afficher les artistes différemment selon leur rôle :
- **"de"** → AUTHOR, DIRECTOR, STAGE_DIRECTOR, COMPOSER, SCREENWRITER, SPEAKER
- **"Avec"** → PERFORMER, ACTOR, MUSICIAN

Sans le champ `role` dans l'API, on ne peut pas faire cette distinction.

---

**TL;DR** : J'ai besoin de savoir si les enums de rôles sont définis par votre équipe, quels types sont disponibles côté Pro, et si vous renvoyez déjà le champ `role` dans vos données.

Merci ! 🙏

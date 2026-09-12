# My Virtual Bookshelf

A Vue 3 + Vite app: a room of freestanding bookcases (5 shelves, 10 books per shelf),
book search powered by the free Open Library API, fractional (half-star) ratings,
and real accounts (email/password or Google) with your library synced via Firebase.

## Run it

```bash
npm install
```

Copy `.env.example` to `.env` and fill in your Firebase project's web app config
(Project settings → your web app → SDK setup and configuration):

```bash
cp .env.example .env
```

Then:

```bash
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

### Firebase project setup (one-time)

1. Create a project at the [Firebase console](https://console.firebase.google.com)
   and register a web app to get the config values for `.env`.
2. **Authentication → Sign-in method**: enable **Email/Password** (and **Google**
   if you want that button to work).
3. **Firestore Database**: create a database in **Native mode** (not "MongoDB
   compatibility" — that mode doesn't support the security-rules model this app
   relies on). Under its **Rules** tab, set:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{uid} {
         allow read, write: if request.auth != null && request.auth.uid == uid;
         match /bookcases/{bookcaseId} {
           allow read, write: if request.auth != null && request.auth.uid == uid;
         }
       }
     }
   }
   ```

## Build for production

```bash
npm run build
npm run preview   # to sanity-check the build locally
```

## How it's organized

- `src/lib/firebase.js` — initializes the Firebase app from the `.env` config
  and exports the `auth`/`db` instances everything else uses.
- `src/lib/auth.js` — wraps Firebase Auth: a reactive `currentUser`, plus
  `signUp`/`signIn`/`signInWithGoogle`/`signOutUser`. Creates a `users/{uid}`
  profile doc (display name, email) on first sign-in regardless of provider.
- `src/lib/store.js` — the reactive library (bookcases + books). Mirrors the
  signed-in user's `users/{uid}/bookcases` Firestore collection in real time;
  every mutation updates the local copy immediately and writes the affected
  bookcase's document to Firestore. Starts empty; add your first bookcase from
  the home page to get going.
- `src/lib/openLibrary.js` — a thin wrapper around Open Library's free,
  keyless search API (`https://openlibrary.org/search.json`). Needs an
  internet connection; if it's unreachable the search modal says so.
- `src/components/AuthGate.vue` — the sign-in/sign-up screen shown whenever
  there's no authenticated user.
- `src/components/ProfilePage.vue` — display name, total book count, and a
  list of your bookcases (with per-bookcase counts) that jump straight to
  that bookcase's shelf page.
- `src/components/StarRating.vue` — a reusable rating control. Clicking the
  left half of a star sets a `.5`, the right half sets a whole number (or type
  an exact value in the adjacent field), so ratings like `3.5` are fully
  supported everywhere it's used.
- `src/components/BookcaseCard.vue` / `ShelfPage.vue` — the home-page card and
  the zoomed-in, full bookcase view. Every bookcase always has exactly 5
  shelves; if a shelf's 10 slots ever overflow, the extra books stay visible
  on the last shelf (which scrolls horizontally) rather than getting lost.
  Books can also be dragged and dropped to reorder them.
- `src/components/SearchModal.vue` — "Find a book": reachable from the home
  page or from inside a bookcase, search Open Library and click **Shelve** to
  drop a result onto a bookcase you pick (or create a new one on the spot).
- `src/components/BookModal.vue` — the detail view: cover, pages, publish
  year, fractional star rating, a review you can write/edit, and Share /
  Move left / Move right / Remove actions.

## Notes

- Your library lives in Firestore under your account, so it follows you across
  browsers/devices once signed in — nothing is stored in `localStorage`
  anymore.
- Open Library is a community-maintained catalog, so very new or obscure
  titles occasionally won't turn up in search.

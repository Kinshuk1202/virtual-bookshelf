import { reactive, watch } from 'vue'
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore'
import { colorForIndex } from './colors'
import { db } from './firebase'
import { currentUser } from './auth'

export const SHELVES_PER_CASE = 5
export const BOOKS_PER_SHELF = 10

export function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function book(title, author, extra = {}) {
  return { id: uid(), title, author, year: null, pages: null, cover: null, rating: 0, review: '', olKey: null, ...extra }
}

export const library = reactive({ bookcases: [] })

let unsubscribeBookcases = null

// Whenever the signed-in user changes, (re)subscribe to their own
// users/{uid}/bookcases collection and mirror it into `library`.
watch(
  currentUser,
  (user) => {
    if (unsubscribeBookcases) {
      unsubscribeBookcases()
      unsubscribeBookcases = null
    }
    library.bookcases = []
    if (!user) return
    const bookcasesCol = collection(db, 'users', user.uid, 'bookcases')
    unsubscribeBookcases = onSnapshot(bookcasesCol, (snapshot) => {
      library.bookcases = snapshot.docs.map((d) => {
        const data = d.data()
        return { id: d.id, name: data.name, books: data.books || [] }
      })
    })
  },
  { immediate: true }
)

function bookcaseDocRef(bookcaseId) {
  return doc(db, 'users', currentUser.value.uid, 'bookcases', bookcaseId)
}

// Writes just this one bookcase's full current state (name + books) to
// Firestore, so any edit only ever touches the one document it affects.
function persistBookcase(bc) {
  if (!currentUser.value) return
  setDoc(bookcaseDocRef(bc.id), {
    name: bc.name,
    books: JSON.parse(JSON.stringify(bc.books)),
  }).catch((e) => console.warn('Could not save bookcase', e))
}

export function findBookcase(id) {
  return library.bookcases.find((b) => b.id === id) || null
}

export function findBook(bookId) {
  for (const bc of library.bookcases) {
    const b = bc.books.find((x) => x.id === bookId)
    if (b) return { bookcase: bc, book: b }
  }
  return null
}

export function addBookcase(name) {
  const trimmed = name.trim()
  if (!trimmed || !currentUser.value) return null
  const bc = { id: uid(), name: trimmed, books: [] }
  library.bookcases.push(bc)
  persistBookcase(bc)
  return bc
}

export function renameBookcase(id, name) {
  const bc = findBookcase(id)
  if (!bc) return
  const trimmed = name.trim()
  if (!trimmed) return
  bc.name = trimmed
  persistBookcase(bc)
}

export function deleteBookcase(id) {
  const user = currentUser.value
  library.bookcases = library.bookcases.filter((b) => b.id !== id)
  if (user) {
    deleteDoc(doc(db, 'users', user.uid, 'bookcases', id)).catch((e) =>
      console.warn('Could not delete bookcase', e)
    )
  }
}

export function addBookToBookcase(bookcaseId, data) {
  const bc = findBookcase(bookcaseId)
  if (!bc) return null
  const color = colorForIndex(bc.books.length)
  const newBook = book(data.title || 'Untitled', data.author || '', {
    year: data.year || null,
    pages: data.pages || null,
    cover: data.cover || null,
    olKey: data.olKey || null,
    color,
  })
  bc.books.push(newBook)
  persistBookcase(bc)
  return newBook
}

export function removeBook(bookcaseId, bookId) {
  const bc = findBookcase(bookcaseId)
  if (!bc) return
  bc.books = bc.books.filter((b) => b.id !== bookId)
  persistBookcase(bc)
}

// Patches a book's own fields (rating, review, ...) — the one path components
// should use instead of mutating a book object directly, so every change
// still gets persisted.
export function updateBook(bookcaseId, bookId, patch) {
  const bc = findBookcase(bookcaseId)
  if (!bc) return
  const b = bc.books.find((x) => x.id === bookId)
  if (!b) return
  Object.assign(b, patch)
  persistBookcase(bc)
}

export function moveBook(bookcaseId, bookId, direction) {
  const bc = findBookcase(bookcaseId)
  if (!bc) return
  const idx = bc.books.findIndex((b) => b.id === bookId)
  if (idx === -1) return
  const swapWith = direction === 'left' ? idx - 1 : idx + 1
  if (swapWith < 0 || swapWith >= bc.books.length) return
  const arr = bc.books
  ;[arr[idx], arr[swapWith]] = [arr[swapWith], arr[idx]]
  persistBookcase(bc)
}

// Drag-and-drop reordering: pulls the dragged book out and reinserts it
// right before the book it was dropped on.
export function reorderBook(bookcaseId, bookId, targetBookId) {
  const bc = findBookcase(bookcaseId)
  if (!bc || bookId === targetBookId) return
  const fromIdx = bc.books.findIndex((b) => b.id === bookId)
  if (fromIdx === -1) return
  const [moved] = bc.books.splice(fromIdx, 1)
  let toIdx = bc.books.findIndex((b) => b.id === targetBookId)
  if (toIdx === -1) toIdx = bc.books.length
  bc.books.splice(toIdx, 0, moved)
  persistBookcase(bc)
}

// Drag-and-drop onto empty shelf space: reinserts the dragged book at a
// specific array position instead of relative to another book.
export function reorderBookToIndex(bookcaseId, bookId, targetIndex) {
  const bc = findBookcase(bookcaseId)
  if (!bc) return
  const fromIdx = bc.books.findIndex((b) => b.id === bookId)
  if (fromIdx === -1) return
  const [moved] = bc.books.splice(fromIdx, 1)
  const insertAt = Math.max(0, Math.min(targetIndex, bc.books.length))
  bc.books.splice(insertAt, 0, moved)
  persistBookcase(bc)
}

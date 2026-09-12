<template>
  <div v-if="bookcase" class="shelf-page">
    <div class="head">
      <button class="back" @click="$emit('back')">&larr; Back to the room</button>
      <div class="title-row">
        <div>
          <h1>{{ bookcase.name }}</h1>
          <p class="sub">{{ bookcase.books.length }} books · {{ booksPerShelf }} per shelf</p>
        </div>
        <button class="btn" @click="$emit('search')">Search &amp; add a book</button>
      </div>
    </div>

    <div class="case">
      <div class="case-inner">
        <div v-for="(shelfBooks, si) in tiers" :key="si" class="shelf">
          <div class="spines" @dragover.prevent @drop="onDropOnShelf($event, si, shelfBooks)">
            <BookSpine
              v-for="b in shelfBooks"
              :key="b.id"
              :book="b"
              size="full"
              :dragging="draggedId === b.id"
              draggable="true"
              @click="$emit('openBook', b.id)"
              @dragstart="onDragStart($event, b.id)"
              @dragend="onDragEnd"
              @dragover.prevent
              @drop.stop="onDropOnBook($event, b.id)"
            />
            <p v-if="shelfBooks.length === 0 && si === firstEmptyIndex" class="waiting">
              This shelf is waiting for books.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import BookSpine from './BookSpine.vue'
import {
  findBookcase,
  reorderBook,
  reorderBookToIndex,
  SHELVES_PER_CASE,
  BOOKS_PER_SHELF,
} from '../lib/store'

const props = defineProps({
  bookcaseId: { type: String, required: true },
})
defineEmits(['back', 'search', 'openBook'])

const booksPerShelf = BOOKS_PER_SHELF
const bookcase = computed(() => findBookcase(props.bookcaseId))

const draggedId = ref(null)

function onDragStart(e, bookId) {
  draggedId.value = bookId
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', bookId)
}
function onDragEnd() {
  draggedId.value = null
}
function onDropOnBook(e, targetBookId) {
  const sourceId = draggedId.value || e.dataTransfer.getData('text/plain')
  if (!bookcase.value || !sourceId) return
  reorderBook(bookcase.value.id, sourceId, targetBookId)
  draggedId.value = null
}
function onDropOnShelf(e, si, shelfBooks) {
  const sourceId = draggedId.value || e.dataTransfer.getData('text/plain')
  if (!bookcase.value || !sourceId) return
  // Dropped on empty shelf space (not on another spine) — place it at the
  // end of this specific shelf's row.
  reorderBookToIndex(bookcase.value.id, sourceId, si * BOOKS_PER_SHELF + shelfBooks.length)
  draggedId.value = null
}

const tiers = computed(() => {
  const books = bookcase.value ? bookcase.value.books : []
  const rows = []
  for (let i = 0; i < SHELVES_PER_CASE; i++) {
    rows.push(books.slice(i * BOOKS_PER_SHELF, (i + 1) * BOOKS_PER_SHELF))
  }
  // If there happen to be more books than 5 shelves can hold, keep overflow visible
  // on the final shelf rather than losing it.
  const overflow = books.slice(SHELVES_PER_CASE * BOOKS_PER_SHELF)
  if (overflow.length) rows[rows.length - 1] = rows[rows.length - 1].concat(overflow)
  return rows
})

const firstEmptyIndex = computed(() => tiers.value.findIndex((t) => t.length === 0))
</script>

<style scoped>
.shelf-page {
  max-width: 1180px;
  margin: 0 auto;
  padding: 34px 24px 100px;
}
.back {
  color: var(--text-muted);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 18px;
}
.back:hover {
  color: var(--gold);
}
.title-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 30px;
}
.title-row h1 {
  color: var(--gold);
  font-size: 34px;
}
.sub {
  color: var(--text-muted);
  font-size: 13px;
  margin: 6px 0 0;
}
.case {
  --wood-base: #b37552;
  --wood-dark: #643321;
  --wood-light: #ffb483;
  background:
    linear-gradient(
      90deg,
      color-mix(in srgb, var(--wood-dark) 68%, transparent) 5%,
      color-mix(in srgb, var(--wood-base) 46%, transparent) 57%,
      color-mix(in srgb, var(--wood-base) 90%, transparent) 74%,
      color-mix(in srgb, var(--wood-dark) 71%, transparent) 100%
    ),
    linear-gradient(
      180deg,
      var(--wood-base),
      color-mix(in srgb, var(--wood-base) 42%, var(--wood-light))
    );
  border: 1px solid var(--border-soft);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.35), inset 0 0 15px rgba(0, 0, 0, 0.4);
}
.case-inner {
  background: linear-gradient(180deg, #241809 0%, #1a1108 100%);
  border-radius: 10px;
  padding: 14px 16px 0;
  box-shadow:
    inset 0 4px 10px rgba(0, 0, 0, 0.55),
    inset 0 -4px 10px rgba(0, 0, 0, 0.4),
    inset 8px 0 14px -10px rgba(0, 0, 0, 0.7),
    inset -8px 0 14px -10px rgba(0, 0, 0, 0.7);
}
.shelf {
  position: relative;
  min-height: 198px;
  display: flex;
  align-items: flex-end;
  padding-bottom: 0;
}
.shelf::after {
  content: '';
  position: absolute;
  left: -2px;
  right: -2px;
  bottom: 0;
  height: 4px;
  border-radius: 1px;
  background: linear-gradient(180deg, var(--border-strong) 0%, #2a1c10 100%);
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.5);
}
.spines {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  flex-wrap: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
  min-height: 168px;
  padding: 10px 2px 0;
  position: relative;
}
.waiting {
  color: var(--text-dim);
  font-style: italic;
  font-size: 13.5px;
  margin: 0 0 10px 4px;
}
</style>

<template>
  <div v-if="entry" class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <button class="close-x" @click="$emit('close')">&times;</button>
      <h2>{{ entry.book.title }}</h2>
      <p class="author">{{ entry.book.author || 'Unknown author' }}</p>

      <div class="body">
        <div class="cover" :style="!entry.book.cover ? { background: entry.book.color } : {}">
          <img v-if="entry.book.cover" :src="entry.book.cover" :alt="entry.book.title" />
          <span v-else class="cover-fallback">{{ entry.book.title }}</span>
        </div>

        <div class="fields">
          <div class="row">
            <span class="label">Pages</span>
            <span class="value">{{ entry.book.pages || '—' }}</span>
          </div>
          <div class="row">
            <span class="label">First published</span>
            <span class="value">{{ entry.book.year || '—' }}</span>
          </div>

          <div class="block">
            <span class="label">My rating</span>
            <StarRating :model-value="entry.book.rating" size="lg" @update:model-value="onRate" />
          </div>

          <div class="block">
            <span class="label">My review</span>
            <template v-if="!editingReview">
              <p v-if="entry.book.review" class="review-text">{{ entry.book.review }}</p>
              <p v-else class="review-text placeholder">Not yet written.</p>
              <button class="btn dark small" @click="startReview">
                {{ entry.book.review ? 'Edit review' : 'Write a review' }}
              </button>
            </template>
            <template v-else>
              <textarea v-model="draftReview" placeholder="What did you think?" rows="4"></textarea>
              <div class="review-actions">
                <button class="btn small" @click="saveReview">Save</button>
                <button class="btn dark small" @click="editingReview = false">Cancel</button>
              </div>
            </template>
          </div>
        </div>
      </div>

      <div class="actions">
        <button class="btn" @click="share">Share</button>
        <button class="btn dark" :disabled="!canMoveLeft" @click="$emit('move', 'left')">Move left</button>
        <button class="btn dark" :disabled="!canMoveRight" @click="$emit('move', 'right')">Move right</button>
        <button class="btn danger" @click="$emit('remove')">Remove</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import StarRating from './StarRating.vue'
import { updateBook } from '../lib/store'

const props = defineProps({
  entry: { type: Object, default: null }, // { bookcase, book }
})
const emit = defineEmits(['close', 'move', 'remove', 'toast'])

const editingReview = ref(false)
const draftReview = ref('')

function onRate(value) {
  updateBook(props.entry.bookcase.id, props.entry.book.id, { rating: value })
}

function startReview() {
  draftReview.value = props.entry.book.review || ''
  editingReview.value = true
}
function saveReview() {
  updateBook(props.entry.bookcase.id, props.entry.book.id, { review: draftReview.value.trim() })
  editingReview.value = false
}

const canMoveLeft = computed(() => {
  if (!props.entry) return false
  const idx = props.entry.bookcase.books.findIndex((b) => b.id === props.entry.book.id)
  return idx > 0
})
const canMoveRight = computed(() => {
  if (!props.entry) return false
  const idx = props.entry.bookcase.books.findIndex((b) => b.id === props.entry.book.id)
  return idx !== -1 && idx < props.entry.bookcase.books.length - 1
})

async function share() {
  const b = props.entry.book
  const stars = '★'.repeat(Math.round(b.rating)) + '☆'.repeat(5 - Math.round(b.rating))
  let text = `${b.title}${b.author ? ' by ' + b.author : ''}\n${stars}`
  if (b.review) text += `\n"${b.review}"`
  text += '\n— from my shelf'
  try {
    if (navigator.share) {
      await navigator.share({ title: b.title, text })
      return
    }
  } catch (e) {
    /* fall through to clipboard */
  }
  try {
    await navigator.clipboard.writeText(text)
    emit('toast', 'Copied to clipboard')
  } catch (e) {
    emit('toast', 'Could not copy — select and copy manually')
  }
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(6, 4, 2, 0.75);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}
.modal {
  width: 100%;
  max-width: 700px;
  max-height: 88vh;
  overflow: auto;
  background: #17100a;
  border: 1px solid var(--border-soft);
  border-radius: 12px;
  padding: 34px 34px 26px;
  position: relative;
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.6);
}
.close-x {
  position: absolute;
  top: 14px;
  right: 16px;
  color: var(--text-muted);
  font-size: 22px;
}
.close-x:hover {
  color: var(--gold);
}
h2 {
  color: var(--gold);
  font-size: 30px;
  margin-bottom: 4px;
  padding-right: 24px;
}
.author {
  color: var(--text-muted);
  margin: 0 0 22px;
}
.body {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}
.cover {
  width: 180px;
  height: 260px;
  flex: none;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
}
.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cover-fallback {
  font-family: 'Playfair Display', serif;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  font-size: 13px;
}
.fields {
  flex: 1;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.row {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-soft);
  padding-bottom: 8px;
}
.label {
  font-size: 11.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.value {
  color: var(--text-main);
  font-size: 14.5px;
}
.block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.review-text {
  color: var(--text-main);
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}
.review-text.placeholder {
  color: var(--text-dim);
  font-style: italic;
}
textarea {
  background: #100b06;
  border: 1px solid var(--border-soft);
  border-radius: 6px;
  color: var(--text-main);
  padding: 10px;
  font-size: 14px;
  resize: vertical;
}
textarea:focus {
  outline: none;
  border-color: var(--gold);
}
.review-actions {
  display: flex;
  gap: 8px;
}
.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 26px;
  padding-top: 18px;
  border-top: 1px solid var(--border-soft);
}
</style>

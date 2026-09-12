<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <button class="close-x" @click="$emit('close')">&times;</button>
      <h2>Find a book</h2>
      <p class="sub">Search millions of real titles by name or author, then place one on a bookcase.</p>

      <div class="field">
        <label class="label" for="bookcase-picker">Add to</label>
        <select id="bookcase-picker" v-model="selectedBookcaseId">
          <option v-for="bc in library.bookcases" :key="bc.id" :value="bc.id">{{ bc.name }}</option>
          <option value="__new__">Create new bookcase…</option>
        </select>
        <input
          v-if="selectedBookcaseId === '__new__'"
          v-model="newBookcaseName"
          type="text"
          class="new-bookcase-input"
          placeholder="New bookcase name, e.g. Travel"
        />
      </div>

      <form class="search-row" @submit.prevent="runSearch">
        <input v-model="query" type="text" placeholder="Title or author…" autocomplete="off" autofocus />
        <button class="btn" type="submit" :disabled="loading">{{ loading ? 'Searching…' : 'Search' }}</button>
      </form>

      <p v-if="status" class="status">{{ status }}</p>

      <div class="results">
        <div v-for="r in results" :key="r.olKey || r.title + r.author" class="result-row">
          <div class="cover">
            <img v-if="r.coverSmall" :src="r.coverSmall" :alt="r.title" />
            <span v-else class="no-cover">No cover</span>
          </div>
          <div class="meta">
            <div class="title">{{ r.title }}</div>
            <div class="sub-line">
              {{ [r.author, r.year, r.pages ? `${r.pages} pages` : null].filter(Boolean).join(' · ') }}
            </div>
          </div>
          <button class="btn dark small" @click="shelve(r)">Shelve</button>
        </div>
      </div>
    </div>

    <div v-if="addedBookTitle" class="confirm-overlay" @click.self="confirmAdded">
      <div class="confirm-box">
        <p>"{{ addedBookTitle }}" added successfully</p>
        <button class="btn" @click="confirmAdded">Okay</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { searchBooks } from '../lib/openLibrary'
import { library, addBookcase } from '../lib/store'

const props = defineProps({
  bookcaseId: { type: String, default: null },
})
const emit = defineEmits(['close', 'shelve'])

const query = ref('')
const results = ref([])
const loading = ref(false)
const status = ref('')
const addedBookTitle = ref(null)

const selectedBookcaseId = ref(
  props.bookcaseId || library.bookcases[0]?.id || '__new__'
)
const newBookcaseName = ref('')

async function runSearch() {
  const q = query.value.trim()
  if (q.length < 2) {
    status.value = 'Type at least two characters to search.'
    return
  }
  loading.value = true
  status.value = ''
  try {
    const docs = await searchBooks(q)
    results.value = docs
    status.value = docs.length ? '' : 'No matches — try a different search.'
  } catch (e) {
    status.value = "Search is unavailable right now. Check your connection and try again."
    results.value = []
  } finally {
    loading.value = false
  }
}

function shelve(result) {
  let bookcaseId = selectedBookcaseId.value

  if (bookcaseId === '__new__') {
    const created = addBookcase(newBookcaseName.value)
    if (!created) {
      status.value = 'Type a name for the new bookcase first.'
      return
    }
    bookcaseId = created.id
    selectedBookcaseId.value = created.id
    newBookcaseName.value = ''
  }

  emit('shelve', { bookcaseId, result })
  addedBookTitle.value = result.title
}

function confirmAdded() {
  addedBookTitle.value = null
  emit('close')
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
  max-width: 640px;
  max-height: 86vh;
  overflow: auto;
  background: #17100a;
  border: 1px solid var(--border-soft);
  border-radius: 12px;
  padding: 30px 30px 26px;
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
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(6, 4, 2, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
}
.confirm-box {
  background: #1d140b;
  border: 1px solid var(--border-soft);
  border-radius: 10px;
  padding: 26px 28px;
  max-width: 360px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}
.confirm-box p {
  color: var(--text-main);
  font-size: 15px;
  margin: 0 0 18px;
}
h2 {
  color: var(--gold);
  font-size: 26px;
  margin-bottom: 6px;
}
.sub {
  color: var(--text-muted);
  font-size: 14px;
  margin: 0 0 20px;
}
.field {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}
.label {
  font-size: 11.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.field select,
.new-bookcase-input {
  background: #100b06;
  border: 1px solid var(--border-soft);
  border-radius: 8px;
  padding: 9px 12px;
  color: var(--text-main);
  font-size: 14px;
}
.field select:focus,
.new-bookcase-input:focus {
  outline: none;
  border-color: var(--gold);
}
.new-bookcase-input {
  flex: 1;
  min-width: 180px;
}
.search-row {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}
.search-row input {
  flex: 1;
  background: #100b06;
  border: 1px solid var(--border-soft);
  border-radius: 8px;
  padding: 12px 14px;
  color: var(--text-main);
  font-size: 15px;
}
.search-row input:focus {
  outline: none;
  border-color: var(--gold);
}
.status {
  color: var(--text-muted);
  font-size: 13px;
  min-height: 16px;
  margin: 0 0 8px;
}
.results {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 50vh;
  overflow-y: auto;
}
.result-row {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #1d140b;
  border: 1px solid var(--border-soft);
  border-radius: 8px;
  padding: 10px 12px;
}
.cover {
  width: 46px;
  height: 66px;
  flex: none;
  background: #2a1c10;
  border-radius: 3px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.no-cover {
  font-size: 8px;
  color: var(--text-dim);
  text-align: center;
  padding: 4px;
}
.meta {
  flex: 1;
  min-width: 0;
}
.title {
  font-weight: 600;
  font-size: 15px;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sub-line {
  font-size: 12.5px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

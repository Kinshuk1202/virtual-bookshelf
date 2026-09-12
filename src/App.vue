<template>
  <div v-if="!authReady" class="loading-screen">Loading…</div>

  <AuthGate v-else-if="!currentUser" />

  <template v-else>
    <nav class="topbar">
      <span class="brand">My Virtual Bookshelf</span>
      <div class="topbar-actions">
        <button class="link" @click="goProfile">Profile</button>
        <button class="link" @click="onSignOut">Sign out</button>
      </div>
    </nav>

    <HomeRoom v-if="view.page === 'home'" @open="openBookcase" @search="searchModalOpen = true" />
    <ProfilePage v-else-if="view.page === 'profile'" @back="goHome" @open="openBookcase" />
    <ShelfPage
      v-else
      :bookcase-id="view.bookcaseId"
      @back="goHome"
      @search="searchModalOpen = true"
      @open-book="openBook"
    />

    <SearchModal
      v-if="searchModalOpen"
      :bookcase-id="view.bookcaseId"
      @close="searchModalOpen = false"
      @shelve="onShelve"
    />

    <BookModal
      v-if="activeEntry"
      :entry="activeEntry"
      @close="activeBookId = null"
      @move="onMove"
      @remove="onRemove"
      @toast="showToast"
    />

    <div id="toast" :class="{ show: toastVisible }">{{ toastMessage }}</div>
  </template>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import HomeRoom from './components/HomeRoom.vue'
import ShelfPage from './components/ShelfPage.vue'
import ProfilePage from './components/ProfilePage.vue'
import AuthGate from './components/AuthGate.vue'
import SearchModal from './components/SearchModal.vue'
import BookModal from './components/BookModal.vue'
import { addBookToBookcase, removeBook, moveBook, findBook } from './lib/store'
import { currentUser, authReady, signOutUser } from './lib/auth'

const view = reactive({ page: 'home', bookcaseId: null })
const searchModalOpen = ref(false)
const activeBookId = ref(null)

const activeEntry = computed(() => (activeBookId.value ? findBook(activeBookId.value) : null))

function openBookcase(id) {
  view.page = 'shelf'
  view.bookcaseId = id
}
function goHome() {
  view.page = 'home'
  view.bookcaseId = null
}
function goProfile() {
  view.page = 'profile'
  view.bookcaseId = null
}
function openBook(id) {
  activeBookId.value = id
}

function onSignOut() {
  if (window.confirm('Sign out of My Virtual Bookshelf?')) {
    signOutUser()
  }
}

function onShelve({ bookcaseId, result }) {
  addBookToBookcase(bookcaseId, {
    title: result.title,
    author: result.author,
    year: result.year,
    pages: result.pages,
    cover: result.cover,
    olKey: result.olKey,
  })
}

function onMove(direction) {
  if (!activeEntry.value) return
  moveBook(activeEntry.value.bookcase.id, activeEntry.value.book.id, direction)
}

function onRemove() {
  if (!activeEntry.value) return
  removeBook(activeEntry.value.bookcase.id, activeEntry.value.book.id)
  activeBookId.value = null
  showToast('Book removed')
}

const toastMessage = ref('')
const toastVisible = ref(false)
let toastTimer = null
function showToast(msg) {
  toastMessage.value = msg
  toastVisible.value = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toastVisible.value = false), 2200)
}
</script>

<style scoped>
.loading-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 14px;
}
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1180px;
  margin: 0 auto;
  padding: 18px 24px 0;
}
.brand {
  font-family: 'Playfair Display', serif;
  font-weight: 600;
  color: var(--gold);
  font-size: 15px;
  letter-spacing: 0.02em;
}
.topbar-actions {
  display: flex;
  gap: 16px;
}
.topbar-actions .link {
  color: var(--text-muted);
  font-size: 12.5px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.topbar-actions .link:hover {
  color: var(--gold);
}
</style>

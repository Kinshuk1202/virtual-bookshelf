<template>
  <div class="profile">
    <button class="back" @click="$emit('back')">&larr; Back to the room</button>

    <div class="head">
      <span class="eyebrow">Reader profile</span>
      <h1>{{ displayName }}</h1>
      <p class="sub">
        {{ totalBooks }} {{ totalBooks === 1 ? 'book' : 'books' }} across
        {{ library.bookcases.length }} {{ library.bookcases.length === 1 ? 'bookcase' : 'bookcases' }}
      </p>
    </div>

    <div v-if="library.bookcases.length === 0" class="empty">
      <p>No bookcases yet — head back to the room to add one.</p>
    </div>
    <ul v-else class="case-list">
      <li v-for="bc in library.bookcases" :key="bc.id" class="case-row" @click="$emit('open', bc.id)">
        <span class="case-name">{{ bc.name }}</span>
        <span class="case-count">{{ bc.books.length }} {{ bc.books.length === 1 ? 'book' : 'books' }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { library } from '../lib/store'
import { currentUser } from '../lib/auth'

defineEmits(['back', 'open'])

const displayName = computed(() => currentUser.value?.displayName || currentUser.value?.email || 'Reader')
const totalBooks = computed(() => library.bookcases.reduce((n, bc) => n + bc.books.length, 0))
</script>

<style scoped>
.profile {
  max-width: 720px;
  margin: 0 auto;
  padding: 34px 24px 100px;
}
.back {
  display: block;
  color: var(--text-muted);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 24px;
}
.back:hover {
  color: var(--gold);
}
.head {
  text-align: center;
  margin-bottom: 34px;
}
.head h1 {
  color: var(--gold);
  font-size: 34px;
  margin: 8px 0 8px;
}
.sub {
  color: var(--text-muted);
  font-size: 14px;
}
.empty {
  text-align: center;
  color: var(--text-muted);
  padding: 40px 0;
}
.case-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.case-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-card);
  border: 1px solid var(--border-soft);
  border-radius: 10px;
  padding: 14px 18px;
  cursor: pointer;
  transition: border-color 0.15s ease, transform 0.15s ease;
}
.case-row:hover {
  border-color: var(--border-strong);
  transform: translateY(-1px);
}
.case-name {
  font-family: 'Playfair Display', serif;
  font-weight: 600;
  font-size: 17px;
  color: var(--text-main);
}
.case-count {
  font-size: 12.5px;
  color: var(--text-muted);
}
</style>

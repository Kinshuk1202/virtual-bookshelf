<template>
  <div class="home">
    <div class="head">
      <span class="eyebrow">The Reading Room</span>
      <h1>My Virtual Bookshelf</h1>

      <div class="head-actions" >
        <form class="new-case-form" @submit.prevent="onAdd">
          <input v-model="newName" type="text" placeholder="New bookcase name, e.g. Travel" />
          <button class="btn" type="submit">Add bookcase</button>
        </form>
        <button class="btn dark" type="button" @click="$emit('search')">Search &amp; add a book</button>
      </div>
    </div>

    <div v-if="library.bookcases.length === 0" class="empty">
      <h2>The room is empty</h2>
      <p>Add your first bookcase above to get started.</p>
    </div>

    <div v-else class="grid">
      <BookcaseCard
        v-for="bc in library.bookcases"
        :key="bc.id"
        :bookcase="bc"
        @open="$emit('open', bc.id)"
        @rename="onRename"
        @delete="onDelete"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BookcaseCard from './BookcaseCard.vue'
import { library, addBookcase, renameBookcase, deleteBookcase } from '../lib/store'

defineEmits(['open', 'search'])

const newName = ref('')

function onAdd() {
  if (!newName.value.trim()) return
  addBookcase(newName.value)
  newName.value = ''
}

function onRename(id) {
  const bc = library.bookcases.find((b) => b.id === id)
  const name = window.prompt('Rename bookcase:', bc?.name || '')
  if (name) renameBookcase(id, name)
}

function onDelete(id) {
  const bc = library.bookcases.find((b) => b.id === id)
  if (!bc) return
  if (window.confirm(`Delete "${bc.name}" and all ${bc.books.length} book(s) on it?`)) {
    deleteBookcase(id)
  }
}
</script>

<style scoped>
.home {
  max-width: 1180px;
  margin: 0 auto;
  padding: 48px 24px 100px;
}
.head {
  text-align: center;
  margin-bottom: 46px;
}
.head h1 {
  font-size: 44px;
  color: var(--text-main);
  margin: 10px 0 16px;
}
.sub {
  color: var(--text-muted);
  max-width: 620px;
  margin: 0 auto 26px;
  line-height: 1.5;
  font-size: 15px;
}
.head-actions {
  display: flex;
  flex-direction:column;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
.new-case-form {
  display: inline-flex;
  gap: 10px;
}
.new-case-form input {
  background: var(--bg-card);
  border: 1px solid var(--border-soft);
  border-radius: 6px;
  padding: 11px 14px;
  color: var(--text-main);
  font-size: 14px;
  width: 280px;
}
.new-case-form input:focus {
  outline: none;
  border-color: var(--gold);
}
.grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 26px;
}
.empty {
  text-align: center;
  color: var(--text-muted);
  padding: 60px 0;
}
.empty h2 {
  color: var(--text-main);
  margin-bottom: 8px;
}
</style>

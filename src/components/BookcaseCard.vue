<template>
  <div class="card" @click="$emit('open')">
    <div class="controls" @click.stop>
      <button class="icon-btn" title="Rename" @click="onRename">✎</button>
      <button class="icon-btn" title="Delete" @click="onDelete">×</button>
    </div>

    <div class="case-inner">
      <div class="shelf-lines">
        <div v-for="i in shelvesPerCase" :key="i" class="shelf-line">
          <div v-if="i === 1" class="preview-spines">
            <BookSpine v-for="b in previewBooks" :key="b.id" :book="b" size="mini" />
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <span class="name">{{ bookcase.name }}</span>
      <span class="count">{{ bookcase.books.length }} {{ bookcase.books.length === 1 ? 'book' : 'books' }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BookSpine from './BookSpine.vue'
import { SHELVES_PER_CASE } from '../lib/store'

const props = defineProps({
  bookcase: { type: Object, required: true },
})
const emit = defineEmits(['open', 'rename', 'delete'])

const shelvesPerCase = SHELVES_PER_CASE
const previewBooks = computed(() => props.bookcase.books.slice(0, 6))

function onRename() {
  emit('rename', props.bookcase.id)
}
function onDelete() {
  emit('delete', props.bookcase.id)
}
</script>

<style scoped>
.card {
  --wood-base: #b37552;
  --wood-dark: #643321;
  --wood-light: #ffb483;
  position: relative;
  width: 340px;
  flex: none;
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
  padding: 14px 14px 16px;
  cursor: pointer;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.35), inset 0 0 15px rgba(0, 0, 0, 0.4);
  transition: border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
}
.card:hover {
  border-color: var(--border-strong);
  transform: translateY(-2px);
  box-shadow: 0 16px 30px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.06);
}
.controls {
  position: absolute;
  top: 14px;
  right: 14px;
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.15s ease;
}
.card:hover .controls {
  opacity: 1;
}
.icon-btn {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.3);
  color: var(--text-muted);
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-btn:hover {
  background: rgba(0, 0, 0, 0.5);
  color: var(--gold);
}
.case-inner {
  background: linear-gradient(180deg, #241809 0%, #1a1108 100%);
  border-radius: 10px;
  padding: 18px 16px 6px;
  margin-bottom: 18px;
  box-shadow:
    inset 0 4px 10px rgba(0, 0, 0, 0.55),
    inset 0 -4px 10px rgba(0, 0, 0, 0.4),
    inset 8px 0 14px -10px rgba(0, 0, 0, 0.7),
    inset -8px 0 14px -10px rgba(0, 0, 0, 0.7);
}
.shelf-lines {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.shelf-line {
  position: relative;
  min-height: 42px;
  display: flex;
  align-items: flex-end;
}
.shelf-line::after {
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
.preview-spines {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  padding-bottom: 4px;
  position: relative;
  z-index: 1;
}
.footer {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.name {
  font-family: 'Playfair Display', serif;
  font-weight: 600;
  font-size: 19px;
  color: var(--gold);
}
.count {
  font-size: 12.5px;
  color: var(--text-muted);
}
</style>

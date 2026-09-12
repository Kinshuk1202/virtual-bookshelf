<template>
  <div
    class="spine"
    :class="size"
    :style="spineStyle"
    @click="$emit('click')"
    :title="book.author ? `${book.title} — ${book.author}` : book.title"
  >
    <span v-if="size === 'full'" class="spine-text" :style="{ color: textColor }">{{ book.title }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { contrastText } from '../lib/colors'

const props = defineProps({
  book: { type: Object, required: true },
  size: { type: String, default: 'full' }, // 'mini' | 'full'
  dragging: { type: Boolean, default: false },
})

const textColor = computed(() => contrastText(props.book.color))
const isFull = computed(() => props.size === 'full')

// Deterministic 0..1 value derived from the book's stable id, so each book's
// "randomness" (width/lean/shade) stays the same across re-renders instead
// of reshuffling every time the shelf repaints.
function hash01(seed) {
  let h = 5381
  for (let i = 0; i < seed.length; i++) h = (h * 33) ^ seed.charCodeAt(i)
  return ((h >>> 0) % 10000) / 10000
}
function jitter(salt) {
  return hash01(`${props.book.id}:${salt}`)
}

const width = computed(() => {
  if (!isFull.value) return null
  if (props.book.pages) return Math.round(Math.max(24, Math.min(58, 24 + props.book.pages / 10)))
  return Math.round(26 + jitter('w') * 12) // 26-38px when page count is unknown
})
const heightPx = computed(() => (isFull.value ? Math.round(160 + jitter('h') * 14) : null)) // 160-174px, never below the default
const rotationDeg = computed(() => (isFull.value ? (-1.5 + jitter('r') * 3).toFixed(2) : 0))
const hueDeg = computed(() => (-6 + jitter('hue') * 12).toFixed(1))
const brightness = computed(() => (0.93 + jitter('b') * 0.14).toFixed(3))
const saturation = computed(() => (0.9 + jitter('s') * 0.2).toFixed(3))

const spineStyle = computed(() => {
  const style = {
    backgroundColor: props.book.color,
    '--base-rot': `${rotationDeg.value}deg`,
  }
  if (isFull.value) {
    style.width = `${width.value}px`
    style.height = `${heightPx.value}px`
    style.filter = `hue-rotate(${hueDeg.value}deg) saturate(${saturation.value}) brightness(${brightness.value}) drop-shadow(0 3px 3px rgba(0, 0, 0, 0.35))`
  }
  if (props.dragging) {
    style.opacity = 0.4
  }
  return style
})
</script>

<style scoped>
.spine {
  flex: none;
  border-radius: 2px 2px 0 0;
  cursor: pointer;
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.16) 0%,
    rgba(255, 255, 255, 0) 16%,
    rgba(0, 0, 0, 0) 70%,
    rgba(0, 0, 0, 0.25) 100%
  );
  box-shadow: inset -4px 0 8px rgba(0, 0, 0, 0.32), inset 2px 0 0 rgba(255, 255, 255, 0.06);
  transition: transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1.2), box-shadow 0.22s ease;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 14px;
  position: relative;
  transform-origin: bottom center;
  transform: rotateZ(var(--base-rot, 0deg));
}
.spine.full:hover {
  transform: translateY(-10px) rotateZ(calc(var(--base-rot, 0deg) - 2.5deg));
  box-shadow: 0 16px 20px rgba(0, 0, 0, 0.45);
  z-index: 3;
}
.spine.mini {
  width: 12px;
  height: 40px;
  padding-top: 0;
}
.spine.full::before,
.spine.full::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 3px;
  background: repeating-linear-gradient(
    90deg,
    rgba(244, 234, 217, 0.55) 0 2px,
    rgba(36, 26, 16, 0.5) 2px 4px
  );
  pointer-events: none;
}
.spine.full::before {
  top: 6px;
}
.spine.full::after {
  bottom: 6px;
}
.spine-text {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  max-height: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  position: relative;
  z-index: 1;
}
</style>

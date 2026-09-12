<template>
  <div class="star-rating" :class="{ [sizeClass]: true }">
    <div class="star-row" :class="{ editable }">
      <span
        v-for="i in 5"
        :key="i"
        class="star-wrap"
        @click="onClick($event, i)"
        @mousemove="editable && onHover($event, i)"
        @mouseleave="hoverValue = null"
      >
        <span class="star back">★</span>
        <span class="star front" :style="{ width: fillPercent(i) + '%' }">★</span>
      </span>
    </div>
    <input
      v-if="editable"
      class="rating-input"
      type="number"
      min="0"
      max="5"
      step="0.1"
      v-model="typedValue"
      @change="onTypedChange"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  editable: { type: Boolean, default: true },
  size: { type: String, default: 'md' }, // 'sm' | 'md' | 'lg'
})
const emit = defineEmits(['update:modelValue'])

const hoverValue = ref(null)
const sizeClass = computed(() => `size-${props.size}`)
const typedValue = ref(props.modelValue)

watch(
  () => props.modelValue,
  (val) => {
    typedValue.value = val
  }
)

function valueAt(e, i) {
  const rect = e.currentTarget.getBoundingClientRect()
  const ratio = (e.clientX - rect.left) / rect.width
  return ratio < 0.5 ? i - 0.5 : i
}

function fillPercent(i) {
  const active = hoverValue.value ?? props.modelValue
  const val = active - (i - 1)
  return Math.max(0, Math.min(1, val)) * 100
}

function onClick(e, i) {
  if (!props.editable) return
  emit('update:modelValue', valueAt(e, i))
}

function onHover(e, i) {
  hoverValue.value = valueAt(e, i)
}

function onTypedChange() {
  let val = parseFloat(typedValue.value)
  if (Number.isNaN(val)) val = 0
  val = Math.max(0, Math.min(5, val))
  typedValue.value = val
  emit('update:modelValue', val)
}
</script>

<style scoped>
.star-rating {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.star-row {
  display: inline-flex;
  gap: 4px;
}
.size-sm { font-size: 14px; }
.size-md { font-size: 22px; }
.size-lg { font-size: 30px; }
.rating-input {
  width: 4.2em;
  font-size: 13px;
  background: #100b06;
  border: 1px solid var(--border-soft);
  border-radius: 6px;
  color: var(--text-main);
  padding: 4px 6px;
}
.rating-input:focus {
  outline: none;
  border-color: var(--gold);
}
.star-wrap {
  position: relative;
  display: inline-block;
  width: 1em;
  height: 1em;
  line-height: 1;
}
.star-row.editable .star-wrap { cursor: pointer; }
.star {
  position: absolute;
  top: 0;
  left: 0;
  line-height: 1;
}
.back { color: #4a4038; }
.front {
  color: var(--gold, #d8ab4e);
  overflow: hidden;
  white-space: nowrap;
}
</style>

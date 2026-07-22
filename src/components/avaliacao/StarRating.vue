<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: number | null
    readonly?: boolean
    label?: string
  }>(),
  {
    readonly: false,
    label: '',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const stars = [0, 1, 2, 3, 4, 5]

const displayValue = computed(() => props.modelValue ?? -1)

function select(nota: number) {
  if (props.readonly) return
  emit('update:modelValue', nota)
}
</script>

<template>
  <div class="avaliacao-star-rating">
    <p v-if="label" class="avaliacao-star-rating__label">{{ label }}</p>
    <div class="avaliacao-star-rating__row" role="group" :aria-label="label || 'Nota de 0 a 5'">
      <button
        v-for="nota in stars"
        :key="nota"
        type="button"
        class="avaliacao-star-rating__btn"
        :class="{ 'avaliacao-star-rating__btn--active': nota <= displayValue }"
        :disabled="readonly"
        :aria-label="`${nota} estrelas`"
        :aria-pressed="nota === displayValue"
        @click="select(nota)"
      >
        <svg viewBox="0 0 24 24" class="avaliacao-star-rating__icon" aria-hidden="true">
          <path
            d="M12 2.5l2.9 6.1 6.7.6-5.1 4.4 1.6 6.5L12 17.8 5.9 20.1l1.6-6.5-5.1-4.4 6.7-.6L12 2.5z"
            fill="currentColor"
          />
        </svg>
        <span class="avaliacao-star-rating__num">{{ nota }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.avaliacao-star-rating__label {
  margin-bottom: 0.5rem;
  font-family: var(--font-urbanist, sans-serif);
  font-size: 0.875rem;
  color: var(--glow-text-subtle);
}

.avaliacao-star-rating__row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.avaliacao-star-rating__btn {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  padding: 0.35rem 0.45rem;
  border: 1px solid var(--glow-border-soft);
  border-radius: 0.5rem;
  background: transparent;
  color: var(--glow-text-subtle);
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}

.avaliacao-star-rating__btn:not(:disabled):hover {
  border-color: var(--glow-gold-cta);
  color: var(--glow-gold-cta);
}

.avaliacao-star-rating__btn--active {
  border-color: var(--glow-gold-cta);
  background: color-mix(in srgb, var(--glow-gold-cta) 12%, transparent);
  color: var(--glow-gold-cta);
}

.avaliacao-star-rating__btn:disabled {
  cursor: default;
}

.avaliacao-star-rating__icon {
  width: 1.25rem;
  height: 1.25rem;
}

.avaliacao-star-rating__num {
  font-size: 0.65rem;
  font-weight: 600;
  line-height: 1;
}
</style>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: number | null
    diasPermitidos?: number[]
    label?: string
    error?: string
  }>(),
  {
    diasPermitidos: () => [5, 10, 15, 20],
    label: 'Dia de vencimento',
  },
)

const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const opcoes = computed(() => props.diasPermitidos)
</script>

<template>
  <div class="flex flex-col gap-2">
    <span class="font-urbanist text-sm font-medium text-glow-text">{{ label }}</span>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="dia in opcoes"
        :key="dia"
        type="button"
        class="rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
        :class="
          modelValue === dia
            ? 'border-glow-gold bg-glow-gold-soft text-glow-text'
            : 'border-glow-border-soft bg-glow-canvas text-glow-text-subtle hover:border-glow-gold-dark'
        "
        @click="emit('update:modelValue', dia)"
      >
        Dia {{ dia }}
      </button>
    </div>
    <p v-if="error" class="text-xs text-red-600">{{ error }}</p>
    <p v-else class="text-xs text-glow-text-subtle">
      Vencimento todo dia {{ modelValue ?? '—' }} de cada mês
    </p>
  </div>
</template>

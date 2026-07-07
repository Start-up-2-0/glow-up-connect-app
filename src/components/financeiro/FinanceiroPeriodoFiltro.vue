<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue'

const inicio = defineModel<string>('inicio', { default: '' })
const fim = defineModel<string>('fim', { default: '' })

const emit = defineEmits<{ aplicar: [] }>()
</script>

<template>
  <div class="flex flex-wrap items-end gap-3">
    <label class="font-urbanist text-sm text-glow-text-subtle">
      De
      <input
        v-model="inicio"
        type="date"
        class="mt-1 block rounded border border-glow-border-soft bg-glow-canvas px-3 py-1.5 text-glow-text"
      />
    </label>
    <label class="font-urbanist text-sm text-glow-text-subtle">
      Até
      <input
        v-model="fim"
        type="date"
        class="mt-1 block rounded border border-glow-border-soft bg-glow-canvas px-3 py-1.5 text-glow-text"
      />
    </label>
    <BaseButton size="sm" variant="secondary" @click="emit('aplicar')">Filtrar</BaseButton>
  </div>
</template>

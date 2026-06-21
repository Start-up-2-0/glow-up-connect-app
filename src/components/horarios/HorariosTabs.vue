<script setup lang="ts">
import type { HorariosAba } from '@/composables/useHorarios'

defineProps<{
  modelValue: HorariosAba
  showProfissionais: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: HorariosAba]
}>()
</script>

<template>
  <nav class="horarios-tabs" aria-label="Abas de horários">
    <button
      type="button"
      class="horarios-tabs__item"
      :class="{ 'horarios-tabs__item--active': modelValue === 'loja' }"
      @click="emit('update:modelValue', 'loja')"
    >
      Loja
    </button>
    <button
      v-if="showProfissionais"
      type="button"
      class="horarios-tabs__item"
      :class="{ 'horarios-tabs__item--active': modelValue === 'profissional' }"
      @click="emit('update:modelValue', 'profissional')"
    >
      Profissionais
    </button>
    <span
      class="horarios-tabs__indicator"
      :class="
        modelValue === 'profissional'
          ? 'horarios-tabs__indicator--profissionais'
          : 'horarios-tabs__indicator--loja'
      "
      aria-hidden="true"
    />
  </nav>
</template>

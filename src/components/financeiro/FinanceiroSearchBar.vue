<script setup lang="ts">
import { Search, X } from 'lucide-vue-next'

const model = defineModel<string>({ default: '' })

defineProps<{
  placeholder?: string
}>()

const emit = defineEmits<{ search: [value: string] }>()

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  model.value = value
  emit('search', value)
}

function limpar() {
  model.value = ''
  emit('search', '')
}
</script>

<template>
  <label class="financeiro-search">
    <Search class="financeiro-search__icon" aria-hidden="true" />
    <input
      :value="model"
      type="search"
      class="financeiro-search__input"
      :placeholder="placeholder ?? 'Buscar movimentações, contas...'"
      autocomplete="off"
      spellcheck="false"
      @input="onInput"
    />
    <button
      v-if="model"
      type="button"
      class="financeiro-search__clear"
      aria-label="Limpar busca"
      @click="limpar"
    >
      <X class="size-3.5" aria-hidden="true" />
    </button>
  </label>
</template>

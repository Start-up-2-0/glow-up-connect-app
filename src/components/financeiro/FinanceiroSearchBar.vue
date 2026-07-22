<script setup lang="ts">
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
</script>

<template>
  <label class="financeiro-search">
    <svg class="size-4 shrink-0 text-glow-text-subtle" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M9 3.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Z"
        stroke="currentColor"
        stroke-width="1.5"
      />
      <path d="M13.5 13.5L17 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </svg>
    <input
      :value="model"
      type="search"
      class="financeiro-search__input"
      :placeholder="placeholder ?? 'Buscar movimentações, contas...'"
      @input="onInput"
    />
  </label>
</template>

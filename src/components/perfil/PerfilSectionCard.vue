<script setup lang="ts">
import { Pencil } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    title: string
    description: string
    editable?: boolean
    editing?: boolean
  }>(),
  {
    editable: false,
    editing: false,
  },
)

defineEmits<{
  edit: []
}>()
</script>

<template>
  <section class="perfil-sheet">
    <header class="perfil-sheet__header">
      <div class="min-w-0">
        <h2 class="perfil-sheet__title">{{ title }}</h2>
        <p class="perfil-sheet__desc">{{ description }}</p>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <slot name="header-aside" />
        <button
          v-if="editable && !editing"
          type="button"
          class="perfil-sheet__edit"
          aria-label="Editar seção"
          @click="$emit('edit')"
        >
          <Pencil class="size-4" aria-hidden="true" />
        </button>
      </div>
    </header>
    <div class="perfil-sheet__body">
      <slot />
    </div>
    <footer v-if="$slots.footer" class="perfil-sheet__footer">
      <slot name="footer" />
    </footer>
  </section>
</template>

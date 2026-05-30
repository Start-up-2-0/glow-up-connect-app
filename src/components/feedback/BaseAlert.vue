<script setup lang="ts">
type AlertVariant = 'success' | 'error' | 'warning' | 'info'

withDefaults(
  defineProps<{
    variant?: AlertVariant
    title?: string
    dismissible?: boolean
  }>(),
  {
    variant: 'info',
    dismissible: false,
  },
)

const emit = defineEmits<{ dismiss: [] }>()
</script>

<template>
  <div role="alert">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p v-if="title">{{ title }}</p>
        <slot />
      </div>
      <button v-if="dismissible" type="button" aria-label="Fechar" @click="emit('dismiss')">
        &times;
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
}>()

const emit = defineEmits<{
  dismiss: []
  start: []
}>()
</script>

<template>
  <div class="gg-dialog-backdrop" role="presentation" @click.self="emit('dismiss')">
    <div class="gg-dialog" role="dialog" aria-modal="true" aria-labelledby="gg-suggest-title">
      <h2 id="gg-suggest-title" class="gg-dialog__title">
        {{ title || 'Primeira vez aqui?' }}
      </h2>
      <p class="gg-dialog__text">
        {{ description || 'Aprenda a usar esta página em poucos minutos.' }}
      </p>
      <div class="gg-dialog__actions">
        <button type="button" class="gg-card__btn gg-card__btn--ghost" @click="emit('dismiss')">
          Agora não
        </button>
        <button type="button" class="gg-card__btn gg-card__btn--primary" @click="emit('start')">
          Iniciar tutorial
        </button>
      </div>
    </div>
  </div>
</template>

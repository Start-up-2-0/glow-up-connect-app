<script setup lang="ts">
const emit = defineEmits<{
  stay: []
  leave: []
}>()
</script>

<template>
  <div class="gg-dialog-backdrop" role="presentation" @click.self="emit('stay')">
    <div class="gg-dialog" role="dialog" aria-modal="true" aria-labelledby="gg-exit-title">
      <h2 id="gg-exit-title" class="gg-dialog__title">Sair do tutorial?</h2>
      <p class="gg-dialog__text">
        Seu progresso será salvo e você poderá continuar depois.
      </p>
      <div class="gg-dialog__actions">
        <button type="button" class="gg-card__btn gg-card__btn--ghost" @click="emit('stay')">
          Continuar tutorial
        </button>
        <button type="button" class="gg-card__btn gg-card__btn--primary" @click="emit('leave')">
          Sair
        </button>
      </div>
    </div>
  </div>
</template>

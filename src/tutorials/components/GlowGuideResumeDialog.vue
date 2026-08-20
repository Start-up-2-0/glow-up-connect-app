<script setup lang="ts">
defineProps<{
  stepTitle?: string | null
  stepNumber?: number
  totalSteps?: number
}>()

const emit = defineEmits<{
  continue: []
  restart: []
  cancel: []
}>()
</script>

<template>
  <div class="gg-dialog-backdrop" role="presentation" @click.self="emit('cancel')">
    <div class="gg-dialog" role="dialog" aria-modal="true" aria-labelledby="gg-resume-title">
      <h2 id="gg-resume-title" class="gg-dialog__title">Continuar tutorial?</h2>
      <p class="gg-dialog__text">
        Você parou em
        <template v-if="stepTitle">
          “{{ stepTitle }}”
        </template>
        <template v-else>
          uma etapa anterior
        </template>
        .
      </p>
      <p v-if="stepNumber && totalSteps" class="gg-dialog__meta">
        Passo {{ stepNumber }} de {{ totalSteps }}
      </p>
      <div class="gg-dialog__actions">
        <button type="button" class="gg-card__btn gg-card__btn--ghost" @click="emit('restart')">
          Reiniciar
        </button>
        <button type="button" class="gg-card__btn gg-card__btn--primary" @click="emit('continue')">
          Continuar
        </button>
      </div>
    </div>
  </div>
</template>

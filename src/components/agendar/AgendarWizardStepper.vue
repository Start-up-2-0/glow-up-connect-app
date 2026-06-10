<script setup lang="ts">
import { AGENDAR_FIGMA_TOTAL } from '@/constants/agendarWizardSteps'

defineProps<{
  stepIndex: number
  stepLabel: string
  showBack?: boolean
}>()

const emit = defineEmits<{
  back: []
}>()
</script>

<template>
  <div class="agendar-wizard-stepper">
    <div class="agendar-wizard-stepper__row">
      <button
        v-if="showBack"
        type="button"
        class="agendar-wizard-stepper__back"
        aria-label="Voltar"
        @click="emit('back')"
      >
        <svg class="size-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M10 3L5 8L10 13"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <div class="agendar-wizard-stepper__meta" :class="{ 'ml-11': !showBack }">
        <p class="agendar-wizard-stepper__counter">
          ETAPA {{ stepIndex }} DE {{ AGENDAR_FIGMA_TOTAL }}
        </p>
        <p class="agendar-wizard-stepper__title">{{ stepLabel }}</p>
      </div>
    </div>
    <div class="agendar-wizard-stepper__bars" role="progressbar" :aria-valuenow="stepIndex" aria-valuemin="1" :aria-valuemax="AGENDAR_FIGMA_TOTAL">
      <div
        v-for="bar in AGENDAR_FIGMA_TOTAL"
        :key="bar"
        class="agendar-wizard-stepper__bar"
        :class="{ 'agendar-wizard-stepper__bar--active': bar === stepIndex }"
      />
    </div>
  </div>
</template>

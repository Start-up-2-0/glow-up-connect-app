<script setup lang="ts">
import {
  ONBOARDING_CONTRATAR_BTN_PRIMARY_CLASS,
  ONBOARDING_CONTRATAR_BTN_SECONDARY_CLASS,
} from '@/constants/designTokens'

withDefaults(
  defineProps<{
    submitLabel?: string
    backLabel?: string
    loading?: boolean
    showBack?: boolean
  }>(),
  {
    submitLabel: 'Continuar',
    backLabel: 'Voltar',
    showBack: true,
  },
)

const emit = defineEmits<{
  submit: []
  back: []
}>()
</script>

<template>
  <div class="flex flex-col gap-3 sm:flex-row">
    <button
      type="submit"
      :disabled="loading"
      :class="ONBOARDING_CONTRATAR_BTN_PRIMARY_CLASS"
    >
      <span
        v-if="loading"
        class="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-white border-t-transparent"
        aria-hidden="true"
      />
      {{ submitLabel }}
    </button>
    <button
      v-if="showBack"
      type="button"
      :class="ONBOARDING_CONTRATAR_BTN_SECONDARY_CLASS"
      @click="emit('back')"
    >
      {{ backLabel }}
    </button>
  </div>
</template>

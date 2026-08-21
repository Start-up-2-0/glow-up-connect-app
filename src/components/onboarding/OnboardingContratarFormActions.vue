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
  back: []
}>()
</script>

<template>
  <div
    class="flex flex-col-reverse gap-3 border-t border-glow-border-soft pt-6 sm:flex-row sm:items-center sm:justify-between"
  >
    <button
      v-if="showBack"
      type="button"
      :class="[ONBOARDING_CONTRATAR_BTN_SECONDARY_CLASS, 'sm:w-auto sm:min-w-[160px]']"
      @click="emit('back')"
    >
      {{ backLabel }}
    </button>
    <span v-else class="hidden sm:block" />

    <button
      type="submit"
      :disabled="loading"
      :class="[ONBOARDING_CONTRATAR_BTN_PRIMARY_CLASS, 'sm:w-auto sm:min-w-[200px]']"
    >
      <span
        v-if="loading"
        class="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-white border-t-transparent"
        aria-hidden="true"
      />
      {{ submitLabel }}
    </button>
  </div>
</template>

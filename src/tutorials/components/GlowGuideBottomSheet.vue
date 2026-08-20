<script setup lang="ts">
import { computed } from 'vue'
import GlowGuideCard from '@/tutorials/components/GlowGuideCard.vue'
import type { TutorialStep } from '@/tutorials/types'

const props = defineProps<{
  step: TutorialStep
  stepNumber: number
  totalSteps: number
  canGoBack: boolean
  canGoNext: boolean
  isWaitingForAction: boolean
  isWaitingForEvent: boolean
  keyboardOffset?: number
}>()

const emit = defineEmits<{
  next: []
  back: []
  skip: []
  exit: []
  finish: []
}>()

const sheetStyle = computed(() => ({
  paddingBottom: `max(16px, env(safe-area-inset-bottom))`,
  transform: props.keyboardOffset
    ? `translateY(-${props.keyboardOffset}px)`
    : undefined,
}))
</script>

<template>
  <div class="gg-sheet" :style="sheetStyle">
    <div class="gg-sheet__handle" aria-hidden="true" />
    <GlowGuideCard
      :step="step"
      :step-number="stepNumber"
      :total-steps="totalSteps"
      :can-go-back="canGoBack"
      :can-go-next="canGoNext"
      :is-waiting-for-action="isWaitingForAction"
      :is-waiting-for-event="isWaitingForEvent"
      @next="emit('next')"
      @back="emit('back')"
      @skip="emit('skip')"
      @exit="emit('exit')"
      @finish="emit('finish')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import GlowGuideCard from '@/tutorials/components/GlowGuideCard.vue'
import { computePopoverPosition } from '@/tutorials/engine/positioning'
import type { TargetRect, TutorialStep } from '@/tutorials/types'

const props = defineProps<{
  step: TutorialStep
  stepNumber: number
  totalSteps: number
  canGoBack: boolean
  canGoNext: boolean
  isWaitingForAction: boolean
  isWaitingForEvent: boolean
  targetRect: TargetRect | null
}>()

const emit = defineEmits<{
  next: []
  back: []
  skip: []
  exit: []
  finish: []
}>()

const cardRef = ref<HTMLElement | null>(null)
const style = ref<Record<string, string>>({})

function place() {
  if (!props.targetRect) {
    style.value = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: '10060',
    }
    return
  }
  const w = cardRef.value?.offsetWidth || 340
  const h = cardRef.value?.offsetHeight || 220
  const pos = computePopoverPosition(props.targetRect, w, h)
  style.value = {
    position: 'fixed',
    top: `${pos.top}px`,
    left: `${pos.left}px`,
    zIndex: '10060',
    transform: 'none',
  }
}

watch(
  () => [props.targetRect, props.step.id],
  async () => {
    await Promise.resolve()
    place()
  },
  { immediate: true, deep: true },
)

const centered = computed(() => !props.targetRect)
</script>

<template>
  <div
    ref="cardRef"
    class="gg-popover"
    :class="{ 'gg-popover--centered': centered }"
    :style="style"
  >
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

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useTutorialStore } from '@/stores/tutorial.store'
import { tutorialRegistry } from '@/tutorials/registry'
import GlowGuideOverlay from '@/tutorials/components/GlowGuideOverlay.vue'
import GlowGuidePopover from '@/tutorials/components/GlowGuidePopover.vue'
import GlowGuideBottomSheet from '@/tutorials/components/GlowGuideBottomSheet.vue'
import GlowGuideResumeDialog from '@/tutorials/components/GlowGuideResumeDialog.vue'
import GlowGuideExitDialog from '@/tutorials/components/GlowGuideExitDialog.vue'
import GlowGuideSuggestionDialog from '@/tutorials/components/GlowGuideSuggestionDialog.vue'
import { useTutorialLayout } from '@/tutorials/hooks/useTutorialLayout'

const store = useTutorialStore()
const {
  isActive,
  currentStep,
  stepNumber,
  totalSteps,
  canGoBack,
  canGoNext,
  isWaitingForAction,
  isWaitingForEvent,
  targetRect,
  layoutMode,
  interaction,
  showResumeDialog,
  showExitDialog,
  showSuggestion,
  pendingTutorialId,
} = storeToRefs(store)

const { visualOffset, update: updateLayout } = useTutorialLayout(() => targetRect.value)

const showPulse = computed(
  () =>
    Boolean(targetRect.value) &&
    (currentStep.value?.type === 'action' || currentStep.value?.type === 'input') &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
)

const isSheet = computed(() => layoutMode.value === 'sheet')

const resumeMeta = computed(() => {
  const id = pendingTutorialId.value
  if (!id) return { title: null as string | null, stepNumber: 0, total: 0 }
  const def = tutorialRegistry.get(id)
  const progress = store.getProgress(id)
  if (!def || !progress?.currentStepId) {
    return { title: null, stepNumber: 0, total: def?.steps.length ?? 0 }
  }
  const idx = def.steps.findIndex((s) => s.id === progress.currentStepId)
  return {
    title: def.steps[idx]?.title ?? null,
    stepNumber: idx >= 0 ? idx + 1 : 0,
    total: def.steps.length,
  }
})

const suggestionDef = computed(() => {
  if (!pendingTutorialId.value) return null
  return tutorialRegistry.get(pendingTutorialId.value) ?? null
})

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isActive.value) {
    e.preventDefault()
    store.requestExit()
  }
}

function onScrollOrResize() {
  if (!isActive.value) return
  store.scheduleMeasure()
  updateLayout()
}

let scrollParents: Element[] = []

function bindScrollListeners() {
  unbindScrollListeners()
  const main = document.querySelector('.dashboard-main')
  scrollParents = [window as unknown as Element]
  if (main) scrollParents.push(main)
  scrollParents.forEach((el) => {
    el.addEventListener('scroll', onScrollOrResize, { passive: true } as AddEventListenerOptions)
  })
  window.addEventListener('resize', onScrollOrResize)
  window.visualViewport?.addEventListener('resize', onScrollOrResize)
}

function unbindScrollListeners() {
  scrollParents.forEach((el) => {
    el.removeEventListener('scroll', onScrollOrResize)
  })
  scrollParents = []
  window.removeEventListener('resize', onScrollOrResize)
  window.visualViewport?.removeEventListener('resize', onScrollOrResize)
}

watch(isActive, (active) => {
  if (active) bindScrollListeners()
  else unbindScrollListeners()
})

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  if (isActive.value) bindScrollListeners()
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  unbindScrollListeners()
})
</script>

<template>
  <Teleport to="body">
    <template v-if="isActive && currentStep">
      <GlowGuideOverlay
        :target-rect="targetRect"
        :interaction="interaction"
        :pulse="showPulse"
      />

      <div class="sr-only" aria-live="polite">
        {{ currentStep.title }}. {{ currentStep.description }}
      </div>

      <GlowGuideBottomSheet
        v-if="isSheet"
        :step="currentStep"
        :step-number="stepNumber"
        :total-steps="totalSteps"
        :can-go-back="canGoBack"
        :can-go-next="canGoNext"
        :is-waiting-for-action="isWaitingForAction"
        :is-waiting-for-event="isWaitingForEvent"
        :keyboard-offset="visualOffset"
        @next="store.next()"
        @back="store.back()"
        @skip="store.skip()"
        @exit="store.requestExit()"
        @finish="store.finish()"
      />
      <GlowGuidePopover
        v-else
        :step="currentStep"
        :step-number="stepNumber"
        :total-steps="totalSteps"
        :can-go-back="canGoBack"
        :can-go-next="canGoNext"
        :is-waiting-for-action="isWaitingForAction"
        :is-waiting-for-event="isWaitingForEvent"
        :target-rect="targetRect"
        @next="store.next()"
        @back="store.back()"
        @skip="store.skip()"
        @exit="store.requestExit()"
        @finish="store.finish()"
      />
    </template>

    <GlowGuideResumeDialog
      v-if="showResumeDialog"
      :step-title="resumeMeta.title"
      :step-number="resumeMeta.stepNumber"
      :total-steps="resumeMeta.total"
      @continue="store.resumePending()"
      @restart="store.restartPending()"
      @cancel="store.cancelResumeDialog()"
    />

    <GlowGuideExitDialog
      v-if="showExitDialog"
      @stay="store.cancelExitDialog()"
      @leave="store.abandon()"
    />

    <GlowGuideSuggestionDialog
      v-if="showSuggestion && suggestionDef"
      :title="`Primeira vez em ${suggestionDef.title}?`"
      :description="suggestionDef.description"
      @dismiss="store.dismissSuggestion()"
      @start="store.acceptSuggestion()"
    />
  </Teleport>
</template>

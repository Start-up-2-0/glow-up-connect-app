import { computed, ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import router from '@/router'
import { useUserStore } from '@/stores/user.store'
import { useNegocioStore } from '@/stores/negocio.store'
import { useAppStore } from '@/stores/app.store'
import { tutorialRegistry } from '@/tutorials/registry'
import { tutorialStorage } from '@/tutorials/storage/tutorialStorage'
import { tutorialEventBus } from '@/tutorials/engine/eventBus'
import { tutorialAnalytics } from '@/tutorials/engine/analytics'
import {
  getTargetRect,
  scrollTargetIntoView,
  waitForVisibleTarget,
} from '@/tutorials/engine/targetWaiter'
import {
  estimateSheetHeight,
  resolveLayoutMode,
} from '@/tutorials/engine/positioning'
import type {
  TargetRect,
  TutorialContext,
  TutorialDefinition,
  TutorialLayoutMode,
  TutorialStep,
  TutorialStatus,
} from '@/tutorials/types'

export const useTutorialStore = defineStore('tutorial', () => {
  const isActive = ref(false)
  const tutorialId = ref<string | null>(null)
  const tutorialVersion = ref(0)
  const currentStepIndex = ref(0)
  const status = ref<TutorialStatus>('not_started')
  const targetRect = ref<TargetRect | null>(null)
  const targetEl = shallowRef<HTMLElement | null>(null)
  const layoutMode = ref<TutorialLayoutMode>('popover')
  const sheetHeight = ref(0)
  const isResolvingTarget = ref(false)
  const isWaitingForAction = ref(false)
  const isWaitingForEvent = ref(false)
  const showResumeDialog = ref(false)
  const showExitDialog = ref(false)
  const showSuggestion = ref(false)
  const pendingTutorialId = ref<string | null>(null)
  const errorTip = ref<string | null>(null)

  let eventUnsub: (() => void) | null = null
  let actionUnsub: (() => void) | null = null
  let measureRaf = 0

  const definition = computed<TutorialDefinition | null>(() => {
    if (!tutorialId.value) return null
    return tutorialRegistry.get(tutorialId.value) ?? null
  })

  const steps = computed(() => definition.value?.steps ?? [])

  const currentStep = computed<TutorialStep | null>(() => {
    return steps.value[currentStepIndex.value] ?? null
  })

  const totalSteps = computed(() => steps.value.length)

  const stepNumber = computed(() => currentStepIndex.value + 1)

  const canGoBack = computed(() => {
    const step = currentStep.value
    if (!step || step.allowBack === false) return false
    return currentStepIndex.value > 0
  })

  const canGoNext = computed(() => {
    const step = currentStep.value
    if (!step) return false
    if (step.type === 'action' || step.type === 'input' || step.type === 'wait') return false
    if (step.type === 'completion') return false
    return currentStepIndex.value < steps.value.length - 1 || step.type === 'success'
  })

  const interaction = computed(() => currentStep.value?.interaction ?? 'blocked')

  function buildContext(): TutorialContext {
    const userStore = useUserStore()
    const negocioStore = useNegocioStore()
    return {
      tutorialId: tutorialId.value ?? '',
      userId: userStore.profile?.id ?? null,
      estabelecimentoId: negocioStore.estabelecimentoIdSelecionado,
      possuiModulo: (m) => negocioStore.possuiModulo(m),
      possuiPermissao: (p) => negocioStore.possuiPermissao(p),
      apenasHorarioProprio:
        (negocioStore.possuiPermissao('HorarioGerenciarProprio') &&
          !negocioStore.possuiPermissao('HorarioGerenciar')) ||
        Boolean(negocioStore.ehProfissionalAutonomo),
    }
  }

  function userId(): number | null {
    return useUserStore().profile?.id ?? null
  }

  function persist(stepId: string | null, nextStatus: TutorialStatus) {
    if (!tutorialId.value) return
    tutorialStorage.updateProgress(userId(), tutorialId.value, {
      version: tutorialVersion.value,
      currentStepId: stepId,
      status: nextStatus,
    })
    status.value = nextStatus
  }

  function clearListeners() {
    eventUnsub?.()
    eventUnsub = null
    actionUnsub?.()
    actionUnsub = null
    isWaitingForAction.value = false
    isWaitingForEvent.value = false
  }

  function stopMeasuring() {
    if (measureRaf) {
      cancelAnimationFrame(measureRaf)
      measureRaf = 0
    }
  }

  function measureTarget() {
    const el = targetEl.value
    if (!el) {
      targetRect.value = null
      return
    }
    targetRect.value = getTargetRect(el)
    layoutMode.value = resolveLayoutMode(targetRect.value)
    sheetHeight.value =
      layoutMode.value === 'sheet' ? estimateSheetHeight() : 0
  }

  function scheduleMeasure() {
    stopMeasuring()
    measureRaf = requestAnimationFrame(() => {
      measureTarget()
      measureRaf = 0
    })
  }

  async function resolveTargetForStep(step: TutorialStep): Promise<boolean> {
    clearListeners()
    targetEl.value = null
    targetRect.value = null
    errorTip.value = null

    if (!step.target) {
      layoutMode.value = resolveLayoutMode(null)
      sheetHeight.value = layoutMode.value === 'sheet' ? estimateSheetHeight() : 0
      return true
    }

    isResolvingTarget.value = true
    try {
      const el = await waitForVisibleTarget(step.target, 8000)
      if (!el) {
        // tenta pular se possível
        return false
      }
      targetEl.value = el
      const sheet = resolveLayoutMode(getTargetRect(el)) === 'sheet'
      await scrollTargetIntoView(el, {
        sheetHeight: sheet ? estimateSheetHeight() : 0,
      })
      measureTarget()
      bindStepListeners(step, el)
      return true
    } finally {
      isResolvingTarget.value = false
    }
  }

  function bindStepListeners(step: TutorialStep, el: HTMLElement) {
    if (step.type === 'action' || step.type === 'input') {
      isWaitingForAction.value = true
    }

    if (step.waitForEvent) {
      isWaitingForEvent.value = true
      eventUnsub = tutorialEventBus.on(step.waitForEvent, () => {
        void completeCurrentStep()
      })
    }

    if (step.action === 'click' && !step.waitForEvent) {
      const onClick = () => {
        void completeCurrentStep()
      }
      el.addEventListener('click', onClick, { once: true, capture: true })
      actionUnsub = () => el.removeEventListener('click', onClick, true)
    }

    if (step.action === 'input' || step.type === 'input') {
      const onInput = () => {
        const value = (el as HTMLInputElement).value?.trim?.() ?? ''
        if (value.length > 0) void completeCurrentStep()
      }
      el.addEventListener('input', onInput)
      actionUnsub = () => el.removeEventListener('input', onInput)
    }
  }

  function resolveStepIndex(def: TutorialDefinition, stepId: string | null): number {
    if (!stepId) return 0
    const idx = def.steps.findIndex((s) => s.id === stepId)
    return idx >= 0 ? idx : 0
  }

  function nextRunnableIndex(from: number, direction: 1 | -1): number {
    const ctx = buildContext()
    let i = from
    while (i >= 0 && i < steps.value.length) {
      const step = steps.value[i]
      if (step.skipIf?.(ctx)) {
        i += direction
        continue
      }
      if (step.condition && !step.condition(ctx)) {
        i += direction
        continue
      }
      return i
    }
    if (direction === 1) return Math.min(Math.max(0, from), steps.value.length - 1)
    return Math.max(0, Math.min(from, steps.value.length - 1))
  }

  async function activateAt(index: number, direction: 1 | -1 = 1) {
    const def = definition.value
    if (!def) return

    const runnable = nextRunnableIndex(index, direction)
    currentStepIndex.value = runnable
    const step = steps.value[runnable]
    if (!step) return

    persist(step.id, 'in_progress')
    tutorialAnalytics.track('tutorial_step_viewed', {
      tutorialId: def.id,
      tutorialVersion: def.version,
      stepId: step.id,
      module: def.module,
    })

    if (step.type === 'navigation' && step.route) {
      await router.push(step.route)
    }

    const ok = await resolveTargetForStep(step)
    if (!ok && step.target) {
      // pula etapa sem target
      if (direction === 1 && runnable < steps.value.length - 1) {
        await activateAt(runnable + 1, 1)
      } else if (direction === -1 && runnable > 0) {
        await activateAt(runnable - 1, -1)
      }
    }
  }

  async function start(id: string, options?: { forceRestart?: boolean; resume?: boolean }) {
    const def = tutorialRegistry.get(id)
    if (!def) return

    const appStore = useAppStore()
    appStore.setSidebarOpen(false)

    const progress = tutorialStorage.getProgress(userId(), id)
    const versionMismatch = progress && progress.version !== def.version

    if (
      !options?.forceRestart &&
      !options?.resume &&
      progress &&
      progress.status === 'in_progress' &&
      progress.currentStepId &&
      !versionMismatch
    ) {
      pendingTutorialId.value = id
      showResumeDialog.value = true
      return
    }

    tutorialId.value = id
    tutorialVersion.value = def.version
    isActive.value = true
    showResumeDialog.value = false
    showExitDialog.value = false
    pendingTutorialId.value = null

    let startIndex = 0
    if (options?.resume && progress?.currentStepId && !versionMismatch) {
      startIndex = resolveStepIndex(def, progress.currentStepId)
      tutorialAnalytics.track('tutorial_resumed', {
        tutorialId: def.id,
        tutorialVersion: def.version,
        stepId: progress.currentStepId,
        module: def.module,
      })
    } else if (options?.forceRestart || versionMismatch) {
      tutorialStorage.restart(userId(), id, def.version)
      tutorialAnalytics.track('tutorial_restarted', {
        tutorialId: def.id,
        tutorialVersion: def.version,
        module: def.module,
      })
    } else {
      tutorialAnalytics.track('tutorial_started', {
        tutorialId: def.id,
        tutorialVersion: def.version,
        module: def.module,
      })
    }

    await activateAt(startIndex)
  }

  async function resumePending() {
    const id = pendingTutorialId.value
    showResumeDialog.value = false
    if (id) await start(id, { resume: true })
  }

  async function restartPending() {
    const id = pendingTutorialId.value ?? tutorialId.value
    showResumeDialog.value = false
    if (id) await start(id, { forceRestart: true })
  }

  async function next() {
    const step = currentStep.value
    if (!step || !canGoNext.value) return
    tutorialAnalytics.track('tutorial_step_completed', {
      tutorialId: tutorialId.value!,
      tutorialVersion: tutorialVersion.value,
      stepId: step.id,
      module: definition.value?.module,
    })

    if (step.type === 'success') {
      await activateAt(currentStepIndex.value + 1)
      return
    }

    if (currentStepIndex.value >= steps.value.length - 1) {
      await finish()
      return
    }
    await activateAt(currentStepIndex.value + 1)
  }

  async function back() {
    if (!canGoBack.value) return
    await activateAt(currentStepIndex.value - 1, -1)
  }

  async function completeCurrentStep() {
    const step = currentStep.value
    if (!step) return
    clearListeners()
    tutorialAnalytics.track('tutorial_step_completed', {
      tutorialId: tutorialId.value!,
      tutorialVersion: tutorialVersion.value,
      stepId: step.id,
      module: definition.value?.module,
    })

    if (step.type === 'completion') {
      await finish()
      return
    }
    await activateAt(currentStepIndex.value + 1)
  }

  async function finish() {
    const def = definition.value
    clearListeners()
    if (def) {
      persist(def.steps[def.steps.length - 1]?.id ?? null, 'completed')
      tutorialAnalytics.track('tutorial_completed', {
        tutorialId: def.id,
        tutorialVersion: def.version,
        module: def.module,
      })
    }
    isActive.value = false
    targetEl.value = null
    targetRect.value = null
    tutorialId.value = null
  }

  function requestExit() {
    const step = currentStep.value
    const simple =
      totalSteps.value <= 1 || step?.type === 'intro' || step?.type === 'completion'
    if (simple) {
      abandon()
      return
    }
    showExitDialog.value = true
  }

  function abandon() {
    const def = definition.value
    const step = currentStep.value
    clearListeners()
    stopMeasuring()
    if (def) {
      persist(step?.id ?? null, 'in_progress')
      tutorialAnalytics.track('tutorial_abandoned', {
        tutorialId: def.id,
        tutorialVersion: def.version,
        stepId: step?.id,
        module: def.module,
      })
    }
    showExitDialog.value = false
    isActive.value = false
    targetEl.value = null
    targetRect.value = null
    tutorialId.value = null
  }

  function skip() {
    const def = definition.value
    clearListeners()
    if (def) {
      persist(null, 'skipped')
      tutorialAnalytics.track('tutorial_skipped', {
        tutorialId: def.id,
        tutorialVersion: def.version,
        module: def.module,
      })
    }
    isActive.value = false
    targetEl.value = null
    targetRect.value = null
    tutorialId.value = null
  }

  function cancelResumeDialog() {
    showResumeDialog.value = false
    pendingTutorialId.value = null
  }

  function cancelExitDialog() {
    showExitDialog.value = false
  }

  function maybeShowSuggestion(id: string) {
    const progress = tutorialStorage.getProgress(userId(), id)
    if (progress && (progress.status === 'completed' || progress.status === 'in_progress')) {
      return
    }
    if (tutorialStorage.isSuggestionDismissed(userId(), id)) return
    pendingTutorialId.value = id
    showSuggestion.value = true
  }

  function dismissSuggestion() {
    const id = pendingTutorialId.value
    if (id) tutorialStorage.dismissSuggestion(userId(), id)
    showSuggestion.value = false
    pendingTutorialId.value = null
  }

  async function acceptSuggestion() {
    const id = pendingTutorialId.value
    showSuggestion.value = false
    if (id) {
      tutorialStorage.dismissSuggestion(userId(), id)
      pendingTutorialId.value = null
      await start(id)
    }
  }

  function getProgress(id: string) {
    return tutorialStorage.getProgress(userId(), id)
  }

  return {
    isActive,
    tutorialId,
    tutorialVersion,
    currentStepIndex,
    status,
    targetRect,
    targetEl,
    layoutMode,
    sheetHeight,
    isResolvingTarget,
    isWaitingForAction,
    isWaitingForEvent,
    showResumeDialog,
    showExitDialog,
    showSuggestion,
    pendingTutorialId,
    errorTip,
    definition,
    steps,
    currentStep,
    totalSteps,
    stepNumber,
    canGoBack,
    canGoNext,
    interaction,
    start,
    resumePending,
    restartPending,
    next,
    back,
    completeCurrentStep,
    finish,
    requestExit,
    abandon,
    skip,
    cancelResumeDialog,
    cancelExitDialog,
    maybeShowSuggestion,
    dismissSuggestion,
    acceptSuggestion,
    getProgress,
    scheduleMeasure,
    measureTarget,
  }
})

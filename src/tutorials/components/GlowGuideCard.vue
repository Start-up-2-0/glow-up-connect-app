<script setup lang="ts">
import { computed } from 'vue'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Lightbulb,
  Sparkles,
  X,
} from 'lucide-vue-next'
import GlowGuideProgress from '@/tutorials/components/GlowGuideProgress.vue'
import type { TutorialStep } from '@/tutorials/types'

const props = defineProps<{
  step: TutorialStep
  stepNumber: number
  totalSteps: number
  canGoBack: boolean
  canGoNext: boolean
  isWaitingForAction: boolean
  isWaitingForEvent: boolean
  brandLabel?: string
}>()

const emit = defineEmits<{
  next: []
  back: []
  skip: []
  exit: []
  finish: []
}>()

const isIntro = computed(() => props.step.type === 'intro')
const isAction = computed(
  () => props.step.type === 'action' || props.step.type === 'input' || props.step.type === 'wait',
)
const isSuccess = computed(() => props.step.type === 'success')
const isCompletion = computed(() => props.step.type === 'completion')
const isSuaVez = computed(() => isAction.value)

const headerLabel = computed(() => {
  if (isSuaVez.value) return 'Sua vez'
  return props.brandLabel ?? 'Glow Guide'
})

const waitingLabel = computed(() => {
  if (props.isWaitingForEvent) return 'Aguardando confirmação…'
  if (props.step.type === 'input') return 'Aguardando preenchimento…'
  if (props.isWaitingForAction) return 'Aguardando sua ação…'
  return null
})
</script>

<template>
  <div class="gg-card" role="dialog" aria-modal="true" :aria-labelledby="'gg-card-title'">
    <div class="gg-card__header">
      <div class="gg-card__brand">
        <Sparkles class="gg-card__brand-icon" aria-hidden="true" />
        <span class="gg-card__brand-text">{{ headerLabel }}</span>
      </div>
      <div class="gg-card__header-right">
        <span v-if="!isIntro && !isCompletion" class="gg-card__counter">
          {{ stepNumber }} / {{ totalSteps }}
        </span>
        <button
          type="button"
          class="gg-card__close"
          aria-label="Sair do tutorial"
          @click="emit('exit')"
        >
          <X class="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>

    <GlowGuideProgress
      v-if="!isIntro"
      class="gg-card__progress"
      :current="stepNumber"
      :total="totalSteps"
    />

    <div class="gg-card__body">
      <div v-if="isSuccess || isCompletion" class="gg-card__success-icon" aria-hidden="true">
        <Check class="size-6" />
      </div>

      <h2 id="gg-card-title" class="gg-card__title">{{ step.title }}</h2>
      <p class="gg-card__desc">{{ step.description }}</p>

      <p v-if="step.tip" class="gg-card__tip">
        <Lightbulb class="size-3.5 shrink-0" aria-hidden="true" />
        <span>{{ step.tip }}</span>
      </p>

      <p
        v-if="waitingLabel"
        class="gg-card__waiting"
        aria-live="polite"
      >
        {{ waitingLabel }}
      </p>

      <p v-if="isCompletion" class="gg-card__done-meta">
        {{ totalSteps }} de {{ totalSteps }} etapas concluídas
      </p>
    </div>

    <div class="gg-card__footer">
      <template v-if="isIntro">
        <button type="button" class="gg-card__btn gg-card__btn--ghost" @click="emit('skip')">
          Pular
        </button>
        <button type="button" class="gg-card__btn gg-card__btn--primary" @click="emit('next')">
          Começar
          <ArrowRight class="size-4" aria-hidden="true" />
        </button>
      </template>

      <template v-else-if="isCompletion">
        <button type="button" class="gg-card__btn gg-card__btn--primary gg-card__btn--block" @click="emit('finish')">
          Concluir Tour
        </button>
      </template>

      <template v-else-if="isAction">
        <button
          v-if="canGoBack"
          type="button"
          class="gg-card__btn gg-card__btn--ghost"
          @click="emit('back')"
        >
          <ArrowLeft class="size-4" aria-hidden="true" />
          Voltar
        </button>
        <span v-else class="gg-card__spacer" />
      </template>

      <template v-else>
        <button
          v-if="canGoBack"
          type="button"
          class="gg-card__btn gg-card__btn--ghost"
          @click="emit('back')"
        >
          <ArrowLeft class="size-4" aria-hidden="true" />
          Voltar
        </button>
        <span v-else class="gg-card__spacer" />
        <button
          v-if="canGoNext || isSuccess"
          type="button"
          class="gg-card__btn gg-card__btn--primary"
          @click="emit('next')"
        >
          {{ isSuccess ? 'Continuar' : 'Próximo' }}
          <ArrowRight class="size-4" aria-hidden="true" />
        </button>
      </template>
    </div>
  </div>
</template>

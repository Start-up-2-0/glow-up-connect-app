<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import AgendamentoStatusBadge from '@/components/cliente/AgendamentoStatusBadge.vue'
import { formatAgendaCardDate, formatAgendaTime, formatCurrency } from '@/utils/formatters'
import { resolveAgendamentoStatusTheme } from '@/utils/agendamentoStatusTheme'
import type { AgendamentoStatus } from '@/types/agendamento.types'

const props = defineProps<{
  title: string
  subtitle?: string
  inicio: string
  valorTotal?: number
  status: AgendamentoStatus | string
  tall?: boolean
  to?: string | undefined
  showActions?: boolean
  showAtendimentoActions?: boolean
  podeIniciarAtendimento?: boolean
  podeFinalizarAtendimento?: boolean
  iniciarAtendimentoHabilitado?: boolean
  finalizarAtendimentoHabilitado?: boolean
  podeAvaliar?: boolean
  actionLoading?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
  iniciarAtendimento: []
  finalizarAtendimento: []
  avaliar: []
}>()

const theme = computed(() => resolveAgendamentoStatusTheme(props.status))
const isPending = computed(() => props.status === 'PendenteConfirmacao')
const showStatusBadge = computed(
  () =>
    (!isPending.value || !props.showActions) &&
    !props.showAtendimentoActions &&
    !props.podeAvaliar,
)
const rootTag = computed(() => (props.to ? RouterLink : 'div'))

const cardClasses = computed(() => [
  'agendamento-card',
  theme.value.borderClass,
  props.tall ? 'agendamento-card--tall' : '',
  props.to ? 'agendamento-card--interactive' : '',
])
</script>

<template>
  <component
    :is="rootTag"
    v-bind="to ? { to } : {}"
    :class="cardClasses"
  >
    <div class="flex items-start justify-between gap-2">
      <h2 class="agendamento-card__title min-w-0">{{ title }}</h2>
      <span
        v-if="isPending && showActions && valorTotal != null && valorTotal > 0"
        class="agendamento-card__price shrink-0"
      >
        {{ formatCurrency(valorTotal) }}
      </span>
    </div>
    <p v-if="subtitle" class="agendamento-card__subtitle">{{ subtitle }}</p>

    <div class="agendamento-card__meta-row">
      <svg class="agendamento-card__meta-icon" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" stroke="currentColor" stroke-width="1.2" />
        <path d="M4.5 1.5V4M9.5 1.5V4M1.5 6H12.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
      </svg>
      <span>{{ formatAgendaCardDate(inicio) }}</span>
    </div>

    <div class="agendamento-card__meta-row">
      <svg class="agendamento-card__meta-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.2" />
        <path d="M8 4.5V8L10 9.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
      </svg>
      <span>{{ formatAgendaTime(inicio) }}</span>
    </div>

    <div v-if="isPending && showActions" class="mt-3">
      <p class="agendamento-card__pending-label">Aguardando confirmação</p>
      <div class="agendamento-card__actions">
        <button
          type="button"
          class="agendamento-card__btn-confirm"
          :disabled="actionLoading"
          @click.stop="emit('confirm')"
        >
          <svg class="size-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          Confirmar
        </button>
        <button
          type="button"
          class="agendamento-card__btn-cancel"
          :disabled="actionLoading"
          @click.stop="emit('cancel')"
        >
          <svg class="size-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
          Cancelar
        </button>
      </div>
    </div>

    <div v-else-if="showAtendimentoActions" class="mt-3">
      <div class="agendamento-card__actions">
        <button
          v-if="podeIniciarAtendimento"
          type="button"
          class="agendamento-card__btn-confirm"
          :disabled="actionLoading || iniciarAtendimentoHabilitado === false"
          @click.stop="emit('iniciarAtendimento')"
        >
          Iniciar atendimento
        </button>
        <button
          v-if="podeFinalizarAtendimento"
          type="button"
          class="agendamento-card__btn-cancel border-glow-border-soft text-glow-text"
          :disabled="actionLoading || finalizarAtendimentoHabilitado === false"
          @click.stop="emit('finalizarAtendimento')"
        >
          Concluir atendimento
        </button>
      </div>
    </div>

    <div v-else-if="podeAvaliar" class="mt-3">
      <div class="agendamento-card__actions">
        <button
          type="button"
          class="agendamento-card__btn-confirm"
          @click.stop="emit('avaliar')"
        >
          Avaliar atendimento
        </button>
      </div>
      <div class="agendamento-card__footer mt-2">
        <span v-if="valorTotal != null && valorTotal > 0" class="agendamento-card__price">
          {{ formatCurrency(valorTotal) }}
        </span>
        <span v-else class="flex-1" />
        <AgendamentoStatusBadge :status="status" />
      </div>
    </div>

    <div v-else class="agendamento-card__footer">
      <span v-if="valorTotal != null && valorTotal > 0" class="agendamento-card__price">
        {{ formatCurrency(valorTotal) }}
      </span>
      <span v-else class="flex-1" />
      <AgendamentoStatusBadge v-if="showStatusBadge" :status="status" />
    </div>
  </component>
</template>

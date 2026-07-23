<script setup lang="ts">
import { computed } from 'vue'
import { formatCurrency } from '@/utils/formatters'
import { AGENDAR_BTN_CONTINUE_CLASS } from '@/constants/designTokens'

const props = withDefaults(
  defineProps<{
    servicosCount: number
    duracaoTotal: number
    valorTotal: number
    disabled?: boolean
    loading?: boolean
    /** fixed = barra fixa na base (fluxo público); inline = alinhada ao conteúdo (dashboard) */
    variant?: 'fixed' | 'inline'
    wide?: boolean
  }>(),
  {
    variant: 'fixed',
    wide: false,
  },
)

const emit = defineEmits<{
  continuar: []
}>()

const rootClass = computed(() => [
  'agendar-resumo-footer',
  props.variant === 'inline' ? 'agendar-resumo-footer--inline' : '',
  props.wide ? 'agendar-resumo-footer--wide' : '',
])
</script>

<template>
  <div :class="rootClass">
    <div class="agendar-resumo-footer__panel">
      <div class="agendar-resumo-footer__summary">
        <div class="agendar-resumo-footer__meta">
          <span>
            {{ servicosCount }}
            {{ servicosCount === 1 ? 'serviço' : 'serviços' }}
          </span>
          <span class="agendar-resumo-footer__dot" aria-hidden="true" />
          <span class="inline-flex items-center gap-1">
            <svg class="size-4 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.2" />
              <path d="M8 4.5V8l2.5 1.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
            </svg>
            {{ duracaoTotal }} minutos
          </span>
        </div>
        <span class="agendar-resumo-footer__total">{{ formatCurrency(valorTotal) }}</span>
      </div>

      <button
        type="button"
        :class="AGENDAR_BTN_CONTINUE_CLASS"
        :disabled="disabled || loading"
        @click="emit('continuar')"
      >
        {{ loading ? 'Carregando…' : 'Continuar' }}
      </button>
    </div>
  </div>
</template>

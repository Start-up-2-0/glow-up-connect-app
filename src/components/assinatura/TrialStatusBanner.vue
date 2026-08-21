<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ROUTE_PATHS } from '@/constants/routes'
import { calcularDiasRestantesTrial, formatBRL, formatDate } from '@/utils/formatters'

const props = defineProps<{
  diasTrial: number
  proximaDataVencimento: string
  inicio?: string | null
  percentualDescontoPermanente?: number | null
  valorMensalidadeComDesconto?: number | null
  compact?: boolean
  planoNome?: string
}>()

const diasRestantes = computed(() =>
  calcularDiasRestantesTrial({
    diasTrial: props.diasTrial,
    proximaDataVencimento: props.proximaDataVencimento,
    inicio: props.inicio,
  }),
)
</script>

<template>
  <div
    v-if="compact"
    class="dashboard-trial-strip"
    role="status"
  >
    <span class="dashboard-trial-strip__badge">Trial</span>
    <span class="dashboard-trial-strip__text">
      {{ planoNome ? `${planoNome} · ` : '' }}{{ diasRestantes }} dias restantes
    </span>
    <span class="dashboard-trial-strip__divider" />
    <span class="dashboard-trial-strip__billing">
      <template v-if="percentualDescontoPermanente">
        {{ percentualDescontoPermanente }}% off para sempre
        <template v-if="valorMensalidadeComDesconto != null">
          · {{ formatBRL(valorMensalidadeComDesconto) }}/mês
        </template>
        ·
      </template>
      Primeira cobrança: {{ formatDate(proximaDataVencimento) }}
    </span>
    <RouterLink
      :to="ROUTE_PATHS.CONFIG_ASSINATURA_FATURAS"
      class="dashboard-trial-strip__link"
    >
      Faturas
    </RouterLink>
  </div>

  <div
    v-else
    class="rounded-xl border border-glow-border-accent bg-glow-accent-glow px-4 py-3 shadow-glow-sm"
    role="status"
  >
    <p class="font-urbanist text-sm font-semibold text-glow-text">
      Período de teste — {{ diasRestantes }} dias restantes
    </p>
    <p class="mt-1 text-sm text-glow-text-subtle">
      <template v-if="percentualDescontoPermanente && valorMensalidadeComDesconto != null">
        Mensalidade com {{ percentualDescontoPermanente }}% de desconto vitalício:
        {{ formatBRL(valorMensalidadeComDesconto) }}/mês.
      </template>
      Primeira cobrança em {{ formatDate(proximaDataVencimento) }}.
      <RouterLink
        :to="ROUTE_PATHS.CONFIG_ASSINATURA_FATURAS"
        class="font-medium text-glow-gold-dark hover:underline"
      >
        Ver faturas
      </RouterLink>
    </p>
  </div>
</template>

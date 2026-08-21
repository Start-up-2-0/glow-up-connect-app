<script setup lang="ts">
import { computed, type Component } from 'vue'
import {
  Ban,
  Gauge,
  Scissors,
  Star,
  Users,
  Wallet,
} from 'lucide-vue-next'
import type { AvaliacaoResumoPublico } from '@/types/avaliacao.types'
import type { DistribuicaoServico } from '@/utils/dashboardNegocioUtils'
import { formatCurrency } from '@/utils/formatters'

const props = defineProps<{
  receitaHoje: number
  ocupacao: number | null
  clientesHoje: number
  cancelamentos: number
  avaliacao: AvaliacaoResumoPublico | null
  topServico: DistribuicaoServico | null
  podeVerFinanceiro: boolean
  loading?: boolean
}>()

interface InsightItem {
  id: string
  icon: Component
  label: string
  value: string
  detail: string
}

const insights = computed<InsightItem[]>(() => {
  const items: InsightItem[] = []

  if (props.podeVerFinanceiro) {
    items.push({
      id: 'receita',
      icon: Wallet,
      label: 'Receita de hoje',
      value: formatCurrency(props.receitaHoje),
      detail: 'Entradas registradas no caixa',
    })
  }

  items.push(
    {
      id: 'ocupacao',
      icon: Gauge,
      label: 'Taxa de ocupação',
      value: props.ocupacao != null ? `${props.ocupacao}%` : '—',
      detail: 'Estimativa com base na equipe ativa',
    },
    {
      id: 'clientes',
      icon: Users,
      label: 'Clientes na agenda',
      value: String(props.clientesHoje),
      detail: 'Pessoas com horário hoje',
    },
    {
      id: 'cancelamentos',
      icon: Ban,
      label: 'Cancelamentos hoje',
      value: String(props.cancelamentos),
      detail: props.cancelamentos === 0 ? 'Nenhum cancelamento' : 'Horários cancelados',
    },
    {
      id: 'avaliacao',
      icon: Star,
      label: 'Avaliação da loja',
      value: props.avaliacao ? props.avaliacao.notaMedia.toFixed(1) : '—',
      detail: props.avaliacao
        ? `${props.avaliacao.totalAvaliacoes} avaliações`
        : 'Ainda sem avaliações',
    },
    {
      id: 'servico',
      icon: Scissors,
      label: 'Serviço mais agendado',
      value: props.topServico?.nome ?? '—',
      detail: props.topServico
        ? `${props.topServico.count}× na agenda de hoje`
        : 'Sem dados suficientes',
    },
  )

  return items.slice(0, 6)
})
</script>

<template>
  <section
    class="flex h-full flex-col rounded-2xl border border-glow-border-soft bg-glow-surface p-5 shadow-glow-sm"
  >
    <div class="mb-4">
      <h2 class="font-urbanist text-[15px] font-semibold text-glow-text">
        Operação da loja
      </h2>
      <p class="mt-0.5 font-urbanist text-[13px] text-glow-text-subtle">
        Sinais do dia para decidir o próximo passo
      </p>
    </div>

    <div v-if="loading" class="grid flex-1 gap-3 sm:grid-cols-2">
      <span
        v-for="i in 6"
        :key="i"
        class="h-[88px] animate-pulse rounded-xl bg-glow-canvas"
      />
    </div>

    <div v-else class="grid flex-1 content-start gap-3 sm:grid-cols-2">
      <div v-for="item in insights" :key="item.id" class="op-card">
        <span class="op-card__icon">
          <component :is="item.icon" class="size-4" :stroke-width="1.75" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="font-urbanist text-[11px] font-medium text-glow-text-muted">
            {{ item.label }}
          </p>
          <p class="mt-0.5 truncate font-urbanist text-[14px] font-semibold text-glow-text">
            {{ item.value }}
          </p>
          <p class="mt-0.5 truncate font-urbanist text-[11px] text-glow-text-subtle">
            {{ item.detail }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.op-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  border-radius: 14px;
  border: 1px solid var(--glow-border-soft);
  background: var(--glow-canvas);
  padding: 12px;
}
.op-card__icon {
  display: inline-flex;
  height: 32px;
  width: 32px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: color-mix(in srgb, var(--glow-gold-cta) 12%, transparent);
  color: var(--glow-gold-cta);
}
</style>

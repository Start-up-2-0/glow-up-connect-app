<script setup lang="ts">
import { computed } from 'vue'
import {
  ArrowLeftRight,
  CalendarClock,
  CreditCard,
  RefreshCw,
  Tag,
  Trash2,
  Wallet,
} from 'lucide-vue-next'
import AssinaturaStatusBadge from '@/components/assinatura/AssinaturaStatusBadge.vue'
import { FEATURE_FLAGS } from '@/config/features'
import { formatBRL, formatDate } from '@/utils/formatters'
import type { Assinatura } from '@/types/assinatura.types'
import type { Plano } from '@/types/plano.types'

const props = defineProps<{
  planoNome: string | null
  plano: Plano | null
  assinatura: Assinatura
  podeCancelar?: boolean
}>()

const emit = defineEmits<{
  'trocar-plano': []
  cancelar: []
}>()

const mostrarTrocaPlano = FEATURE_FLAGS.trocaPlanoHabilitada

const ciclo = computed(() => {
  const p = props.plano?.periodo?.toLowerCase() ?? 'mensal'
  if (p.includes('ano')) return 'Anual'
  return 'Mensal'
})

const valorLabel = computed(() => {
  if (!props.plano) return '—'
  if (props.plano.preco <= 0) return 'Grátis'
  return `${formatBRL(props.plano.preco)} / mês`
})

const rows = computed(() => [
  {
    id: 'plano',
    icon: Tag,
    label: 'Plano contratado',
    value: props.planoNome ?? `Plano #${props.assinatura.planoId}`,
    emphasize: true,
  },
  {
    id: 'status',
    icon: RefreshCw,
    label: 'Status',
    slot: 'status' as const,
  },
  {
    id: 'ciclo',
    icon: CalendarClock,
    label: 'Ciclo de cobrança',
    value: ciclo.value,
  },
  {
    id: 'valor',
    icon: Wallet,
    label: 'Valor',
    value: valorLabel.value,
    emphasize: true,
  },
  {
    id: 'pagamento',
    icon: CreditCard,
    label: 'Forma de pagamento',
    value: props.assinatura.gateway === 'MercadoPago' ? 'Mercado Pago' : props.assinatura.gateway,
  },
  {
    id: 'proxima',
    icon: CalendarClock,
    label: 'Próxima cobrança',
    value: formatDate(props.assinatura.proximaDataVencimento),
  },
  {
    id: 'renovacao',
    icon: RefreshCw,
    label: 'Renovação automática',
    value:
      props.assinatura.status === 'CancelamentoAgendado' ? 'Desabilitada' : 'Habilitada',
    tone:
      props.assinatura.status === 'CancelamentoAgendado'
        ? ('muted' as const)
        : ('success' as const),
  },
])
</script>

<template>
  <section class="assinatura-panel flex h-full flex-col">
    <h2 class="font-urbanist text-[16px] font-semibold text-glow-text">Detalhes do plano</h2>

    <ul class="mt-4 flex-1 divide-y divide-glow-border-soft">
      <li v-for="row in rows" :key="row.id" class="flex items-center gap-3 py-3.5">
        <span class="assinatura-panel__icon">
          <component :is="row.icon" :size="15" :stroke-width="1.75" />
        </span>
        <span class="min-w-0 flex-1 font-urbanist text-[13px] text-glow-text-subtle">
          {{ row.label }}
        </span>
        <AssinaturaStatusBadge v-if="row.slot === 'status'" :status="assinatura.status" />
        <span
          v-else
          class="font-urbanist text-[13px] text-glow-text"
          :class="{
            'font-semibold': row.emphasize,
            'font-semibold text-glow-success-dark': row.tone === 'success',
            'text-glow-text-muted': row.tone === 'muted',
          }"
        >
          {{ row.value }}
        </span>
      </li>
    </ul>

    <div class="mt-4 flex flex-wrap gap-2 border-t border-glow-border-soft pt-4">
      <button
        v-if="mostrarTrocaPlano"
        type="button"
        class="assinatura-btn-ghost"
        @click="emit('trocar-plano')"
      >
        <ArrowLeftRight :size="15" :stroke-width="1.75" />
        Trocar plano
      </button>
      <button
        type="button"
        class="assinatura-btn-danger-ghost"
        :disabled="podeCancelar === false"
        @click="emit('cancelar')"
      >
        <Trash2 :size="15" :stroke-width="1.75" />
        Cancelar assinatura
      </button>
    </div>
  </section>
</template>

<style scoped>
.assinatura-panel {
  border-radius: 20px;
  border: 1px solid var(--glow-border-soft);
  background: var(--glow-surface);
  padding: 1.25rem 1.35rem 1.35rem;
  box-shadow: var(--glow-shadow-sm);
  animation: assinatura-fade-up 0.5s ease 0.05s both;
}
.assinatura-panel__icon {
  display: inline-flex;
  height: 30px;
  width: 30px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--glow-canvas);
  color: var(--glow-text-muted);
}
@keyframes assinatura-fade-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

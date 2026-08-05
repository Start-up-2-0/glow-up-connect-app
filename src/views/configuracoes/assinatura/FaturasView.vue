<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import {
  CalendarClock,
  CheckCircle2,
  Sparkles,
  Wallet,
} from 'lucide-vue-next'
import FaturasPageHeader from '@/components/assinatura/faturas/FaturasPageHeader.vue'
import FaturasStatsGrid, {
  type FaturaStat,
} from '@/components/assinatura/faturas/FaturasStatsGrid.vue'
import FaturasHistoricoTable from '@/components/assinatura/faturas/FaturasHistoricoTable.vue'
import FaturasSuporteBanner from '@/components/assinatura/faturas/FaturasSuporteBanner.vue'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useAssinaturaStore } from '@/stores/assinatura.store'
import { usePlanosStore } from '@/stores/planos.store'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { formatBRL, formatDate } from '@/utils/formatters'
import type { CobrancaAssinatura } from '@/types/assinatura.types'
import '@/components/assinatura/page/assinaturaPage.css'

const { assinaturaId, estabelecimentoId, planoNome, planoId } = useNegocioContext()
const assinaturaStore = useAssinaturaStore()
const planosStore = usePlanosStore()
const notifications = useNotificationsStore()
const { cobrancas, cobrancasLoading, assinatura } = storeToRefs(assinaturaStore)
const { resolveError } = useApiError()
const erro = ref<string | null>(null)

const planoAtual = computed(() => {
  const id = assinatura.value?.planoId ?? planoId.value
  if (id == null) return null
  return planosStore.getPlanoById(id) ?? null
})

const pagas = computed(() => cobrancas.value.filter((c) => c.status === 'Pago'))

const totalPago = computed(() =>
  pagas.value.reduce((acc, c) => acc + c.valor, 0),
)

const pctPagas = computed(() => {
  if (cobrancas.value.length === 0) return null
  return Math.round((pagas.value.length / cobrancas.value.length) * 100)
})

const diasAteVencimento = computed(() => {
  const iso = assinatura.value?.proximaDataVencimento
  if (!iso) return null
  const ms = new Date(iso).getTime() - Date.now()
  return Math.ceil(ms / 86_400_000)
})

const stats = computed<FaturaStat[]>(() => {
  const dias = diasAteVencimento.value
  const hintVenc =
    dias == null
      ? null
      : dias < 0
        ? `Há ${Math.abs(dias)} dia${Math.abs(dias) === 1 ? '' : 's'}`
        : dias === 0
          ? 'Hoje'
          : `Em ${dias} dia${dias === 1 ? '' : 's'}`

  const valorPlano = planoAtual.value
    ? planoAtual.value.preco <= 0
      ? 'Grátis'
      : `${formatBRL(planoAtual.value.preco)} / mês`
    : '—'

  return [
    {
      id: 'total-pago',
      label: 'Total pago',
      value: formatBRL(totalPago.value),
      icon: Wallet,
      iconClass: 'bg-glow-gold-cta/15 text-glow-gold-cta',
      hint: 'Últimos ciclos',
    },
    {
      id: 'pagas',
      label: 'Faturas pagas',
      value: String(pagas.value.length),
      icon: CheckCircle2,
      iconClass: 'bg-glow-success-bg text-glow-success-dark',
      hint: pctPagas.value != null ? `${pctPagas.value}% do total` : null,
    },
    {
      id: 'proximo',
      label: 'Próximo vencimento',
      value: assinatura.value?.proximaDataVencimento
        ? formatDate(assinatura.value.proximaDataVencimento)
        : '—',
      icon: CalendarClock,
      iconClass: 'bg-glow-info-bg text-glow-info',
      hint: hintVenc,
    },
    {
      id: 'assinatura',
      label: 'Valor da assinatura',
      value: valorPlano,
      icon: Sparkles,
      iconClass: 'bg-amber-100 text-amber-700',
      hint: planoNome.value ? `Plano ${planoNome.value}` : null,
    },
  ]
})

onMounted(async () => {
  if (!assinaturaId.value) return
  try {
    await Promise.all([
      estabelecimentoId.value
        ? assinaturaStore.fetchAtual(estabelecimentoId.value)
        : Promise.resolve(),
      assinaturaStore.fetchCobrancas(assinaturaId.value),
      planosStore.fetchPlanos(),
    ])
  } catch (err) {
    erro.value = resolveError(err)
  }
})

function exportarCsv() {
  if (cobrancas.value.length === 0) {
    notifications.push('info', 'Não há faturas para exportar.')
    return
  }
  const header = [
    'Ciclo',
    'PeriodoInicio',
    'PeriodoFim',
    'Vencimento',
    'Valor',
    'Status',
    'PagoEm',
    'GatewayPaymentId',
  ]
  const rows = cobrancas.value.map((c) =>
    [
      c.numeroCiclo,
      c.cicloInicio,
      c.cicloFim,
      c.dataVencimento,
      c.valor,
      c.status,
      c.pagoEm ?? '',
      c.gatewayPaymentId,
    ]
      .map((v) => `"${String(v).replaceAll('"', '""')}"`)
      .join(','),
  )
  const blob = new Blob([[header.join(','), ...rows].join('\n')], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `faturas-glow-up-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  notifications.push('success', 'Exportação CSV iniciada.')
}

function verDetalhe(cobranca: CobrancaAssinatura) {
  notifications.push(
    'info',
    `Ciclo #${cobranca.numeroCiclo} · ${formatBRL(cobranca.valor)} · ${cobranca.status} · ID ${cobranca.gatewayPaymentId}`,
  )
}

async function copiarId(cobranca: CobrancaAssinatura) {
  try {
    await navigator.clipboard.writeText(cobranca.gatewayPaymentId)
    notifications.push('success', 'ID do pagamento copiado.')
  } catch {
    notifications.push('error', 'Não foi possível copiar o ID.')
  }
}

function abrirSuporte() {
  notifications.push(
    'info',
    'Entre em contato pelo e-mail suporte@glowupconnect.com.br ou pelo WhatsApp da loja.',
  )
}
</script>

<template>
  <div class="faturas-page flex w-full flex-col gap-5 pb-8">
    <FaturasPageHeader
      :pode-exportar="cobrancas.length > 0"
      @exportar="exportarCsv"
    />

    <p v-if="erro" class="font-urbanist text-sm text-red-600">{{ erro }}</p>

    <template v-if="!cobrancasLoading || cobrancas.length > 0">
      <FaturasStatsGrid :items="stats" :loading="cobrancasLoading" />

      <FaturasHistoricoTable
        :cobrancas="cobrancas"
        :loading="cobrancasLoading"
        @detalhe="verDetalhe"
        @copiar-id="copiarId"
      />

      <FaturasSuporteBanner @suporte="abrirSuporte" />
    </template>
  </div>
</template>

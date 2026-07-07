<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import ContentAlert from '@/components/feedback/ContentAlert.vue'
import SegmentedControl from '@/components/ui/SegmentedControl.vue'
import FinanceiroPageHeader from '@/components/financeiro/FinanceiroPageHeader.vue'
import FinanceiroKpiCard from '@/components/financeiro/FinanceiroKpiCard.vue'
import FinanceiroEmptyState from '@/components/financeiro/FinanceiroEmptyState.vue'
import FinanceiroStatusBadge from '@/components/financeiro/FinanceiroStatusBadge.vue'
import CriarContaReceberModal from '@/components/financeiro/CriarContaReceberModal.vue'
import CriarContaPagarModal from '@/components/financeiro/CriarContaPagarModal.vue'
import BaixarContaModal from '@/components/financeiro/BaixarContaModal.vue'
import { FINANCEIRO_PAGE_CLASS } from '@/constants/designTokens'
import { ROUTE_PATHS } from '@/constants/routes'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { caixaService } from '@/services/caixaService'
import type { ContaPagar, ContaReceber } from '@/types/negocio/caixa.types'
import { formatCurrency, formatDate } from '@/utils/formatters'

type AbaContas = 'receber' | 'pagar'
type StatusFiltro = '' | 'Aberta' | 'Paga' | 'Vencida'

const route = useRoute()
const router = useRouter()
const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const { possuiPermissao } = useNegocioContext()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const aba = ref<AbaContas>((route.query.aba as AbaContas) || 'receber')
const statusFilter = ref<StatusFiltro>((route.query.status as StatusFiltro) || '')
const contasReceber = ref<ContaReceber[]>([])
const contasPagar = ref<ContaPagar[]>([])
const loading = ref(false)
const actionLoading = ref(false)
const modalReceberOpen = ref(false)
const modalPagarOpen = ref(false)
const baixarModalOpen = ref(false)
const contaBaixar = ref<{ tipo: AbaContas; titulo: string; descricao: string; valor: number; id: number } | null>(null)

const podeGerenciar = computed(() => possuiPermissao('CaixaGerenciar'))

const abaOptions = [
  { value: 'receber', label: 'A receber' },
  { value: 'pagar', label: 'A pagar' },
]

const statusOptions = [
  { value: '', label: 'Todas' },
  { value: 'Aberta', label: 'Abertas' },
  { value: 'Vencida', label: 'Vencidas' },
  { value: 'Paga', label: 'Pagas' },
]

const contasAtivas = computed(() => (aba.value === 'receber' ? contasReceber.value : contasPagar.value))

const resumo = computed(() => {
  const items = contasAtivas.value
  return {
    abertas: items.filter((c) => c.status === 'Aberta').length,
    vencidas: items.filter((c) => c.status === 'Vencida').length,
    totalAberto: items
      .filter((c) => c.status === 'Aberta' || c.status === 'Vencida')
      .reduce((s, c) => s + c.valor, 0),
  }
})

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  try {
    const status = statusFilter.value || undefined
    const [receber, pagar] = await Promise.all([
      caixaService.listarContasReceber(estabelecimentoId.value, status),
      caixaService.listarContasPagar(estabelecimentoId.value, status),
    ])
    contasReceber.value = receber
    contasPagar.value = pagar
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    loading.value = false
  }
}

function setAba(value: string) {
  aba.value = value as AbaContas
  void router.replace({ query: { ...route.query, aba: value } })
}

function setStatus(value: string) {
  statusFilter.value = value as StatusFiltro
  void router.replace({ query: { ...route.query, status: value || undefined } })
  void load()
}

function abrirNovaConta() {
  if (aba.value === 'receber') modalReceberOpen.value = true
  else modalPagarOpen.value = true
}

async function handleCriarReceber(payload: {
  descricao: string
  valor: number
  vencimento: string
  agendamentoId?: number
}) {
  if (!estabelecimentoId.value) return
  actionLoading.value = true
  try {
    await caixaService.criarContaReceber(estabelecimentoId.value, payload)
    notifications.push('success', 'Conta criada.')
    modalReceberOpen.value = false
    await load()
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    actionLoading.value = false
  }
}

async function handleCriarPagar(payload: {
  fornecedor: string
  categoria: string
  descricao: string
  valor: number
  vencimento: string
  recorrente: boolean
}) {
  if (!estabelecimentoId.value) return
  actionLoading.value = true
  try {
    await caixaService.criarContaPagar(estabelecimentoId.value, payload)
    notifications.push('success', 'Conta criada.')
    modalPagarOpen.value = false
    await load()
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    actionLoading.value = false
  }
}

function abrirBaixar(conta: ContaReceber | ContaPagar) {
  contaBaixar.value = {
    tipo: aba.value,
    id: conta.id,
    titulo: aba.value === 'receber' ? 'Conta a receber' : (conta as ContaPagar).fornecedor,
    descricao:
      aba.value === 'receber'
        ? (conta as ContaReceber).descricao
        : (conta as ContaPagar).descricao,
    valor: conta.valor,
  }
  baixarModalOpen.value = true
}

async function confirmarBaixa(payload: { formaBaixa: string; observacao: string }) {
  if (!estabelecimentoId.value || !contaBaixar.value) return
  actionLoading.value = true
  try {
    if (contaBaixar.value.tipo === 'receber') {
      await caixaService.baixarContaReceber(estabelecimentoId.value, contaBaixar.value.id, payload)
    } else {
      await caixaService.baixarContaPagar(estabelecimentoId.value, contaBaixar.value.id, payload)
    }
    notifications.push('success', 'Conta baixada.')
    baixarModalOpen.value = false
    await load()
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    actionLoading.value = false
  }
}

watch(ready, (isReady) => { if (isReady) void load() }, { immediate: true })
</script>

<template>
  <div :class="FINANCEIRO_PAGE_CLASS">
    <FinanceiroPageHeader
      title="Contas"
      subtitle="Títulos a pagar e a receber."
      :back-to="ROUTE_PATHS.FINANCEIRO"
    >
      <template #filters>
        <SegmentedControl v-model="aba" :options="abaOptions" aria-label="Tipo de conta" @update:model-value="setAba" />
        <div class="financeiro-quick-filters">
          <button
            v-for="opt in statusOptions"
            :key="opt.value"
            type="button"
            class="financeiro-quick-filters__btn"
            :class="{ 'financeiro-quick-filters__btn--active': statusFilter === opt.value }"
            @click="setStatus(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
      </template>
      <template #actions>
        <button
          v-if="podeGerenciar"
          type="button"
          class="financeiro-btn-primary"
          @click="abrirNovaConta"
        >
          Nova conta
        </button>
      </template>
    </FinanceiroPageHeader>

    <ContentAlert v-if="contextError" variant="error">{{ contextError }}</ContentAlert>
    <LoadingSpinner v-if="contextLoading || loading" />

    <template v-else>
      <div class="financeiro-kpi-grid">
        <FinanceiroKpiCard label="Em aberto" :value="String(resumo.abertas)" />
        <FinanceiroKpiCard label="Vencidas" :value="String(resumo.vencidas)" variant="negative" />
        <FinanceiroKpiCard label="Total pendente" :value="formatCurrency(resumo.totalAberto)" />
      </div>

      <div class="financeiro-table-wrap">
        <FinanceiroEmptyState
          v-if="contasAtivas.length === 0"
          :title="aba === 'receber' ? 'Nenhuma conta a receber' : 'Nenhuma conta a pagar'"
          description="Cadastre títulos para acompanhar vencimentos e baixas."
        >
          <template v-if="podeGerenciar" #action>
            <button type="button" class="financeiro-btn-primary" @click="abrirNovaConta">
              Cadastrar primeira conta
            </button>
          </template>
        </FinanceiroEmptyState>

        <table v-else class="financeiro-table hidden md:table">
          <thead>
            <tr>
              <th v-if="aba === 'pagar'">Fornecedor</th>
              <th>Descrição</th>
              <th>Vencimento</th>
              <th>Status</th>
              <th class="text-right">Valor</th>
              <th v-if="podeGerenciar" />
            </tr>
          </thead>
          <tbody>
            <tr v-for="conta in contasAtivas" :key="conta.id">
              <td v-if="aba === 'pagar'">{{ (conta as ContaPagar).fornecedor }}</td>
              <td>
                {{
                  aba === 'receber'
                    ? (conta as ContaReceber).descricao
                    : (conta as ContaPagar).descricao
                }}
              </td>
              <td>{{ formatDate(conta.vencimento) }}</td>
              <td><FinanceiroStatusBadge :status="conta.status" /></td>
              <td class="text-right font-medium">{{ formatCurrency(conta.valor) }}</td>
              <td v-if="podeGerenciar" class="text-right">
                <button
                  v-if="conta.status === 'Aberta' || conta.status === 'Vencida'"
                  type="button"
                  class="financeiro-btn-outline"
                  :disabled="actionLoading"
                  @click="abrirBaixar(conta)"
                >
                  Baixar
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="space-y-3 p-3 md:hidden">
          <div v-for="conta in contasAtivas" :key="conta.id" class="financeiro-table__row-card">
            <div class="flex items-center justify-between">
              <FinanceiroStatusBadge :status="conta.status" />
              <span class="font-bold">{{ formatCurrency(conta.valor) }}</span>
            </div>
            <p class="mt-2 font-medium">
              {{
                aba === 'receber'
                  ? (conta as ContaReceber).descricao
                  : (conta as ContaPagar).fornecedor
              }}
            </p>
            <p class="text-sm text-glow-text-subtle">Vence em {{ formatDate(conta.vencimento) }}</p>
            <button
              v-if="podeGerenciar && (conta.status === 'Aberta' || conta.status === 'Vencida')"
              type="button"
              class="financeiro-btn-outline mt-2"
              @click="abrirBaixar(conta)"
            >
              Baixar
            </button>
          </div>
        </div>
      </div>
    </template>

    <CriarContaReceberModal
      v-model="modalReceberOpen"
      :loading="actionLoading"
      @confirm="handleCriarReceber"
    />
    <CriarContaPagarModal
      v-model="modalPagarOpen"
      :loading="actionLoading"
      @confirm="handleCriarPagar"
    />
    <BaixarContaModal
      v-if="contaBaixar"
      v-model="baixarModalOpen"
      :titulo="contaBaixar.titulo"
      :descricao="contaBaixar.descricao"
      :valor="contaBaixar.valor"
      :loading="actionLoading"
      @confirm="confirmarBaixa"
    />
  </div>
</template>

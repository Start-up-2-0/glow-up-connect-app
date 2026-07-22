<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import ContentAlert from '@/components/feedback/ContentAlert.vue'
import SegmentedControl from '@/components/ui/SegmentedControl.vue'
import FinanceiroPageHeader from '@/components/financeiro/FinanceiroPageHeader.vue'
import FinanceiroEmptyState from '@/components/financeiro/FinanceiroEmptyState.vue'
import FinanceiroPeriodoFiltro from '@/components/financeiro/FinanceiroPeriodoFiltro.vue'
import FinanceiroConfirmDialog from '@/components/financeiro/FinanceiroConfirmDialog.vue'
import ComissaoFormModal from '@/components/financeiro/ComissaoFormModal.vue'
import { FINANCEIRO_PAGE_CLASS } from '@/constants/designTokens'
import { ROUTE_PATHS } from '@/constants/routes'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { caixaService } from '@/services/caixaService'
import { equipeService } from '@/services/equipeService'
import type {
  ComissaoExtrato,
  ComissaoProfissional,
  CriarComissaoPayload,
  LancamentoCaixa,
} from '@/types/negocio/caixa.types'
import type { ProfissionalEquipe } from '@/types/negocio/equipe.types'
import { formatCurrency, formatDateTime } from '@/utils/formatters'

const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const { possuiPermissao } = useNegocioContext()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()
const route = useRoute()

const abaInicial = (() => {
  const q = route.query.aba as string
  if (q === 'extrato') return 'extrato'
  if (q === 'historico') return 'historico'
  return 'regras'
})()
const aba = ref(abaInicial)
const comissoes = ref<ComissaoProfissional[]>([])
const extrato = ref<ComissaoExtrato[]>([])
const historico = ref<LancamentoCaixa[]>([])
const profissionais = ref<ProfissionalEquipe[]>([])
const loading = ref(false)
const actionLoading = ref(false)
const formModalOpen = ref(false)
const confirmDesativarOpen = ref(false)
const comissaoEditando = ref<ComissaoProfissional | null>(null)
const comissaoDesativarId = ref<number | null>(null)
const filtroInicio = ref('')
const filtroFim = ref('')

const podeGerenciar = computed(() => possuiPermissao('CaixaGerenciar'))
const podeVerExtrato = computed(
  () => possuiPermissao('ComissaoVisualizarPropria') || podeGerenciar.value,
)

const abaOptions = computed(() => {
  const opts = []
  if (podeGerenciar.value) {
    opts.push({ value: 'regras', label: 'Regras' })
    opts.push({ value: 'historico', label: 'Histórico' })
  }
  if (podeVerExtrato.value) opts.push({ value: 'extrato', label: 'Meu extrato' })
  return opts
})

async function loadHistorico() {
  if (!estabelecimentoId.value || !podeGerenciar.value) return
  const filtro: { inicio?: string; fim?: string; tipo?: string } = { tipo: 'ComissaoProfissional' }
  if (filtroInicio.value) filtro.inicio = new Date(filtroInicio.value).toISOString()
  if (filtroFim.value) filtro.fim = new Date(filtroFim.value + 'T23:59:59').toISOString()
  historico.value = await caixaService.listarRelatorioFinanceiro(estabelecimentoId.value, filtro)
}

async function loadRegras() {
  if (!estabelecimentoId.value || !podeGerenciar.value) return
  comissoes.value = await caixaService.listarComissoes(estabelecimentoId.value)
}

async function loadExtrato() {
  if (!estabelecimentoId.value || !podeVerExtrato.value) return
  const filtro: { inicio?: string; fim?: string } = {}
  if (filtroInicio.value) filtro.inicio = new Date(filtroInicio.value).toISOString()
  if (filtroFim.value) filtro.fim = new Date(filtroFim.value + 'T23:59:59').toISOString()
  extrato.value = await caixaService.listarMinhasComissoes(estabelecimentoId.value, filtro)
}

async function loadProfissionais() {
  if (!estabelecimentoId.value) return
  try {
    profissionais.value = await equipeService.listarProfissionais(estabelecimentoId.value)
  } catch {
    profissionais.value = []
  }
}

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  try {
    if (aba.value === 'regras') await loadRegras()
    else if (aba.value === 'extrato') await loadExtrato()
    else if (aba.value === 'historico') await loadHistorico()
    if (aba.value === 'regras' || aba.value === 'extrato') await loadProfissionais()
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    loading.value = false
  }
}

function formatComissao(c: ComissaoProfissional): string {
  if (c.percentual !== null) return `${c.percentual}%`
  if (c.valorFixo !== null) return formatCurrency(c.valorFixo)
  return '—'
}

function abrirNova() {
  comissaoEditando.value = null
  formModalOpen.value = true
}

function abrirEditar(c: ComissaoProfissional) {
  comissaoEditando.value = c
  formModalOpen.value = true
}

function abrirPausar(id: number) {
  comissaoDesativarId.value = id
  confirmDesativarOpen.value = true
}

async function salvarComissao(payload: CriarComissaoPayload) {
  if (!estabelecimentoId.value) return
  actionLoading.value = true
  try {
    if (comissaoEditando.value) {
      await caixaService.atualizarComissao(
        estabelecimentoId.value,
        comissaoEditando.value.id,
        {
          ...payload,
          ativo: comissaoEditando.value.ativo,
        },
      )
      notifications.push('success', 'Comissão atualizada.')
    } else {
      await caixaService.criarComissao(estabelecimentoId.value, payload)
      notifications.push('success', 'Comissão criada.')
    }
    formModalOpen.value = false
    await loadRegras()
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    actionLoading.value = false
  }
}

async function confirmarPausar() {
  if (!estabelecimentoId.value || !comissaoDesativarId.value) return
  actionLoading.value = true
  try {
    await caixaService.desativarComissao(estabelecimentoId.value, comissaoDesativarId.value)
    notifications.push('success', 'Regra pausada.')
    confirmDesativarOpen.value = false
    await loadRegras()
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    actionLoading.value = false
  }
}

watch(ready, (isReady) => {
  if (isReady) {
    if (!podeGerenciar.value && podeVerExtrato.value) aba.value = 'extrato'
    void load()
  }
}, { immediate: true })

watch(aba, () => void load())
</script>

<template>
  <div :class="FINANCEIRO_PAGE_CLASS">
    <FinanceiroPageHeader
      title="Comissões"
      subtitle="Regras e extrato de comissões."
      :back-to="ROUTE_PATHS.FINANCEIRO"
    >
      <template #filters>
        <SegmentedControl
          v-if="abaOptions.length > 1"
          v-model="aba"
          :options="abaOptions"
          aria-label="Visão de comissões"
        />
        <FinanceiroPeriodoFiltro
          v-if="aba === 'extrato' || aba === 'historico'"
          v-model:inicio="filtroInicio"
          v-model:fim="filtroFim"
          @aplicar="aba === 'extrato' ? loadExtrato() : loadHistorico()"
        />
      </template>
      <template v-if="podeGerenciar && aba === 'regras'" #actions>
        <button type="button" class="financeiro-btn-primary" @click="abrirNova">
          Nova comissão
        </button>
      </template>
    </FinanceiroPageHeader>

    <ContentAlert v-if="contextError" variant="error">{{ contextError }}</ContentAlert>
    <LoadingSpinner v-if="contextLoading || loading" />

    <template v-else-if="aba === 'regras'">
      <FinanceiroEmptyState
        v-if="comissoes.length === 0"
        title="Nenhuma comissão"
        description="Configure comissões para os profissionais."
      >
        <template v-if="podeGerenciar" #action>
          <button type="button" class="financeiro-btn-primary" @click="abrirNova">
            Configurar primeira comissão
          </button>
        </template>
      </FinanceiroEmptyState>
      <div v-else class="space-y-2">
        <div
          v-for="c in comissoes"
          :key="c.id"
          class="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-glow-border-soft bg-glow-surface p-4"
        >
          <div>
            <p class="font-urbanist text-sm font-semibold text-glow-text">{{ c.nomePublico }}</p>
            <p class="font-urbanist text-xs text-glow-text-subtle">
              {{ c.tipoComissao }} · {{ formatComissao(c) }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <span
              class="inline-flex rounded-full px-2 py-0.5 font-urbanist text-xs"
              :class="c.ativo ? 'bg-green-100 text-green-800' : 'bg-glow-canvas text-glow-text-subtle'"
            >
              {{ c.ativo ? 'Ativa' : 'Pausada' }}
            </span>
            <button
              v-if="podeGerenciar && c.ativo"
              type="button"
              class="financeiro-btn-outline"
              @click="abrirEditar(c)"
            >
              Editar
            </button>
            <button
              v-if="podeGerenciar && c.ativo"
              type="button"
              class="financeiro-btn-outline"
              @click="abrirPausar(c.id)"
            >
              Pausar regra
            </button>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="aba === 'historico'">
      <FinanceiroEmptyState
        v-if="historico.length === 0"
        title="Nenhuma comissão paga"
        description="Pagamentos de comissão aparecerão aqui."
      />
      <div v-else class="financeiro-table-wrap hidden md:block">
        <table class="financeiro-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th class="text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in historico" :key="item.id">
              <td class="text-glow-text-subtle">{{ formatDateTime(item.criadoEm) }}</td>
              <td>{{ item.descricao }}</td>
              <td class="text-right font-medium">{{ formatCurrency(item.valor) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="historico.length > 0" class="space-y-3 md:hidden">
        <div
          v-for="item in historico"
          :key="item.id"
          class="financeiro-table__row-card"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0 flex-1">
              <p class="font-urbanist font-medium text-glow-text">{{ item.descricao }}</p>
              <p class="text-sm text-glow-text-subtle">{{ formatDateTime(item.criadoEm) }}</p>
            </div>
            <p class="shrink-0 font-satoshi font-bold text-glow-text">{{ formatCurrency(item.valor) }}</p>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="aba === 'extrato'">
      <FinanceiroEmptyState
        v-if="extrato.length === 0"
        title="Nenhuma comissão no período"
        description="Suas comissões calculadas aparecerão aqui."
      />
      <div v-else class="financeiro-table-wrap hidden md:block">
        <table class="financeiro-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Agendamento</th>
              <th class="text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in extrato" :key="item.lancamentoId">
              <td class="text-glow-text-subtle">{{ formatDateTime(item.criadoEm) }}</td>
              <td>{{ item.descricao }}</td>
              <td>{{ item.agendamentoId ? `#${item.agendamentoId}` : '—' }}</td>
              <td class="text-right font-medium">{{ formatCurrency(item.valor) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="extrato.length > 0" class="space-y-3 md:hidden">
        <div
          v-for="item in extrato"
          :key="item.lancamentoId"
          class="financeiro-table__row-card"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0 flex-1">
              <p class="font-urbanist font-medium text-glow-text">{{ item.descricao }}</p>
              <p class="text-sm text-glow-text-subtle">{{ formatDateTime(item.criadoEm) }}</p>
            </div>
            <p class="shrink-0 font-satoshi font-bold text-glow-text">{{ formatCurrency(item.valor) }}</p>
          </div>
          <div class="financeiro-table__row-meta">
            <div class="financeiro-table__row-meta-item">
              <span class="financeiro-table__row-meta-label">Agendamento</span>
              <span class="financeiro-table__row-meta-value">
                {{ item.agendamentoId ? `#${item.agendamentoId}` : '—' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <ComissaoFormModal
      v-model="formModalOpen"
      :loading="actionLoading"
      :profissionais="profissionais.map((p) => ({ id: p.id, nomePublico: p.nomePublico }))"
      :comissao="comissaoEditando"
      @confirm="salvarComissao"
    />
    <FinanceiroConfirmDialog
      v-model="confirmDesativarOpen"
      title="Pausar regra?"
      message="Esta regra deixará de ser aplicada em novos recebimentos."
      confirm-label="Pausar regra"
      variant="danger"
      :loading="actionLoading"
      @confirm="confirmarPausar"
    />
  </div>
</template>

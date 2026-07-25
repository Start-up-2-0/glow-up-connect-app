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
import MetaFormModal from '@/components/financeiro/MetaFormModal.vue'
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
  Meta,
  CriarMetaPayload,
  AtualizarMetaPayload,
  MetaProgressoProfissional,
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
  if (q === 'metas') return 'metas'
  if (q === 'progresso') return 'progresso'
  return 'regras'
})()
const aba = ref(abaInicial)

// Comissões
const comissoes = ref<ComissaoProfissional[]>([])
const extrato = ref<ComissaoExtrato[]>([])
const historico = ref<LancamentoCaixa[]>([])
const profissionais = ref<ProfissionalEquipe[]>([])
const formModalOpen = ref(false)
const confirmDesativarOpen = ref(false)
const comissaoEditando = ref<ComissaoProfissional | null>(null)
const comissaoDesativarId = ref<number | null>(null)

// Metas
const metas = ref<Meta[]>([])
const progresso = ref<MetaProgressoProfissional[]>([])
const metaFormModalOpen = ref(false)
const confirmMetaDesativarOpen = ref(false)
const metaEditando = ref<Meta | null>(null)
const metaDesativarId = ref<number | null>(null)

const loading = ref(false)
const actionLoading = ref(false)

const filtroInicio = ref('')
const filtroFim = ref('')

const podeGerenciar = computed(() => possuiPermissao('CaixaGerenciar'))
const podeGerenciarMeta = computed(() => possuiPermissao('MetaGerenciar') || podeGerenciar.value)
const podeVerExtrato = computed(
  () => possuiPermissao('ComissaoVisualizarPropria') || podeGerenciar.value,
)

const abaOptions = computed(() => {
  const opts: Array<{ value: string; label: string }> = []
  if (podeGerenciar.value) {
    opts.push({ value: 'regras', label: 'Regras' })
    opts.push({ value: 'metas', label: 'Metas' })
    opts.push({ value: 'progresso', label: 'Progresso' })
    opts.push({ value: 'historico', label: 'Histórico' })
  }
  if (podeVerExtrato.value) opts.push({ value: 'extrato', label: 'Meu extrato' })
  return opts
})

// --- Loaders ---

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

async function loadMetas() {
  if (!estabelecimentoId.value) return
  try {
    metas.value = await caixaService.listarMetas(estabelecimentoId.value)
  } catch (err) {
    notifications.push('error', resolveError(err))
  }
}

async function loadProgresso() {
  if (!estabelecimentoId.value) return
  try {
    progresso.value = await caixaService.listarProgressoMetas(estabelecimentoId.value)
  } catch (err) {
    notifications.push('error', resolveError(err))
  }
}

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  try {
    if (aba.value === 'regras') await loadRegras()
    else if (aba.value === 'extrato') await loadExtrato()
    else if (aba.value === 'historico') await loadHistorico()
    else if (aba.value === 'metas') await loadMetas()
    else if (aba.value === 'progresso') await loadProgresso()
    if (aba.value === 'regras' || aba.value === 'extrato') await loadProfissionais()
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    loading.value = false
  }
}

// --- Handlers Comissões ---

function formatComissao(c: ComissaoProfissional): string {
  if (c.percentual !== null) return `${c.percentual}%`
  if (c.valorFixo !== null) return formatCurrency(c.valorFixo)
  return '—'
}

function abrirNovaComissao() {
  comissaoEditando.value = null
  formModalOpen.value = true
}

function abrirEditarComissao(c: ComissaoProfissional) {
  comissaoEditando.value = c
  formModalOpen.value = true
}

function abrirPausarComissao(id: number) {
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
        { ...payload, ativo: comissaoEditando.value.ativo },
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

// --- Handlers Metas ---

function formatTipoMeta(tipo: string): string {
  const labels: Record<string, string> = {
    Atendimentos: 'Qtd. atendimentos',
    Faturamento: 'Valor faturado',
    Mista: 'Mista',
  }
  return labels[tipo] ?? tipo
}

function formatValorMeta(m: Meta): string {
  if (m.tipoMeta === 'Atendimentos') return `${m.valorMeta} atendimentos`
  return formatCurrency(m.valorMeta)
}

function progressBarClass(percentual: number): string {
  if (percentual >= 100) return 'bg-green-500'
  if (percentual >= 80) return 'bg-yellow-500'
  return 'bg-glow-gold'
}

function statusClass(atingida: boolean): string {
  return atingida
    ? 'bg-green-100 text-green-800'
    : 'bg-glow-canvas text-glow-text-subtle'
}

function abrirNovaMeta() {
  metaEditando.value = null
  metaFormModalOpen.value = true
}

function abrirEditarMeta(m: Meta) {
  metaEditando.value = m
  metaFormModalOpen.value = true
}

function abrirDesativarMeta(id: number) {
  metaDesativarId.value = id
  confirmMetaDesativarOpen.value = true
}

async function salvarMeta(payload: CriarMetaPayload) {
  if (!estabelecimentoId.value) return
  actionLoading.value = true
  try {
    if (metaEditando.value) {
      await caixaService.atualizarMeta(
        estabelecimentoId.value,
        metaEditando.value.id,
        { ...payload, ativa: metaEditando.value.ativa } as AtualizarMetaPayload,
      )
      notifications.push('success', 'Meta atualizada.')
    } else {
      await caixaService.criarMeta(estabelecimentoId.value, payload)
      notifications.push('success', 'Meta criada.')
    }
    metaFormModalOpen.value = false
    await loadMetas()
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    actionLoading.value = false
  }
}

async function confirmarDesativarMeta() {
  if (!estabelecimentoId.value || !metaDesativarId.value) return
  actionLoading.value = true
  try {
    await caixaService.desativarMeta(estabelecimentoId.value, metaDesativarId.value)
    notifications.push('success', 'Meta desativada.')
    confirmMetaDesativarOpen.value = false
    await loadMetas()
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
      subtitle="Regras, metas e extrato de comissões."
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
      <template v-if="podeGerenciar" #actions>
        <button
          v-if="aba === 'regras'"
          type="button"
          class="financeiro-btn-primary"
          @click="abrirNovaComissao"
        >
          Nova comissão
        </button>
        <button
          v-if="aba === 'metas' && podeGerenciarMeta"
          type="button"
          class="financeiro-btn-primary"
          @click="abrirNovaMeta"
        >
          Nova meta
        </button>
      </template>
    </FinanceiroPageHeader>

    <ContentAlert v-if="contextError" variant="error">{{ contextError }}</ContentAlert>
    <LoadingSpinner v-if="contextLoading || loading" />

    <!-- Aba: Regras -->
    <template v-else-if="aba === 'regras'">
      <FinanceiroEmptyState
        v-if="comissoes.length === 0"
        title="Nenhuma comissão"
        description="Configure comissões para os profissionais."
      >
        <template v-if="podeGerenciar" #action>
          <button type="button" class="financeiro-btn-primary" @click="abrirNovaComissao">
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
              @click="abrirEditarComissao(c)"
            >
              Editar
            </button>
            <button
              v-if="podeGerenciar && c.ativo"
              type="button"
              class="financeiro-btn-outline"
              @click="abrirPausarComissao(c.id)"
            >
              Pausar regra
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Aba: Metas (CRUD) -->
    <template v-else-if="aba === 'metas'">
      <FinanceiroEmptyState
        v-if="metas.length === 0"
        title="Nenhuma meta"
        description="Crie metas de comissão por desempenho para os profissionais."
      >
        <template v-if="podeGerenciarMeta" #action>
          <button type="button" class="financeiro-btn-primary" @click="abrirNovaMeta">
            Criar primeira meta
          </button>
        </template>
      </FinanceiroEmptyState>
      <div v-else class="space-y-2">
        <div
          v-for="m in metas"
          :key="m.id"
          class="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-glow-border-soft bg-glow-surface p-4"
        >
          <div>
            <p class="font-urbanist text-sm font-semibold text-glow-text">{{ m.nome }}</p>
            <p class="font-urbanist text-xs text-glow-text-subtle">
              {{ formatTipoMeta(m.tipoMeta) }} · {{ formatValorMeta(m) }} · {{ m.percentualComissao }}% comissão
            </p>
          </div>
          <div class="flex items-center gap-2">
            <span
              class="inline-flex rounded-full px-2 py-0.5 font-urbanist text-xs"
              :class="m.ativa ? 'bg-green-100 text-green-800' : 'bg-glow-canvas text-glow-text-subtle'"
            >
              {{ m.ativa ? 'Ativa' : 'Inativa' }}
            </span>
            <button
              v-if="podeGerenciarMeta && m.ativa"
              type="button"
              class="financeiro-btn-outline"
              @click="abrirEditarMeta(m)"
            >
              Editar
            </button>
            <button
              v-if="podeGerenciarMeta && m.ativa"
              type="button"
              class="financeiro-btn-outline"
              @click="abrirDesativarMeta(m.id)"
            >
              Desativar
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Aba: Progresso -->
    <template v-else-if="aba === 'progresso'">
      <FinanceiroEmptyState
        v-if="progresso.length === 0"
        title="Nenhum progresso"
        description="O progresso dos profissionais nas metas aparecerá aqui."
      />
      <div v-else class="financeiro-table-wrap hidden md:block">
        <table class="financeiro-table">
          <thead>
            <tr>
              <th>Profissional</th>
              <th>Meta</th>
              <th>Tipo</th>
              <th>Alvo</th>
              <th>Realizado</th>
              <th>Progresso</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, idx) in progresso" :key="`${p.profissionalEstabelecimentoId}-${p.metaNome}-${idx}`">
              <td class="text-glow-text-subtle">{{ p.nomePublico }}</td>
              <td>{{ p.metaNome }}</td>
              <td>{{ p.tipoMeta }}</td>
              <td>
                <template v-if="p.tipoMeta === 'Atendimentos'">{{ p.valorMeta }} atend.</template>
                <template v-else>{{ formatCurrency(p.valorMeta) }}</template>
              </td>
              <td>
                <template v-if="p.tipoMeta === 'Atendimentos'">{{ p.quantidadeRealizada ?? 0 }}</template>
                <template v-else>{{ formatCurrency(p.valorRealizado ?? 0) }}</template>
              </td>
              <td>
                <div class="flex items-center gap-2">
                  <div class="h-2 w-24 overflow-hidden rounded-full bg-glow-canvas">
                    <div
                      class="h-full rounded-full transition-all duration-300"
                      :class="progressBarClass(p.percentualProgresso)"
                      :style="{ width: Math.min(p.percentualProgresso, 100) + '%' }"
                    />
                  </div>
                  <span class="text-xs font-medium">{{ p.percentualProgresso }}%</span>
                </div>
              </td>
              <td>
                <span
                  class="inline-flex rounded-full px-2 py-0.5 font-urbanist text-xs font-medium"
                  :class="statusClass(p.atingida)"
                >
                  {{ p.atingida ? 'Atingida' : 'Em andamento' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="progresso.length > 0" class="space-y-3 md:hidden">
        <div
          v-for="(p, idx) in progresso"
          :key="`${p.profissionalEstabelecimentoId}-${p.metaNome}-${idx}`"
          class="financeiro-table__row-card"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0 flex-1">
              <p class="font-urbanist font-medium text-glow-text">{{ p.nomePublico }}</p>
              <p class="text-sm text-glow-text-subtle">{{ p.metaNome }} ({{ p.tipoMeta }})</p>
            </div>
            <span
              class="shrink-0 inline-flex rounded-full px-2 py-0.5 font-urbanist text-xs font-medium"
              :class="statusClass(p.atingida)"
            >
              {{ p.atingida ? 'Atingida' : 'Em andamento' }}
            </span>
          </div>
          <div class="mt-2">
            <div class="flex items-center gap-2">
              <div class="h-2 flex-1 overflow-hidden rounded-full bg-glow-canvas">
                <div
                  class="h-full rounded-full transition-all duration-300"
                  :class="progressBarClass(p.percentualProgresso)"
                  :style="{ width: Math.min(p.percentualProgresso, 100) + '%' }"
                />
              </div>
              <span class="text-xs font-medium">{{ p.percentualProgresso }}%</span>
            </div>
          </div>
          <div class="financeiro-table__row-meta">
            <div class="financeiro-table__row-meta-item">
              <span class="financeiro-table__row-meta-label">Alvo</span>
              <span class="financeiro-table__row-meta-value">
                <template v-if="p.tipoMeta === 'Atendimentos'">{{ p.valorMeta }} atend.</template>
                <template v-else>{{ formatCurrency(p.valorMeta) }}</template>
              </span>
            </div>
            <div class="financeiro-table__row-meta-item">
              <span class="financeiro-table__row-meta-label">Realizado</span>
              <span class="financeiro-table__row-meta-value">
                <template v-if="p.tipoMeta === 'Atendimentos'">{{ p.quantidadeRealizada ?? 0 }}</template>
                <template v-else>{{ formatCurrency(p.valorRealizado ?? 0) }}</template>
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Aba: Histórico -->
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

    <!-- Aba: Extrato -->
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

    <!-- Modal: Comissão -->
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

    <!-- Modal: Meta -->
    <MetaFormModal
      v-model="metaFormModalOpen"
      :loading="actionLoading"
      :meta="metaEditando"
      @confirm="salvarMeta"
    />
    <FinanceiroConfirmDialog
      v-model="confirmMetaDesativarOpen"
      title="Desativar meta?"
      message="Esta meta deixará de ser considerada para cálculos de comissão."
      confirm-label="Desativar meta"
      variant="danger"
      :loading="actionLoading"
      @confirm="confirmarDesativarMeta"
    />
  </div>
</template>

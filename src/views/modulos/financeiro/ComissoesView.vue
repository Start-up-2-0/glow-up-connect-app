<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import ContentAlert from '@/components/feedback/ContentAlert.vue'
import FinanceiroPageHeader from '@/components/financeiro/FinanceiroPageHeader.vue'
import FinanceiroKpiCard from '@/components/financeiro/FinanceiroKpiCard.vue'
import FinanceiroEmptyState from '@/components/financeiro/FinanceiroEmptyState.vue'
import FinanceiroConfirmDialog from '@/components/financeiro/FinanceiroConfirmDialog.vue'
import ComissaoFormModal from '@/components/financeiro/ComissaoFormModal.vue'
import MetaFormModal from '@/components/financeiro/MetaFormModal.vue'
import ProfissionalMetaDetailModal from '@/components/financeiro/ProfissionalMetaDetailModal.vue'
import { FINANCEIRO_PAGE_CLASS } from '@/constants/designTokens'
import { ROUTE_PATHS } from '@/constants/routes'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { caixaService } from '@/services/caixaService'
import { equipeService } from '@/services/equipeService'
import type {
  ComissaoProfissional,
  CriarComissaoPayload,
  Meta,
  CriarMetaPayload,
  AtualizarMetaPayload,
  MetaProgressoProfissional,
} from '@/types/negocio/caixa.types'
import type { ProfissionalEquipe } from '@/types/negocio/equipe.types'
import { formatCurrency } from '@/utils/formatters'

const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const { possuiPermissao } = useNegocioContext()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()
const route = useRoute()

const abaInicial = (() => {
  const q = route.query.aba as string
  if (q === 'metas') return 'metas'
  if (q === 'regras') return 'regras'
  return 'acompanhamento'
})()
const aba = ref(abaInicial)

// Comissões (Regras)
const comissoes = ref<ComissaoProfissional[]>([])
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
const metaFiltro = ref('todas')
const metaBusca = ref('')

// Acompanhamento
const mesFiltro = ref(new Date().getMonth() + 1) // 1-12
const anoFiltro = ref(new Date().getFullYear())
const profissionalDetalhe = ref<MetaProgressoProfissional | null>(null)
const metaDetalhe = ref<Meta | null>(null)
const detalheModalOpen = ref(false)

const loading = ref(false)
const actionLoading = ref(false)

const podeGerenciar = computed(() => possuiPermissao('CaixaGerenciar'))
const podeGerenciarMeta = computed(() => possuiPermissao('MetaGerenciar') || podeGerenciar.value)

const metasFiltradas = computed(() => {
  let lista = metas.value
  if (metaFiltro.value === 'ativas') lista = lista.filter((m) => m.ativa)
  else if (metaFiltro.value === 'pausadas') lista = lista.filter((m) => !m.ativa)
  if (metaBusca.value.trim()) {
    const q = metaBusca.value.trim().toLowerCase()
    lista = lista.filter((m) => m.nome.toLowerCase().includes(q))
  }
  return lista
})

// Indicadores
const metasAtivasCount = computed(() => metas.value.filter((m) => m.ativa).length)
const profissionaisCount = computed(() => {
  const unique = new Set(progresso.value.map((p) => p.profissionalEstabelecimentoId))
  return unique.size
})

const proximoFechamento = computed(() => {
  const hoje = new Date()
  const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
  return ultimoDia.toLocaleDateString('pt-BR')
})

const abaOptions = computed(() => {
  const opts: Array<{ value: string; label: string }> = []
  opts.push({ value: 'acompanhamento', label: '📊 Acompanhamento' })
  if (podeGerenciar.value) {
    opts.push({ value: 'metas', label: `🎯 Metas (${metas.value.length})` })
    opts.push({ value: 'regras', label: `💰 Regras (${comissoes.value.length})` })
  }
  return opts
})

const filtroMetaOptions = [
  { value: 'todas', label: 'Todas' },
  { value: 'ativas', label: 'Ativas' },
  { value: 'pausadas', label: 'Pausadas' },
]

const mesOptions = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
]

// --- Loaders ---

async function loadRegras() {
  if (!estabelecimentoId.value || !podeGerenciar.value) return
  comissoes.value = await caixaService.listarComissoes(estabelecimentoId.value)
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
    progresso.value = await caixaService.listarProgressoMetas(
      estabelecimentoId.value,
      undefined,
      mesFiltro.value,
      anoFiltro.value,
    )
  } catch (err) {
    notifications.push('error', resolveError(err))
  }
}

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  try {
    if (aba.value === 'regras') await loadRegras()
    else if (aba.value === 'metas') await loadMetas()
    else if (aba.value === 'acompanhamento') await loadProgresso()
    await loadProfissionais()
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
    Atendimentos: '📋 Qtd. atendimentos',
    Faturamento: '💰 Valor faturado',
    Mista: '🎯 Mista',
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

function progressBarTextClass(percentual: number): string {
  if (percentual >= 100) return 'text-green-700'
  if (percentual >= 80) return 'text-yellow-700'
  return 'text-glow-text'
}

function statusClass(ativa: boolean): string {
  return ativa
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

// --- Handlers Acompanhamento ---

function abrirPosicaoFiltro() {
  // month picker handler - recarrega progresso on change
  void loadProgresso()
}

function abrirDetalheProfissional(p: MetaProgressoProfissional) {
  profissionalDetalhe.value = p
  metaDetalhe.value = metas.value.find(
    (m) => m.nome === p.metaNome,
  ) ?? null
  detalheModalOpen.value = true
}

function formatRealizado(p: MetaProgressoProfissional): string {
  if (p.tipoMeta === 'Atendimentos') return String(p.quantidadeRealizada ?? 0)
  return formatCurrency(p.valorRealizado ?? 0)
}

function formatAlvo(p: MetaProgressoProfissional): string {
  if (p.tipoMeta === 'Atendimentos') return String(p.valorMeta)
  return formatCurrency(p.valorMeta)
}

function formatRestante(p: MetaProgressoProfissional): string {
  if (p.atingida) return 'Meta concluída!'
  if (p.tipoMeta === 'Atendimentos') {
    const resto = Math.max(0, p.valorMeta - (p.quantidadeRealizada ?? 0))
    return `Faltam ${resto} atendimento${resto !== 1 ? 's' : ''}`
  }
  const resto = Math.max(0, p.valorMeta - (p.valorRealizado ?? 0))
  return `Faltam ${formatCurrency(resto)}`
}

function percentualInfo(p: MetaProgressoProfissional): { valor: number; classe: string } {
  const val = p.percentualProgresso
  return {
    valor: val,
    classe: val >= 100 ? 'text-green-700' : val >= 80 ? 'text-yellow-700' : 'text-glow-text',
  }
}

watch(ready, (isReady) => {
  if (isReady) {
    void load()
  }
}, { immediate: true })

watch(aba, () => void load())
</script>

<template>
  <div :class="FINANCEIRO_PAGE_CLASS">
    <!-- Header -->
    <FinanceiroPageHeader
      title="Comissões"
      subtitle="Acompanhe o desempenho dos profissionais, gerencie metas e regras de comissão."
      :back-to="ROUTE_PATHS.FINANCEIRO"
    />

    <!-- KPI Cards -->
    <div class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
      <FinanceiroKpiCard
        label="Metas ativas"
        :value="String(metasAtivasCount)"
        accent="gold"
      />
      <FinanceiroKpiCard
        label="Profissionais"
        :value="String(profissionaisCount)"
        accent="blue"
      />
      <FinanceiroKpiCard
        label="Próx. fechamento"
        :value="proximoFechamento"
        accent="neutral"
        hint="Fim do mês"
      />
    </div>

    <!-- Tabs + Actions Row -->
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-wrap items-center gap-3">
        <div class="financeiro-segmented">
          <button
            v-for="opt in abaOptions"
            :key="opt.value"
            type="button"
            class="financeiro-segmented__btn whitespace-nowrap"
            :class="{ 'financeiro-segmented__btn--active': aba === opt.value }"
            @click="aba = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <template v-if="podeGerenciar">
          <button
            v-if="aba === 'metas' && podeGerenciarMeta"
            type="button"
            class="financeiro-btn-primary flex items-center gap-1.5"
            @click="abrirNovaMeta"
          >
            <span class="text-base leading-none">+</span>
            Criar meta
          </button>
          <button
            v-if="aba === 'regras'"
            type="button"
            class="financeiro-btn-primary flex items-center gap-1.5"
            @click="abrirNovaComissao"
          >
            <span class="text-base leading-none">+</span>
            Nova regra
          </button>
        </template>
      </div>
    </div>

    <ContentAlert v-if="contextError" variant="error">{{ contextError }}</ContentAlert>
    <LoadingSpinner v-if="contextLoading || loading" />

    <!-- ==================== ABA: ACOMPANHAMENTO ==================== -->
    <template v-else-if="aba === 'acompanhamento'">
      <!-- Filtro Mês/Ano -->
      <div class="mb-4 flex flex-wrap items-end gap-3">
        <label class="font-urbanist text-sm text-glow-text-subtle">
          Mês
          <select
            v-model.number="mesFiltro"
            class="mt-1 block rounded-lg border border-glow-border-soft bg-glow-canvas px-3 py-1.5 text-glow-text"
            @change="abrirPosicaoFiltro"
          >
            <option
              v-for="opt in mesOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </label>
        <label class="font-urbanist text-sm text-glow-text-subtle">
          Ano
          <input
            v-model.number="anoFiltro"
            type="number"
            min="2024"
            max="2030"
            class="mt-1 block w-20 rounded-lg border border-glow-border-soft bg-glow-canvas px-3 py-1.5 text-glow-text"
            @change="abrirPosicaoFiltro"
          />
        </label>
      </div>

      <!-- Banner explicativo -->
      <div class="mb-4 rounded-xl border border-glow-border-soft bg-glow-surface p-4">
        <div class="flex items-start gap-3">
          <span class="text-xl leading-none">💡</span>
          <div class="min-w-0 flex-1">
            <p class="font-urbanist text-sm font-semibold text-glow-text">Como funciona?</p>
            <p class="mt-0.5 font-urbanist text-xs leading-relaxed text-glow-text-subtle">
              As metas são verificadas automaticamente a cada recebimento. O progresso é calculado
              com base nos agendamentos concluídos do período selecionado.
            </p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <FinanceiroEmptyState
        v-if="progresso.length === 0"
        title="Nenhum progresso no período"
        description="Nenhum profissional com meta ativa para o período selecionado. Crie metas na aba 'Metas' e aguarde os atendimentos serem concluídos."
      />

      <!-- Cards de profissionais com progresso -->
      <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(p, idx) in progresso"
          :key="`${p.profissionalEstabelecimentoId}-${p.metaNome}-${idx}`"
          class="group relative cursor-pointer rounded-xl border border-glow-border-soft bg-glow-surface p-4 transition hover:shadow-glow-sm"
          @click="abrirDetalheProfissional(p)"
        >
          <!-- Cabeçalho -->
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0 flex-1">
              <p class="font-urbanist text-sm font-semibold text-glow-text">{{ p.nomePublico }}</p>
              <p class="mt-0.5 font-urbanist text-xs text-glow-text-subtle">
                {{ formatTipoMeta(p.tipoMeta) }} · {{ p.metaNome }}
              </p>
            </div>
            <span
              class="inline-flex shrink-0 rounded-full px-2 py-0.5 font-urbanist text-xs font-medium"
              :class="p.atingida ? 'bg-green-100 text-green-800' : 'bg-glow-canvas text-glow-text-subtle'"
            >
              {{ p.atingida ? '✅ Concluída' : '⏳ Em andamento' }}
            </span>
          </div>

          <!-- Progresso -->
          <div class="mt-3">
            <div class="flex items-center justify-between text-xs">
              <span class="font-medium" :class="progressBarTextClass(p.percentualProgresso)">
                {{ formatRealizado(p) }} / {{ formatAlvo(p) }}
              </span>
              <span class="font-satoshi font-bold" :class="progressBarTextClass(p.percentualProgresso)">
                {{ p.percentualProgresso }}%
              </span>
            </div>
            <div class="mt-1.5 h-2.5 overflow-hidden rounded-full bg-glow-canvas">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="progressBarClass(p.percentualProgresso)"
                :style="{ width: Math.min(p.percentualProgresso, 100) + '%' }"
              />
            </div>
          </div>

          <!-- Meta info adicional -->
          <div class="mt-2 flex items-center justify-between text-xs text-glow-text-subtle">
            <span>Comissão: {{ p.percentualComissao }}%</span>
            <span>{{ formatRestante(p) }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- ==================== ABA: METAS ==================== -->
    <template v-else-if="aba === 'metas'">
      <!-- Filtro + Busca (quando há metas) -->
      <div v-if="metas.length > 0" class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="financeiro-search flex-1 max-w-xs">
          <input
            v-model="metaBusca"
            type="text"
            placeholder="🔍 Buscar metas..."
            class="financeiro-search__input"
          />
        </div>
        <div class="financeiro-segmented">
          <button
            v-for="opt in filtroMetaOptions"
            :key="opt.value"
            type="button"
            class="financeiro-segmented__btn"
            :class="{ 'financeiro-segmented__btn--active': metaFiltro === opt.value }"
            @click="metaFiltro = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- Banner explicativo -->
      <div class="mb-4 rounded-xl border border-glow-border-soft bg-glow-surface p-4">
        <div class="flex items-start gap-3">
          <span class="text-xl leading-none">💡</span>
          <div class="min-w-0 flex-1">
            <p class="font-urbanist text-sm font-semibold text-glow-text">Como funciona?</p>
            <p class="mt-0.5 font-urbanist text-xs leading-relaxed text-glow-text-subtle">
              As metas são verificadas automaticamente a cada recebimento. Quando um profissional
              atingir o objetivo configurado no mês, a comissão será calculada automaticamente
              — considerando a maior entre a regra normal e a comissão da meta.
            </p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <FinanceiroEmptyState
        v-if="metasFiltradas.length === 0 && metas.length === 0"
        title="Crie sua primeira meta de comissão"
        description="As metas permitem recompensar profissionais quando atingirem determinado desempenho."
      >
        <template #action>
          <button
            v-if="podeGerenciarMeta"
            type="button"
            class="financeiro-btn-primary flex items-center gap-1.5"
            @click="abrirNovaMeta"
          >
            <span class="text-base leading-none">+</span>
            Criar primeira meta
          </button>
        </template>
        <template #default>
          <div class="mt-4 grid gap-2 sm:grid-cols-3">
            <div class="rounded-lg border border-glow-border-soft bg-glow-canvas p-3 opacity-50">
              <p class="font-urbanist text-xs font-semibold text-glow-text">💰 Meta por faturamento</p>
              <p class="mt-1 font-urbanist text-lg font-bold text-glow-text">R$ 8.000</p>
              <p class="text-xs text-glow-text-subtle">Comissão: 10%</p>
            </div>
            <div class="rounded-lg border border-glow-border-soft bg-glow-canvas p-3 opacity-50">
              <p class="font-urbanist text-xs font-semibold text-glow-text">📋 Meta por atendimentos</p>
              <p class="mt-1 font-urbanist text-lg font-bold text-glow-text">150</p>
              <p class="text-xs text-glow-text-subtle">Comissão: 8%</p>
            </div>
            <div class="rounded-lg border border-glow-border-soft bg-glow-canvas p-3 opacity-50">
              <p class="font-urbanist text-xs font-semibold text-glow-text">🎯 Meta mista</p>
              <p class="mt-1 font-urbanist text-lg font-bold text-glow-text">R$ 5.000</p>
              <p class="text-xs text-glow-text-subtle">+ 80 atendimentos · 12%</p>
            </div>
          </div>
        </template>
      </FinanceiroEmptyState>

      <!-- Empty filter result -->
      <FinanceiroEmptyState
        v-else-if="metasFiltradas.length === 0 && metas.length > 0"
        title="Nenhuma meta encontrada"
        description="Tente ajustar o filtro ou a busca."
      />

      <!-- Cards de metas -->
      <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="m in metasFiltradas"
          :key="m.id"
          class="group relative rounded-xl border border-glow-border-soft bg-glow-surface p-4 transition hover:shadow-glow-sm"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0 flex-1">
              <p class="font-urbanist text-sm font-semibold text-glow-text">{{ m.nome }}</p>
              <p class="mt-0.5 font-urbanist text-xs text-glow-text-subtle">
                {{ formatTipoMeta(m.tipoMeta) }} · {{ formatValorMeta(m) }}
              </p>
            </div>
            <span
              class="inline-flex shrink-0 rounded-full px-2 py-0.5 font-urbanist text-xs"
              :class="statusClass(m.ativa)"
            >
              {{ m.ativa ? 'Ativa' : 'Inativa' }}
            </span>
          </div>

          <div class="mt-3">
            <div class="flex items-center justify-between text-xs">
              <span class="font-medium" :class="progressBarTextClass(m.percentualComissao)">
                {{ m.percentualComissao }}% comissão
              </span>
            </div>
          </div>

          <!-- Ações -->
          <div v-if="podeGerenciarMeta && m.ativa" class="mt-3 flex items-center gap-2 pt-3 border-t border-glow-border-soft">
            <button
              type="button"
              class="text-xs font-medium text-glow-gold-dark hover:underline"
              @click="abrirEditarMeta(m)"
            >
              Editar
            </button>
            <span class="text-glow-border-soft">·</span>
            <button
              type="button"
              class="text-xs font-medium text-glow-text-subtle hover:text-glow-text hover:underline"
              @click="abrirDesativarMeta(m.id)"
            >
              Desativar
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- ==================== ABA: REGRAS ==================== -->
    <template v-else-if="aba === 'regras'">
      <FinanceiroEmptyState
        v-if="comissoes.length === 0"
        title="Nenhuma regra de comissão"
        description="Configure comissões para os profissionais com base em percentual ou valor fixo."
      >
        <template v-if="podeGerenciar" #action>
          <button type="button" class="financeiro-btn-primary flex items-center gap-1.5" @click="abrirNovaComissao">
            <span class="text-base leading-none">+</span>
            Configurar primeira regra
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

    <!-- ==================== MODAIS ==================== -->
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

    <MetaFormModal
      v-model="metaFormModalOpen"
      :loading="actionLoading"
      :meta="metaEditando"
      :profissionais="profissionais.map((p) => ({ id: p.id, nomePublico: p.nomePublico }))"
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

    <ProfissionalMetaDetailModal
      v-model="detalheModalOpen"
      :loading="actionLoading"
      :profissional="profissionalDetalhe"
      :meta="metaDetalhe"
      @edit="profissionalDetalhe ? abrirEditarMeta(metaDetalhe ?? null) : undefined"
      @cancel="profissionalDetalhe ? abrirDesativarMeta(metaDetalhe?.id ?? 0) : undefined"
    />
  </div>
</template>

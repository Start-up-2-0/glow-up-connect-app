<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  CalendarDays,
  Download,
  Plus,
  Target,
  Users,
  Wallet,
} from 'lucide-vue-next'
import ContentAlert from '@/components/feedback/ContentAlert.vue'
import FinanceiroEmptyState from '@/components/financeiro/FinanceiroEmptyState.vue'
import FinanceiroConfirmDialog from '@/components/financeiro/FinanceiroConfirmDialog.vue'
import ComissaoFormModal from '@/components/financeiro/ComissaoFormModal.vue'
import MetaFormModal from '@/components/financeiro/MetaFormModal.vue'
import ProfissionalMetaDetailModal from '@/components/financeiro/ProfissionalMetaDetailModal.vue'
import ComissoesPageHeader from '@/components/financeiro/comissoes/ComissoesPageHeader.vue'
import ComissoesTabs from '@/components/financeiro/comissoes/ComissoesTabs.vue'
import ComissoesTipBanner from '@/components/financeiro/comissoes/ComissoesTipBanner.vue'
import ComissoesProfissionalCard from '@/components/financeiro/comissoes/ComissoesProfissionalCard.vue'
import ComissoesAvisoBanner from '@/components/financeiro/comissoes/ComissoesAvisoBanner.vue'
import StatsGrid, { type ClienteStat } from '@/components/dashboard/cliente/StatsGrid.vue'
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
import '@/components/assinatura/page/assinaturaPage.css'

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
const tipAcompanhamentoVisivel = ref(true)
const tipMetasVisivel = ref(true)

const comissoes = ref<ComissaoProfissional[]>([])
const profissionais = ref<ProfissionalEquipe[]>([])
const formModalOpen = ref(false)
const confirmDesativarOpen = ref(false)
const comissaoEditando = ref<ComissaoProfissional | null>(null)
const comissaoDesativarId = ref<number | null>(null)

const metas = ref<Meta[]>([])
const progresso = ref<MetaProgressoProfissional[]>([])
const metaFormModalOpen = ref(false)
const confirmMetaDesativarOpen = ref(false)
const metaEditando = ref<Meta | null>(null)
const metaDesativarId = ref<number | null>(null)
const metaFiltro = ref('todas')
const metaBusca = ref('')

const mesFiltro = ref(new Date().getMonth() + 1)
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

const metasAtivasCount = computed(() => metas.value.filter((m) => m.ativa).length)
const profissionaisCount = computed(() => {
  const unique = new Set(progresso.value.map((p) => p.profissionalEstabelecimentoId))
  return unique.size || profissionais.value.filter((p) => p.ativo).length
})

const proximoFechamento = computed(() => {
  const base = new Date(anoFiltro.value, mesFiltro.value, 0)
  return base.toLocaleDateString('pt-BR')
})

const totalEstimado = computed(() =>
  progresso.value.reduce((acc, p) => {
    if (p.valorRealizado == null || p.valorRealizado <= 0) return acc
    return acc + (p.valorRealizado * p.percentualComissao) / 100
  }, 0),
)

const stats = computed<ClienteStat[]>(() => [
  {
    id: 'metas',
    label: 'Metas ativas',
    value: String(metasAtivasCount.value),
    icon: Target,
    iconClass: 'bg-glow-gold-cta/15 text-glow-gold-cta',
    hint: 'Em andamento',
  },
  {
    id: 'profissionais',
    label: 'Profissionais',
    value: String(profissionaisCount.value),
    icon: Users,
    iconClass: 'bg-glow-success-bg text-glow-success-dark',
    hint: 'Com comissões ativas',
  },
  {
    id: 'fechamento',
    label: 'Próx. fechamento',
    value: proximoFechamento.value,
    icon: CalendarDays,
    iconClass: 'bg-glow-info-bg text-glow-info',
    hint: 'Fim do mês',
  },
  {
    id: 'total',
    label: 'Total a pagar (estimado)',
    value: formatCurrency(totalEstimado.value),
    icon: Wallet,
    iconClass: 'bg-amber-100 text-amber-700',
    hint: 'Este mês',
  },
])

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

const tipAcompanhamento =
  'As metas são verificadas automaticamente a cada recebimento. O progresso é calculado com base nos agendamentos concluídos do período selecionado.'

const tipMetas =
  'As metas são verificadas automaticamente a cada recebimento. Quando um profissional atingir o objetivo, a comissão considera a maior entre a regra normal e a comissão da meta.'

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
    if (aba.value === 'regras') {
      await Promise.all([loadRegras(), loadMetas()])
    } else if (aba.value === 'metas') {
      await Promise.all([loadMetas(), loadRegras().catch(() => undefined)])
    } else {
      await Promise.all([
        loadProgresso(),
        loadMetas(),
        podeGerenciar.value ? loadRegras() : Promise.resolve(),
      ])
    }
    await loadProfissionais()
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

function formatTipoMeta(tipo: string): string {
  const labels: Record<string, string> = {
    Atendimentos: 'Qtd. atendimentos',
    Faturamento: 'Valor faturado',
    Mista: 'Meta mista',
  }
  return labels[tipo] ?? tipo
}

function formatValorMeta(m: Meta): string {
  if (m.tipoMeta === 'Atendimentos') return `${m.valorMeta} atendimentos`
  return formatCurrency(m.valorMeta)
}

function statusClass(ativa: boolean): string {
  return ativa
    ? 'bg-glow-success-bg text-glow-success-dark'
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

function abrirPosicaoFiltro() {
  void loadProgresso()
}

function abrirDetalheProfissional(p: MetaProgressoProfissional) {
  profissionalDetalhe.value = p
  metaDetalhe.value = metas.value.find((m) => m.nome === p.metaNome) ?? null
  detalheModalOpen.value = true
}

function exportarRelatorio() {
  if (progresso.value.length === 0) {
    notifications.push('info', 'Não há dados para exportar neste período.')
    return
  }
  const header = [
    'Profissional',
    'Meta',
    'Tipo',
    'Alvo',
    'Realizado',
    'Progresso%',
    'Comissao%',
    'Atingida',
  ]
  const rows = progresso.value.map((p) => {
    const realizado =
      p.tipoMeta === 'Atendimentos'
        ? String(p.quantidadeRealizada ?? 0)
        : String(p.valorRealizado ?? 0)
    return [
      p.nomePublico,
      p.metaNome,
      p.tipoMeta,
      p.valorMeta,
      realizado,
      p.percentualProgresso,
      p.percentualComissao,
      p.atingida ? 'Sim' : 'Nao',
    ]
      .map((v) => `"${String(v).replaceAll('"', '""')}"`)
      .join(',')
  })
  const blob = new Blob([[header.join(','), ...rows].join('\n')], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `comissoes-${anoFiltro.value}-${String(mesFiltro.value).padStart(2, '0')}.csv`
  a.click()
  URL.revokeObjectURL(url)
  notifications.push('success', 'Relatório exportado.')
}

watch(
  ready,
  (isReady) => {
    if (isReady) void load()
  },
  { immediate: true },
)

watch(aba, () => void load())
</script>

<template>
  <div class="comissoes-page flex w-full flex-col gap-5 pb-8">
    <ComissoesPageHeader>
      <template v-if="podeGerenciar" #actions>
        <button
          v-if="aba === 'metas' && podeGerenciarMeta"
          type="button"
          class="assinatura-btn-cta"
          @click="abrirNovaMeta"
        >
          <Plus :size="16" :stroke-width="2" />
          Criar meta
        </button>
        <button
          v-if="aba === 'regras'"
          type="button"
          class="assinatura-btn-cta"
          @click="abrirNovaComissao"
        >
          <Plus :size="16" :stroke-width="2" />
          Nova regra
        </button>
      </template>
    </ComissoesPageHeader>

    <ContentAlert v-if="contextError" variant="error">{{ contextError }}</ContentAlert>

    <StatsGrid :items="stats" :loading="contextLoading || loading" />

    <ComissoesTabs
      :aba="aba"
      :metas-count="metas.length"
      :regras-count="comissoes.length"
      :pode-gerenciar="podeGerenciar"
      @update:aba="aba = $event"
    />

    <template v-if="aba === 'acompanhamento'">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div class="flex flex-wrap items-end gap-3">
          <label class="font-urbanist text-[12px] font-medium text-glow-text-subtle">
            Mês
            <select
              v-model.number="mesFiltro"
              class="mt-1 block rounded-xl border border-glow-border-soft bg-glow-surface px-3 py-2 font-urbanist text-[13px] text-glow-text"
              @change="abrirPosicaoFiltro"
            >
              <option v-for="opt in mesOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </label>
          <label class="font-urbanist text-[12px] font-medium text-glow-text-subtle">
            Ano
            <input
              v-model.number="anoFiltro"
              type="number"
              min="2024"
              max="2030"
              class="mt-1 block w-24 rounded-xl border border-glow-border-soft bg-glow-surface px-3 py-2 font-urbanist text-[13px] text-glow-text"
              @change="abrirPosicaoFiltro"
            />
          </label>
        </div>
        <button type="button" class="assinatura-btn-secondary" @click="exportarRelatorio">
          <Download :size="16" :stroke-width="1.75" />
          Exportar relatório
        </button>
      </div>

      <ComissoesTipBanner
        v-if="tipAcompanhamentoVisivel"
        :texto="tipAcompanhamento"
        @fechar="tipAcompanhamentoVisivel = false"
      />

      <FinanceiroEmptyState
        v-if="progresso.length === 0"
        title="Nenhum progresso no período"
        description="Nenhum profissional com meta ativa para o período selecionado. Crie metas na aba Metas."
      />

      <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <ComissoesProfissionalCard
          v-for="(p, idx) in progresso"
          :key="`${p.profissionalEstabelecimentoId}-${p.metaNome}-${idx}`"
          :item="p"
          @click="abrirDetalheProfissional(p)"
        />
      </div>

      <ComissoesAvisoBanner
        v-if="podeGerenciar"
        @ver-regras="aba = 'regras'"
      />
      <aside
        v-else
        class="rounded-2xl border border-glow-border-soft bg-glow-surface px-4 py-3 font-urbanist text-[12px] text-glow-text-subtle"
      >
        Os valores exibidos são estimativas. Os valores finais podem variar de acordo com
        ajustes, regras e cancelamentos.
      </aside>
    </template>

    <template v-else-if="aba === 'metas'">
      <div
        v-if="metas.length > 0"
        class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <input
          v-model="metaBusca"
          type="search"
          placeholder="Buscar metas..."
          class="w-full max-w-xs rounded-xl border border-glow-border-soft bg-glow-surface px-3 py-2 font-urbanist text-[13px] text-glow-text placeholder:text-glow-placeholder"
        />
        <div class="flex flex-wrap gap-1 rounded-xl border border-glow-border-soft bg-glow-surface p-1">
          <button
            v-for="opt in filtroMetaOptions"
            :key="opt.value"
            type="button"
            class="rounded-lg px-3 py-1.5 font-urbanist text-[12px] font-medium text-glow-text-subtle transition"
            :class="
              metaFiltro === opt.value
                ? 'bg-glow-gold-selected text-glow-gold-cta'
                : 'hover:bg-glow-hover-surface'
            "
            @click="metaFiltro = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <ComissoesTipBanner
        v-if="tipMetasVisivel"
        :texto="tipMetas"
        @fechar="tipMetasVisivel = false"
      />

      <FinanceiroEmptyState
        v-if="metasFiltradas.length === 0 && metas.length === 0"
        title="Crie sua primeira meta de comissão"
        description="As metas permitem recompensar profissionais quando atingirem determinado desempenho."
      >
        <template #action>
          <button
            v-if="podeGerenciarMeta"
            type="button"
            class="assinatura-btn-cta"
            @click="abrirNovaMeta"
          >
            <Plus :size="16" :stroke-width="2" />
            Criar primeira meta
          </button>
        </template>
      </FinanceiroEmptyState>

      <FinanceiroEmptyState
        v-else-if="metasFiltradas.length === 0 && metas.length > 0"
        title="Nenhuma meta encontrada"
        description="Tente ajustar o filtro ou a busca."
      />

      <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="m in metasFiltradas"
          :key="m.id"
          class="rounded-2xl border border-glow-border-soft bg-glow-surface p-4 shadow-glow-sm"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="font-urbanist text-[14px] font-semibold text-glow-text">{{ m.nome }}</p>
              <p class="mt-0.5 font-urbanist text-[12px] text-glow-text-subtle">
                {{ formatTipoMeta(m.tipoMeta) }} · {{ formatValorMeta(m) }}
              </p>
            </div>
            <span
              class="inline-flex rounded-full px-2 py-0.5 font-urbanist text-[11px] font-semibold"
              :class="statusClass(m.ativa)"
            >
              {{ m.ativa ? 'Ativa' : 'Inativa' }}
            </span>
          </div>
          <p class="mt-3 font-urbanist text-[13px] font-semibold text-glow-text">
            {{ m.percentualComissao }}% comissão
          </p>
          <div
            v-if="podeGerenciarMeta && m.ativa"
            class="mt-3 flex items-center gap-2 border-t border-glow-border-soft pt-3"
          >
            <button
              type="button"
              class="font-urbanist text-[12px] font-semibold text-glow-gold-cta hover:underline"
              @click="abrirEditarMeta(m)"
            >
              Editar
            </button>
            <span class="text-glow-border-soft">·</span>
            <button
              type="button"
              class="font-urbanist text-[12px] font-medium text-glow-text-subtle hover:underline"
              @click="abrirDesativarMeta(m.id)"
            >
              Desativar
            </button>
          </div>
        </article>
      </div>
    </template>

    <template v-else-if="aba === 'regras'">
      <FinanceiroEmptyState
        v-if="comissoes.length === 0"
        title="Nenhuma regra de comissão"
        description="Configure comissões para os profissionais com base em percentual ou valor fixo."
      >
        <template v-if="podeGerenciar" #action>
          <button type="button" class="assinatura-btn-cta" @click="abrirNovaComissao">
            <Plus :size="16" :stroke-width="2" />
            Configurar primeira regra
          </button>
        </template>
      </FinanceiroEmptyState>

      <div v-else class="space-y-2">
        <div
          v-for="c in comissoes"
          :key="c.id"
          class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-glow-border-soft bg-glow-surface p-4 shadow-glow-sm"
        >
          <div>
            <p class="font-urbanist text-[14px] font-semibold text-glow-text">
              {{ c.nomePublico }}
            </p>
            <p class="font-urbanist text-[12px] text-glow-text-subtle">
              {{ c.tipoComissao }} · {{ formatComissao(c) }}
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <span
              class="inline-flex rounded-full px-2 py-0.5 font-urbanist text-[11px] font-semibold"
              :class="
                c.ativo
                  ? 'bg-glow-success-bg text-glow-success-dark'
                  : 'bg-glow-canvas text-glow-text-subtle'
              "
            >
              {{ c.ativo ? 'Ativa' : 'Pausada' }}
            </span>
            <button
              v-if="podeGerenciar && c.ativo"
              type="button"
              class="assinatura-btn-secondary"
              @click="abrirEditarComissao(c)"
            >
              Editar
            </button>
            <button
              v-if="podeGerenciar && c.ativo"
              type="button"
              class="assinatura-btn-secondary"
              @click="abrirPausarComissao(c.id)"
            >
              Pausar regra
            </button>
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
      @edit="metaDetalhe ? abrirEditarMeta(metaDetalhe) : undefined"
      @cancel="metaDetalhe ? abrirDesativarMeta(metaDetalhe.id) : undefined"
    />
  </div>
</template>

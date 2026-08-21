<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import ContentAlert from '@/components/feedback/ContentAlert.vue'
import FinanceiroPageHeader from '@/components/financeiro/FinanceiroPageHeader.vue'
import FinanceiroEmptyState from '@/components/financeiro/FinanceiroEmptyState.vue'
import FinanceiroConfirmDialog from '@/components/financeiro/FinanceiroConfirmDialog.vue'
import MetaFormModal from '@/components/financeiro/MetaFormModal.vue'
import MetaComissaoDetalheModal from '@/components/financeiro/MetaComissaoDetalheModal.vue'
import { FINANCEIRO_PAGE_CLASS } from '@/constants/designTokens'
import { ROUTE_PATHS } from '@/constants/routes'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { caixaService } from '@/services/caixaService'
import { equipeService } from '@/services/equipeService'
import type {
  Meta,
  CriarMetaPayload,
  MetaComissaoDetalhe,
  MetaComissaoProfissional,
  MetaComissaoStatus,
} from '@/types/negocio/caixa.types'
import type { ProfissionalEquipe } from '@/types/negocio/equipe.types'
import { formatCurrency } from '@/utils/formatters'

const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const { possuiPermissao } = useNegocioContext()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const lista = ref<MetaComissaoProfissional[]>([])
const loading = ref(false)
const actionLoading = ref(false)

const mes = ref(new Date().getMonth() + 1)
const ano = ref(new Date().getFullYear())

const formModalOpen = ref(false)
const metaEditando = ref<Meta | null>(null)
const profissionais = ref<ProfissionalEquipe[]>([])

const detalhe = ref<MetaComissaoDetalhe | null>(null)
const detalheOpen = ref(false)
const detalheLoading = ref(false)
const confirmCancelarOpen = ref(false)
const metaCancelarId = ref<number | null>(null)

const podeGerenciar = computed(
  () => possuiPermissao('MetaGerenciar') || possuiPermissao('CaixaGerenciar'),
)

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const mesOptions = MESES.map((label, i) => ({ value: String(i + 1), label }))

const STATUS_LABEL: Record<MetaComissaoStatus, string> = {
  EmAndamento: 'Em andamento',
  Concluida: 'Concluída',
  Cancelada: 'Cancelada',
}
const STATUS_CLASS: Record<MetaComissaoStatus, string> = {
  EmAndamento: 'bg-glow-gold/15 text-glow-gold',
  Concluida: 'bg-green-100 text-green-800',
  Cancelada: 'bg-glow-canvas text-glow-text-subtle',
}

const profissionaisForm = computed(() =>
  profissionais.value.map((p) => ({ id: p.profissionalId, nomePublico: p.nomePublico })),
)

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  try {
    lista.value = await caixaService.listarMetasComissao(estabelecimentoId.value, {
      mes: mes.value,
      ano: ano.value,
    })
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    loading.value = false
  }
}

async function loadProfissionais() {
  if (!estabelecimentoId.value) return
  try {
    profissionais.value = await equipeService.listarProfissionais(estabelecimentoId.value)
  } catch {
    profissionais.value = []
  }
}

function abrirNova() {
  metaEditando.value = null
  formModalOpen.value = true
}

function abrirEditarDeDetalhe() {
  if (!detalhe.value) return
  const d = detalhe.value
  metaEditando.value = {
    id: d.metaId,
    nome: d.nomeMeta,
    tipoMeta: d.tipoMeta,
    valorMeta: d.valorMeta,
    percentualComissao: d.percentualComissao,
    ativa: d.status !== 'Cancelada',
    recorrente: true,
    profissionalEstabelecimentoId: d.profissionalEstabelecimentoId,
    createAd: d.criadoEm,
    updatedAt: null,
  }
  formModalOpen.value = true
}

async function abrirDetalhe(m: MetaComissaoProfissional) {
  if (!estabelecimentoId.value) return
  detalheLoading.value = true
  detalhe.value = null
  detalheOpen.value = true
  try {
    detalhe.value = await caixaService.obterMetaComissaoDetalhe(
      estabelecimentoId.value,
      m.metaId,
    )
  } catch (err) {
    notifications.push('error', resolveError(err))
    detalheOpen.value = false
  } finally {
    detalheLoading.value = false
  }
}

async function salvarMeta(payload: CriarMetaPayload) {
  if (!estabelecimentoId.value) return
  actionLoading.value = true
  try {
    if (metaEditando.value) {
      await caixaService.atualizarMeta(estabelecimentoId.value, metaEditando.value.id, {
        ...payload,
        ativa: metaEditando.value.ativa,
      })
      notifications.push('success', 'Meta atualizada.')
    } else {
      await caixaService.criarMeta(estabelecimentoId.value, payload)
      notifications.push('success', 'Meta criada.')
    }
    formModalOpen.value = false
    detalheOpen.value = false
    await load()
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    actionLoading.value = false
  }
}

function pedirCancelamento() {
  if (!detalhe.value) return
  metaCancelarId.value = detalhe.value.metaId
  confirmCancelarOpen.value = true
}

async function confirmarCancelamento() {
  if (!estabelecimentoId.value || !metaCancelarId.value) return
  actionLoading.value = true
  try {
    await caixaService.desativarMeta(estabelecimentoId.value, metaCancelarId.value)
    notifications.push('success', 'Meta cancelada.')
    confirmCancelarOpen.value = false
    if (detalhe.value) {
      detalhe.value.status = 'Cancelada'
    }
    await load()
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    actionLoading.value = false
  }
}

async function reativar() {
  if (!estabelecimentoId.value || !detalhe.value) return
  actionLoading.value = true
  try {
    await caixaService.reativarMeta(estabelecimentoId.value, detalhe.value.metaId)
    notifications.push('success', 'Meta reativada.')
    if (detalhe.value) {
      detalhe.value.status = 'EmAndamento'
    }
    await load()
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    actionLoading.value = false
  }
}

async function concluir() {
  if (!estabelecimentoId.value || !detalhe.value) return
  actionLoading.value = true
  try {
    await caixaService.concluirMeta(estabelecimentoId.value, detalhe.value.metaId)
    notifications.push('success', 'Meta concluída! Notificações enviadas ao profissional e à loja.')
    // Recarrega o detalhe para exibir a automação de conclusão.
    detalhe.value = await caixaService.obterMetaComissaoDetalhe(
      estabelecimentoId.value,
      detalhe.value.metaId,
    )
    await load()
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    actionLoading.value = false
  }
}

function formatTipo(tipo: string): string {
  const labels: Record<string, string> = {
    Atendimentos: 'Qtd. atendimentos',
    Faturamento: 'Valor faturado',
    Mista: 'Mista',
  }
  return labels[tipo] ?? tipo
}

function formatRealizado(m: MetaComissaoProfissional): string {
  if (m.tipoMeta === 'Atendimentos') return `${m.quantidadeRealizada ?? 0}`
  return formatCurrency(m.valorRealizado ?? 0)
}

function formatAlvo(m: MetaComissaoProfissional): string {
  if (m.tipoMeta === 'Atendimentos') return `${m.valorMeta} atend.`
  return formatCurrency(m.valorMeta)
}

function formatPeriodo(m: MetaComissaoProfissional): string {
  return `${formatData(m.dataInicio)} → ${formatData(m.dataFim)}`
}

function formatData(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR')
}

function barraClass(m: MetaComissaoProfissional): string {
  if (m.atingida) return 'bg-green-500'
  if (m.percentualProgresso >= 80) return 'bg-yellow-500'
  return 'bg-glow-gold'
}

watch(ready, (isReady) => {
  if (isReady) {
    void loadProfissionais()
    void load()
  }
}, { immediate: true })

watch([mes, ano], () => void load())
</script>

<template>
  <div :class="FINANCEIRO_PAGE_CLASS">
    <FinanceiroPageHeader
      title="Metas de Comissão"
      subtitle="Acompanhe o desempenho dos profissionais nas metas do mês."
      :back-to="ROUTE_PATHS.FINANCEIRO"
    >
      <template #filters>
        <div class="flex items-center gap-2">
          <select
            v-model.number="mes"
            aria-label="Mês"
            class="h-10 rounded-lg border border-glow-border-soft bg-glow-canvas px-3 font-urbanist text-sm outline-none focus:border-glow-gold"
          >
            <option v-for="opt in mesOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <select
            v-model.number="ano"
            aria-label="Ano"
            class="h-10 rounded-lg border border-glow-border-soft bg-glow-canvas px-3 font-urbanist text-sm outline-none focus:border-glow-gold"
          >
            <option v-for="a in [ano - 1, ano, ano + 1]" :key="a" :value="a">{{ a }}</option>
          </select>
        </div>
      </template>
      <template v-if="podeGerenciar" #actions>
        <button type="button" class="financeiro-btn-primary" @click="abrirNova">
          Nova meta
        </button>
      </template>
    </FinanceiroPageHeader>

    <ContentAlert v-if="contextError" variant="error">{{ contextError }}</ContentAlert>

    <template v-if="!contextLoading && !loading">
      <FinanceiroEmptyState
        v-if="lista.length === 0"
        title="Nenhuma meta neste mês"
        description="Nenhum profissional possui meta de comissão ativa no período selecionado."
      >
        <template v-if="podeGerenciar" #action>
          <button type="button" class="financeiro-btn-primary" @click="abrirNova">
            Criar meta
          </button>
        </template>
      </FinanceiroEmptyState>

      <div v-else class="space-y-2">
        <div
          v-for="m in lista"
          :key="`${m.metaId}-${m.profissionalEstabelecimentoId}`"
          class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-glow-border-soft bg-glow-surface p-4 transition hover:border-glow-gold/40"
          role="button"
          tabindex="0"
          @click="abrirDetalhe(m)"
          @keydown.enter="abrirDetalhe(m)"
        >
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <p class="font-urbanist text-sm font-semibold text-glow-text">{{ m.nomePublico }}</p>
              <span
                class="inline-flex rounded-full px-2 py-0.5 font-urbanist text-xs"
                :class="STATUS_CLASS[m.status]"
              >
                {{ STATUS_LABEL[m.status] }}
              </span>
            </div>
            <p class="font-urbanist text-xs text-glow-text-subtle">
              {{ m.nomeMeta }} · {{ formatTipo(m.tipoMeta) }} · {{ m.percentualComissao }}% comissão
            </p>
          </div>

          <div class="min-w-44 flex-1 sm:flex-none">
            <div class="mb-1 flex items-center justify-between text-xs text-glow-text-subtle">
              <span>{{ formatRealizado(m) }} de {{ formatAlvo(m) }}</span>
              <span class="font-medium">{{ m.percentualProgresso }}%</span>
            </div>
            <div class="h-2 w-40 overflow-hidden rounded-full bg-glow-canvas">
              <div
                class="h-full rounded-full transition-all duration-300"
                :class="barraClass(m)"
                :style="{ width: Math.min(m.percentualProgresso, 100) + '%' }"
              />
            </div>
          </div>

          <p class="font-urbanist text-xs text-glow-text-subtle">{{ formatPeriodo(m) }}</p>
        </div>
      </div>
    </template>

    <MetaFormModal
      v-model="formModalOpen"
      :loading="actionLoading"
      :meta="metaEditando"
      :profissionais="profissionaisForm"
      @confirm="salvarMeta"
    />
    <MetaComissaoDetalheModal
      v-model="detalheOpen"
      :loading="detalheLoading || actionLoading"
      :meta="detalhe"
      :pode-gerenciar="podeGerenciar"
      @editar="abrirEditarDeDetalhe"
      @cancelar="pedirCancelamento"
      @reativar="reativar"
      @concluir="concluir"
    />
    <FinanceiroConfirmDialog
      v-model="confirmCancelarOpen"
      title="Cancelar meta?"
      message="Esta meta deixará de ser considerada para cálculos de comissão e não contabilizará novas evoluções."
      confirm-label="Cancelar meta"
      variant="danger"
      :loading="actionLoading"
      @confirm="confirmarCancelamento"
    />
  </div>
</template>

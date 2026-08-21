<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ContentAlert from '@/components/feedback/ContentAlert.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import FinanceiroPageHeader from '@/components/financeiro/FinanceiroPageHeader.vue'
import FinanceiroQuickFilters from '@/components/financeiro/FinanceiroQuickFilters.vue'
import FinanceiroPeriodoFiltro from '@/components/financeiro/FinanceiroPeriodoFiltro.vue'
import FinanceiroSearchBar from '@/components/financeiro/FinanceiroSearchBar.vue'
import FinanceiroEmptyState from '@/components/financeiro/FinanceiroEmptyState.vue'
import FinanceiroStatusBadge from '@/components/financeiro/FinanceiroStatusBadge.vue'
import FinanceiroPagination from '@/components/financeiro/FinanceiroPagination.vue'
import FinanceiroConfirmDialog from '@/components/financeiro/FinanceiroConfirmDialog.vue'
import MovimentoFormModal from '@/components/financeiro/MovimentoFormModal.vue'
import MovimentosListKpiStrip from '@/components/financeiro/MovimentosListKpiStrip.vue'
import MovimentosMiniChart from '@/components/financeiro/MovimentosMiniChart.vue'
import MovimentosListSummary from '@/components/financeiro/MovimentosListSummary.vue'
import ExportarDropdown from '@/components/financeiro/ExportarDropdown.vue'
import { FINANCEIRO_PAGE_CLASS } from '@/constants/designTokens'
import { ROUTE_PATHS } from '@/constants/routes'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useFinanceiroFiltros } from '@/composables/useFinanceiroFiltros'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { financeiroService } from '@/services/financeiroService'
import { caixaService } from '@/services/caixaService'
import type { MovimentoDirecao, MovimentoFinanceiro, FinanceiroDashboard } from '@/types/negocio/financeiro.types'
import type { CriarMovimentoPayload } from '@/types/negocio/financeiro.types'
import type { ExportFormato } from '@/types/negocio/caixa.types'
import { agruparEntradasPorDia } from '@/utils/dashboardNegocioUtils'
import {
  agruparPorFormaPagamento,
  calcularTicketMedio,
  CATEGORIAS_ENTRADA_FILTRO,
  FORMAS_PAGAMENTO_FILTRO,
  formatSignedCurrency,
  matchesCategoriaEntrada,
  matchesFormaPagamento,
  resolveCategoriaEntrada,
  resolveFormaPagamento,
  resolveTituloMovimento,
  sortMovimentos,
  statusLabel,
  type MovimentoSortOption,
} from '@/utils/financeiroMovimentosList'
import {
  calcularVariacaoPercentual,
  createEmptyFinanceiroDashboard,
  getPreviousPeriodFilter,
} from '@/utils/financeiroDashboard'
import { formatCurrency, formatDate } from '@/utils/formatters'

const props = withDefaults(
  defineProps<{
    direcao: MovimentoDirecao
    embedded?: boolean
  }>(),
  { embedded: false },
)

const route = useRoute()
const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const { possuiPermissao } = useNegocioContext()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const {
  periodPreset,
  inicioCustom,
  fimCustom,
  busca,
  pagina,
  tamanhoPagina,
  apiFiltro,
  resetPagina,
} = useFinanceiroFiltros('mes')

const statusFilter = ref((route.query.status as string) || '')
const formaPagamentoFilter = ref('Todos')
const categoriaFilter = ref('Todas')
const sortOption = ref<MovimentoSortOption>('recente')

const itens = ref<MovimentoFinanceiro[]>([])
const total = ref(0)
const loading = ref(false)
const kpiLoading = ref(false)
const actionLoading = ref(false)
const formOpen = ref(false)
const confirmOpen = ref(false)
const movimentoAcao = ref<MovimentoFinanceiro | null>(null)

const dashboardHoje = ref<FinanceiroDashboard>(createEmptyFinanceiroDashboard())
const dashboardPeriodo = ref<FinanceiroDashboard>(createEmptyFinanceiroDashboard())
const dashboardAnterior = ref<FinanceiroDashboard | null>(null)
const chartEntradas = ref<MovimentoFinanceiro[]>([])

const isEntrada = computed(() => props.direcao === 'entrada')
const podeGerenciar = computed(() => possuiPermissao('CaixaGerenciar'))

const titulo = computed(() => (isEntrada.value ? 'Entradas' : 'Saídas'))
const subtitulo = computed(() =>
  isEntrada.value
    ? 'Recebimentos, vendas e outras receitas.'
    : 'Despesas, fornecedores e demais gastos.',
)

const statusOptions = computed(() =>
  isEntrada.value
    ? [
        { value: '', label: 'Todos os status' },
        { value: 'recebido', label: 'Recebido' },
        { value: 'pendente', label: 'Pendente' },
        { value: 'vencido', label: 'Vencido' },
        { value: 'estornado', label: 'Estornado' },
        { value: 'cancelado', label: 'Cancelado' },
      ]
    : [
        { value: '', label: 'Todos os status' },
        { value: 'pago', label: 'Pago' },
        { value: 'pendente', label: 'Pendente' },
        { value: 'vencido', label: 'Vencido' },
        { value: 'estornado', label: 'Estornado' },
        { value: 'cancelado', label: 'Cancelado' },
      ],
)

const totalPaginas = computed(() => Math.max(1, Math.ceil(total.value / tamanhoPagina.value)))

const itensFiltrados = computed(() => {
  let lista = [...itens.value]
  if (formaPagamentoFilter.value !== 'Todos') {
    lista = lista.filter((item) => matchesFormaPagamento(item, formaPagamentoFilter.value))
  }
  if (isEntrada.value && categoriaFilter.value !== 'Todas') {
    lista = lista.filter((item) => matchesCategoriaEntrada(item, categoriaFilter.value))
  }
  return sortMovimentos(lista, sortOption.value)
})

const totalPaginaValor = computed(() =>
  itensFiltrados.value.reduce((acc, item) => acc + item.valor, 0),
)

const formasResumo = computed(() => agruparPorFormaPagamento(itensFiltrados.value))

const periodoTrend = computed(() =>
  dashboardAnterior.value
    ? calcularVariacaoPercentual(
        isEntrada.value ? dashboardPeriodo.value.totalEntradas : dashboardPeriodo.value.totalSaidas,
        isEntrada.value ? dashboardAnterior.value.totalEntradas : dashboardAnterior.value.totalSaidas,
      )
    : null,
)

const kpiRecebidoHoje = computed(() =>
  formatCurrency(isEntrada.value ? dashboardHoje.value.totalEntradas : dashboardHoje.value.totalSaidas),
)

const kpiRecebidoPeriodo = computed(() =>
  formatCurrency(
    isEntrada.value ? dashboardPeriodo.value.totalEntradas : dashboardPeriodo.value.totalSaidas,
  ),
)

const kpiTicketMedio = computed(() => {
  const valor = isEntrada.value ? dashboardPeriodo.value.totalEntradas : dashboardPeriodo.value.totalSaidas
  return formatCurrency(calcularTicketMedio(valor, total.value))
})

const chartDados = computed(() =>
  isEntrada.value ? agruparEntradasPorDia(chartEntradas.value, 30) : [],
)

const ultimaAtualizacao = computed(() =>
  new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
)

function hojeFiltro() {
  const hoje = new Date().toISOString().slice(0, 10)
  return {
    inicio: new Date(`${hoje}T00:00:00`).toISOString(),
    fim: new Date(`${hoje}T23:59:59`).toISOString(),
  }
}

function ultimos30DiasFiltro() {
  const fim = new Date()
  const inicio = new Date()
  inicio.setDate(inicio.getDate() - 29)
  return {
    inicio: new Date(`${inicio.toISOString().slice(0, 10)}T00:00:00`).toISOString(),
    fim: new Date(`${fim.toISOString().slice(0, 10)}T23:59:59`).toISOString(),
  }
}

async function loadKpis() {
  if (!estabelecimentoId.value) return
  kpiLoading.value = true
  try {
    const periodoFiltro = {
      inicio: apiFiltro.value.inicio,
      fim: apiFiltro.value.fim,
    }
    const anteriorFiltro = getPreviousPeriodFilter(periodoFiltro)
    const requests: [
      Promise<FinanceiroDashboard>,
      Promise<FinanceiroDashboard>,
      Promise<FinanceiroDashboard> | Promise<null>,
    ] = [
      financeiroService.obterDashboard(estabelecimentoId.value, hojeFiltro()),
      financeiroService.obterDashboard(estabelecimentoId.value, periodoFiltro),
      anteriorFiltro
        ? financeiroService.obterDashboard(estabelecimentoId.value, anteriorFiltro)
        : Promise.resolve(null),
    ]
    const [hoje, periodo, anterior] = await Promise.all(requests)
    dashboardHoje.value = hoje
    dashboardPeriodo.value = periodo
    dashboardAnterior.value = anterior

    if (isEntrada.value) {
      const chart = await financeiroService.listarEntradas(estabelecimentoId.value, {
        ...ultimos30DiasFiltro(),
        tamanhoPagina: 500,
        pagina: 1,
      })
      chartEntradas.value = chart.itens
    }
  } catch {
    dashboardHoje.value = createEmptyFinanceiroDashboard()
    dashboardPeriodo.value = createEmptyFinanceiroDashboard()
    dashboardAnterior.value = null
    chartEntradas.value = []
  } finally {
    kpiLoading.value = false
  }
}

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  try {
    const filtro = {
      ...apiFiltro.value,
      status: statusFilter.value || undefined,
      q: busca.value.trim() || undefined,
    }
    const resultado = isEntrada.value
      ? await financeiroService.listarEntradas(estabelecimentoId.value, filtro)
      : await financeiroService.listarSaidas(estabelecimentoId.value, filtro)
    itens.value = resultado.itens
    total.value = resultado.total
    await loadKpis()
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    loading.value = false
  }
}

function onPresetChange() {
  resetPagina()
  if (periodPreset.value !== 'custom') void load()
}

function onSearch(term: string) {
  busca.value = term
  resetPagina()
  void load()
}

function onStatusChange() {
  resetPagina()
  void load()
}

async function onCriar(payload: CriarMovimentoPayload) {
  if (!estabelecimentoId.value) return
  actionLoading.value = true
  try {
    if (isEntrada.value) {
      await financeiroService.criarEntrada(estabelecimentoId.value, payload)
      notifications.push('success', 'Entrada registrada.')
    } else {
      await financeiroService.criarSaida(estabelecimentoId.value, payload)
      notifications.push('success', 'Saída registrada.')
    }
    formOpen.value = false
    await load()
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    actionLoading.value = false
  }
}

function abrirConfirmacao(item: MovimentoFinanceiro) {
  movimentoAcao.value = item
  confirmOpen.value = true
}

async function confirmarMarcacao() {
  if (!estabelecimentoId.value || !movimentoAcao.value) return
  actionLoading.value = true
  try {
    if (isEntrada.value) {
      await financeiroService.marcarEntradaRecebida(
        estabelecimentoId.value,
        movimentoAcao.value.id,
      )
      notifications.push('success', 'Marcado como recebido.')
    } else {
      await financeiroService.marcarSaidaPaga(estabelecimentoId.value, movimentoAcao.value.id)
      notifications.push('success', 'Marcado como pago.')
    }
    confirmOpen.value = false
    await load()
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    actionLoading.value = false
  }
}

async function exportar(formato: ExportFormato) {
  if (!estabelecimentoId.value) return
  try {
    const response = await caixaService.exportarRelatorio(
      estabelecimentoId.value,
      formato,
      apiFiltro.value,
    )
    const ext = formato === 'xlsx' ? 'xlsx' : formato === 'pdf' ? 'pdf' : 'csv'
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.download = `${isEntrada.value ? 'entradas' : 'saidas'}-financeiro.${ext}`
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (err) {
    notifications.push('error', resolveError(err))
  }
}

function imprimir() {
  window.print()
}

function formatDataRelativa(data: string): string {
  const hoje = new Date().toISOString().slice(0, 10)
  const key = data.slice(0, 10)
  if (key === hoje) return 'Hoje'
  const ontem = new Date()
  ontem.setDate(ontem.getDate() - 1)
  if (key === ontem.toISOString().slice(0, 10)) return 'Ontem'
  return formatDate(data)
}

watch(ready, (isReady) => {
  if (isReady) void load()
}, { immediate: true })

watch(pagina, () => void load())

watch(
  () => route.query.status,
  (status) => {
    const next = (status as string) || ''
    if (statusFilter.value === next) return
    statusFilter.value = next
    resetPagina()
    void load()
  },
)
</script>

<template>
  <div :class="embedded ? 'financeiro-movimentos-embedded' : FINANCEIRO_PAGE_CLASS">
    <FinanceiroPageHeader
      v-if="!embedded"
      :title="titulo"
      :subtitle="subtitulo"
      :back-to="ROUTE_PATHS.FINANCEIRO"
    >
      <template v-if="podeGerenciar" #actions>
        <ExportarDropdown class="financeiro-no-print" @export="exportar" @print="imprimir" />
        <BaseButton @click="formOpen = true">
          {{ isEntrada ? '+ Registrar entrada' : '+ Registrar saída' }}
        </BaseButton>
      </template>
    </FinanceiroPageHeader>

    <MovimentosListKpiStrip
      :class="embedded ? 'mt-0' : 'mt-6'"
      :recebido-hoje="kpiRecebidoHoje"
      :recebido-periodo="kpiRecebidoPeriodo"
      :total-registros="String(total)"
      :ticket-medio="kpiTicketMedio"
      :periodo-trend="periodoTrend"
      :loading="kpiLoading || loading"
    />

    <section class="financeiro-movimentos-toolbar financeiro-no-print">
      <FinanceiroSearchBar
        v-model="busca"
        class="financeiro-movimentos-toolbar__search"
        :placeholder="isEntrada ? 'Buscar cliente, serviço ou descrição...' : 'Buscar fornecedor, categoria ou descrição...'"
        @search="onSearch"
      />

      <div class="financeiro-movimentos-toolbar__row">
        <FinanceiroQuickFilters
          v-model="periodPreset"
          @update:model-value="onPresetChange"
        />
        <FinanceiroPeriodoFiltro
          v-if="periodPreset === 'custom'"
          v-model:inicio="inicioCustom"
          v-model:fim="fimCustom"
          @aplicar="load"
        />
      </div>

      <div class="financeiro-movimentos-toolbar__filters">
        <select v-model="statusFilter" class="financeiro-movimentos-select" @change="onStatusChange">
          <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <select v-model="formaPagamentoFilter" class="financeiro-movimentos-select">
          <option v-for="forma in FORMAS_PAGAMENTO_FILTRO" :key="forma" :value="forma">{{ forma === 'Todos' ? 'Pagamento' : forma }}</option>
        </select>
        <select
          v-if="isEntrada"
          v-model="categoriaFilter"
          class="financeiro-movimentos-select"
        >
          <option v-for="cat in CATEGORIAS_ENTRADA_FILTRO" :key="cat" :value="cat">{{ cat === 'Todas' ? 'Categoria' : cat }}</option>
        </select>
        <select v-model="sortOption" class="financeiro-movimentos-select">
          <option value="recente">Mais recente</option>
          <option value="antigo">Mais antigo</option>
          <option value="maior_valor">Maior valor</option>
          <option value="menor_valor">Menor valor</option>
        </select>
      </div>
    </section>

    <ContentAlert v-if="contextError" variant="error" :message="contextError" />

    <template v-if="!contextError && !contextLoading && !loading">
      <FinanceiroEmptyState
        v-if="itensFiltrados.length === 0"
        :title="isEntrada ? 'Nenhuma entrada encontrada' : 'Nenhuma saída encontrada'"
        :description="isEntrada ? 'Ajuste os filtros ou registre recebimentos e outras receitas.' : 'Ajuste os filtros ou registre despesas e gastos.'"
      >
        <template v-if="podeGerenciar" #action>
          <BaseButton @click="formOpen = true">
            {{ isEntrada ? 'Registrar entrada' : 'Registrar saída' }}
          </BaseButton>
        </template>
      </FinanceiroEmptyState>

      <template v-else>
        <FinanceiroPagination
          :pagina="pagina"
          :total-paginas="totalPaginas"
          :total="total"
          :tamanho-pagina="tamanhoPagina"
          class="mt-6"
          @anterior="pagina = Math.max(1, pagina - 1)"
          @proxima="pagina = Math.min(totalPaginas, pagina + 1)"
          @ir-para="pagina = $event"
        />

        <div class="financeiro-movimentos-layout mt-4">
          <div class="financeiro-movimentos-layout__main">
            <div class="financeiro-table-wrap hidden md:block">
              <table class="financeiro-table financeiro-table--rich">
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Pagamento</th>
                    <th v-if="isEntrada">Categoria</th>
                    <th>Data</th>
                    <th>Status</th>
                    <th class="text-right">Valor</th>
                    <th v-if="podeGerenciar" />
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in itensFiltrados"
                    :key="item.id"
                    class="financeiro-table__row--interactive"
                  >
                    <td>
                      <div class="financeiro-movimento-cell">
                        <span
                          class="financeiro-movimento-cell__icon"
                          :class="isEntrada ? 'financeiro-movimento-cell__icon--entrada' : 'financeiro-movimento-cell__icon--saida'"
                          aria-hidden="true"
                        />
                        <div class="min-w-0">
                          <p class="financeiro-movimento-cell__title">{{ resolveTituloMovimento(item) }}</p>
                          <p v-if="isEntrada" class="financeiro-movimento-cell__meta">
                            {{ resolveCategoriaEntrada(item) }}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="financeiro-pagamento-pill">{{ resolveFormaPagamento(item) }}</span>
                    </td>
                    <td v-if="isEntrada">
                      <span class="text-glow-text-subtle">{{ resolveCategoriaEntrada(item) }}</span>
                    </td>
                    <td class="whitespace-nowrap text-glow-text-subtle">{{ formatDataRelativa(item.data) }}</td>
                    <td>
                      <FinanceiroStatusBadge :status="statusLabel(item.status, isEntrada)" />
                    </td>
                    <td class="text-right">
                      <span
                        class="financeiro-valor-assinado"
                        :class="isEntrada ? 'financeiro-valor-assinado--entrada' : 'financeiro-valor-assinado--saida'"
                      >
                        {{ formatSignedCurrency(item.valor, direcao) }}
                      </span>
                    </td>
                    <td v-if="podeGerenciar" class="text-right">
                      <BaseButton
                        v-if="item.acoes.podeMarcarRecebido || item.acoes.podeMarcarPago"
                        variant="secondary"
                        size="sm"
                        @click="abrirConfirmacao(item)"
                      >
                        {{ isEntrada ? 'Receber' : 'Pagar' }}
                      </BaseButton>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="space-y-3 md:hidden">
              <article
                v-for="item in itensFiltrados"
                :key="item.id"
                class="financeiro-movimento-card"
              >
                <div class="financeiro-movimento-card__head">
                  <div class="financeiro-movimento-cell">
                    <span
                      class="financeiro-movimento-cell__icon"
                      :class="isEntrada ? 'financeiro-movimento-cell__icon--entrada' : 'financeiro-movimento-cell__icon--saida'"
                    />
                    <div>
                      <p class="financeiro-movimento-cell__title">{{ resolveTituloMovimento(item) }}</p>
                      <p class="financeiro-movimento-cell__meta">{{ formatDataRelativa(item.data) }} · {{ resolveFormaPagamento(item) }}</p>
                    </div>
                  </div>
                  <span
                    class="financeiro-valor-assinado"
                    :class="isEntrada ? 'financeiro-valor-assinado--entrada' : 'financeiro-valor-assinado--saida'"
                  >
                    {{ formatSignedCurrency(item.valor, direcao) }}
                  </span>
                </div>
                <div class="financeiro-movimento-card__foot">
                  <FinanceiroStatusBadge :status="statusLabel(item.status, isEntrada)" />
                  <BaseButton
                    v-if="podeGerenciar && (item.acoes.podeMarcarRecebido || item.acoes.podeMarcarPago)"
                    variant="secondary"
                    size="sm"
                    @click="abrirConfirmacao(item)"
                  >
                    {{ isEntrada ? 'Receber' : 'Pagar' }}
                  </BaseButton>
                </div>
              </article>
            </div>

            <MovimentosMiniChart
              v-if="isEntrada"
              class="mt-6"
              :dados="chartDados"
              :empty="chartDados.every((d) => d.value === 0)"
            />
          </div>

          <MovimentosListSummary
            :total-valor="formatCurrency(totalPaginaValor)"
            :formas-pagamento="formasResumo"
            :ultima-atualizacao="ultimaAtualizacao"
            :is-entrada="isEntrada"
          />
        </div>

        <FinanceiroPagination
          v-if="totalPaginas > 1"
          :pagina="pagina"
          :total-paginas="totalPaginas"
          :total="total"
          :tamanho-pagina="tamanhoPagina"
          class="mt-6"
          @anterior="pagina = Math.max(1, pagina - 1)"
          @proxima="pagina = Math.min(totalPaginas, pagina + 1)"
          @ir-para="pagina = $event"
        />
      </template>
    </template>

    <MovimentoFormModal
      v-model="formOpen"
      :direcao="direcao"
      :loading="actionLoading"
      @confirm="onCriar"
    />

    <FinanceiroConfirmDialog
      v-model="confirmOpen"
      :title="isEntrada ? 'Marcar como recebido?' : 'Marcar como pago?'"
      :message="movimentoAcao ? `${movimentoAcao.descricao} — ${formatCurrency(movimentoAcao.valor)}` : ''"
      :confirm-label="isEntrada ? 'Marcar recebido' : 'Marcar pago'"
      :loading="actionLoading"
      @confirm="confirmarMarcacao"
    />
  </div>
</template>

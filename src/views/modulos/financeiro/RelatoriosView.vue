<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import ContentAlert from '@/components/feedback/ContentAlert.vue'
import FinanceiroPageHeader from '@/components/financeiro/FinanceiroPageHeader.vue'
import FinanceiroQuickFilters from '@/components/financeiro/FinanceiroQuickFilters.vue'
import FinanceiroPeriodoFiltro from '@/components/financeiro/FinanceiroPeriodoFiltro.vue'
import FinanceiroKpiCard from '@/components/financeiro/FinanceiroKpiCard.vue'
import FinanceiroEmptyState from '@/components/financeiro/FinanceiroEmptyState.vue'
import ExportarDropdown from '@/components/financeiro/ExportarDropdown.vue'
import ConciliacaoView from '@/views/modulos/financeiro/ConciliacaoView.vue'
import RedeView from '@/views/modulos/financeiro/RedeView.vue'
import { FINANCEIRO_PAGE_CLASS } from '@/constants/designTokens'
import { ROUTE_PATHS } from '@/constants/routes'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useFinanceiroFiltros } from '@/composables/useFinanceiroFiltros'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { caixaService } from '@/services/caixaService'
import { financeiroService } from '@/services/financeiroService'
import type { ExportFormato, RelatorioAnalitico } from '@/types/negocio/caixa.types'
import type { FinanceiroDashboard } from '@/types/negocio/financeiro.types'
import { formatCurrency } from '@/utils/formatters'

const route = useRoute()
const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const { periodPreset, inicioCustom, fimCustom, apiFiltro, resetPagina } = useFinanceiroFiltros('mes')

const dashboard = ref<FinanceiroDashboard | null>(null)
const analitico = ref<RelatorioAnalitico | null>(null)
const loading = ref(false)
const detalhesAberto = ref(false)
const avancadoAberto = ref(route.query.secao === 'conciliacao' || route.query.secao === 'rede')

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  try {
    const filtro = { inicio: apiFiltro.value.inicio, fim: apiFiltro.value.fim }
    const [dash, resumo] = await Promise.all([
      financeiroService.obterDashboard(estabelecimentoId.value, filtro),
      caixaService.obterRelatorioAnalitico(estabelecimentoId.value, apiFiltro.value),
    ])
    dashboard.value = dash
    analitico.value = resumo
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
    link.download = `relatorio-financeiro.${ext}`
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (err) {
    notifications.push('error', resolveError(err))
  }
}

function imprimir() {
  window.print()
}

watch(ready, (isReady) => { if (isReady) void load() }, { immediate: true })
</script>

<template>
  <div :class="FINANCEIRO_PAGE_CLASS">
    <FinanceiroPageHeader
      title="Relatórios"
      subtitle="Resumo do período e exportação."
      :back-to="ROUTE_PATHS.FINANCEIRO"
    >
      <template #filters>
        <FinanceiroQuickFilters v-model="periodPreset" @aplicar="onPresetChange" />
        <FinanceiroPeriodoFiltro
          v-if="periodPreset === 'custom'"
          v-model:inicio="inicioCustom"
          v-model:fim="fimCustom"
          @aplicar="load"
        />
      </template>
      <template #actions>
        <ExportarDropdown class="financeiro-no-print" @export="exportar" @print="imprimir" />
      </template>
    </FinanceiroPageHeader>

    <ContentAlert v-if="contextError" variant="error" :message="contextError" />
    <LoadingSpinner v-else-if="contextLoading || loading" />

    <template v-else-if="dashboard">
      <div class="financeiro-kpi-grid">
        <FinanceiroKpiCard label="Entradas" :value="formatCurrency(dashboard.totalEntradas)" variant="positive" />
        <FinanceiroKpiCard label="Saídas" :value="formatCurrency(dashboard.totalSaidas)" variant="negative" />
        <FinanceiroKpiCard label="Lucro líquido" :value="formatCurrency(dashboard.lucroLiquido)" />
      </div>

      <details v-if="analitico" class="financeiro-card mt-6" :open="detalhesAberto" @toggle="detalhesAberto = ($event.target as HTMLDetailsElement).open">
        <summary class="cursor-pointer px-5 py-4 font-satoshi font-bold text-glow-text">
          Detalhes
        </summary>
        <div class="space-y-6 border-t border-glow-border-soft px-5 py-4">
          <div>
            <h3 class="mb-3 font-urbanist text-sm font-semibold text-glow-text">Por profissional</h3>
            <FinanceiroEmptyState
              v-if="analitico.porProfissional.length === 0"
              title="Sem dados"
              description="Não há faturamento por profissional no período."
            />
            <div v-else class="financeiro-table-wrap hidden md:block">
              <table class="financeiro-table">
                <thead>
                  <tr>
                    <th>Profissional</th>
                    <th>Atendimentos</th>
                    <th class="text-right">Faturamento</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in analitico.porProfissional" :key="p.profissionalId">
                    <td>{{ p.nomePublico }}</td>
                    <td>{{ p.quantidade }}</td>
                    <td class="text-right font-medium">{{ formatCurrency(p.faturamento) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="space-y-3 md:hidden">
              <div
                v-for="p in analitico.porProfissional"
                :key="p.profissionalId"
                class="financeiro-table__row-card"
              >
                <p class="font-urbanist font-medium text-glow-text">{{ p.nomePublico }}</p>
                <div class="financeiro-table__row-meta">
                  <div class="financeiro-table__row-meta-item">
                    <span class="financeiro-table__row-meta-label">Atendimentos</span>
                    <span class="financeiro-table__row-meta-value">{{ p.quantidade }}</span>
                  </div>
                  <div class="financeiro-table__row-meta-item">
                    <span class="financeiro-table__row-meta-label">Faturamento</span>
                    <span class="font-satoshi font-bold text-glow-text">
                      {{ formatCurrency(p.faturamento) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 class="mb-3 font-urbanist text-sm font-semibold text-glow-text">Por forma de pagamento</h3>
            <FinanceiroEmptyState
              v-if="analitico.porFormaPagamento.length === 0"
              title="Sem dados"
              description="Não há recebimentos no período."
            />
            <div v-else class="financeiro-table-wrap hidden md:block">
              <table class="financeiro-table">
                <thead>
                  <tr>
                    <th>Forma</th>
                    <th>Quantidade</th>
                    <th class="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="f in analitico.porFormaPagamento" :key="f.formaPagamento">
                    <td>{{ f.formaPagamento }}</td>
                    <td>{{ f.quantidade }}</td>
                    <td class="text-right font-medium">{{ formatCurrency(f.total) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="space-y-3 md:hidden">
              <div
                v-for="f in analitico.porFormaPagamento"
                :key="f.formaPagamento"
                class="financeiro-table__row-card"
              >
                <p class="font-urbanist font-medium text-glow-text">{{ f.formaPagamento }}</p>
                <div class="financeiro-table__row-meta">
                  <div class="financeiro-table__row-meta-item">
                    <span class="financeiro-table__row-meta-label">Quantidade</span>
                    <span class="financeiro-table__row-meta-value">{{ f.quantidade }}</span>
                  </div>
                  <div class="financeiro-table__row-meta-item">
                    <span class="financeiro-table__row-meta-label">Total</span>
                    <span class="font-satoshi font-bold text-glow-text">
                      {{ formatCurrency(f.total) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </details>

      <details class="financeiro-card mt-6" :open="avancadoAberto" @toggle="avancadoAberto = ($event.target as HTMLDetailsElement).open">
        <summary class="cursor-pointer px-5 py-4 font-satoshi font-bold text-glow-text">
          Avançado
        </summary>
        <div class="space-y-8 border-t border-glow-border-soft p-4">
          <section>
            <h3 class="mb-4 font-satoshi text-sm font-bold text-glow-text">Conciliação</h3>
            <ConciliacaoView embedded />
          </section>
          <section>
            <h3 class="mb-4 font-satoshi text-sm font-bold text-glow-text">Painel da rede</h3>
            <RedeView embedded />
          </section>
        </div>
      </details>
    </template>
  </div>
</template>

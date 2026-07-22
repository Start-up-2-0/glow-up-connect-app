<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
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
import { FINANCEIRO_PAGE_CLASS } from '@/constants/designTokens'
import { ROUTE_PATHS } from '@/constants/routes'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useFinanceiroFiltros } from '@/composables/useFinanceiroFiltros'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { financeiroService } from '@/services/financeiroService'
import type { MovimentoDirecao, MovimentoFinanceiro } from '@/types/negocio/financeiro.types'
import type { CriarMovimentoPayload } from '@/types/negocio/financeiro.types'
import { formatCurrency, formatDate } from '@/utils/formatters'

const props = defineProps<{
  direcao: MovimentoDirecao
}>()

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
const itens = ref<MovimentoFinanceiro[]>([])
const total = ref(0)
const loading = ref(false)
const actionLoading = ref(false)
const formOpen = ref(false)
const confirmOpen = ref(false)
const movimentoAcao = ref<MovimentoFinanceiro | null>(null)

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
        { value: '', label: 'Todas' },
        { value: 'recebido', label: 'Recebidas' },
        { value: 'pendente', label: 'A receber' },
        { value: 'vencido', label: 'Vencidas' },
      ]
    : [
        { value: '', label: 'Todas' },
        { value: 'pago', label: 'Pagas' },
        { value: 'pendente', label: 'A pagar' },
        { value: 'vencido', label: 'Vencidas' },
      ],
)

const totalPaginas = computed(() => Math.max(1, Math.ceil(total.value / tamanhoPagina.value)))

function rotuloStatus(status: string): string {
  const map: Record<string, string> = {
    recebido: 'Recebido',
    pago: 'Pago',
    pendente: isEntrada.value ? 'A receber' : 'A pagar',
    vencido: 'Vencido',
    estornado: 'Estornado',
    cancelado: 'Cancelado',
  }
  return map[status] ?? status
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

watch(ready, (isReady) => {
  if (isReady) void load()
}, { immediate: true })

watch(pagina, () => void load())
</script>

<template>
  <div :class="FINANCEIRO_PAGE_CLASS">
    <FinanceiroPageHeader :title="titulo" :subtitle="subtitulo" :back-to="ROUTE_PATHS.FINANCEIRO">
      <template v-if="podeGerenciar" #actions>
        <BaseButton @click="formOpen = true">
          {{ isEntrada ? '+ Nova entrada' : '+ Nova saída' }}
        </BaseButton>
      </template>
      <template #filters>
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
        <div class="flex flex-wrap items-center gap-3">
          <select
            v-model="statusFilter"
            class="h-10 rounded-lg border border-glow-border-soft bg-glow-canvas px-3 font-urbanist text-sm"
            @change="onStatusChange"
          >
            <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <FinanceiroSearchBar class="min-w-[12rem] flex-1" @search="onSearch" />
        </div>
      </template>
    </FinanceiroPageHeader>

    <ContentAlert v-if="contextError" variant="error" :message="contextError" />
    <LoadingSpinner v-else-if="contextLoading || loading" />

    <template v-else>
      <FinanceiroEmptyState
        v-if="itens.length === 0"
        :title="isEntrada ? 'Nenhuma entrada' : 'Nenhuma saída'"
        :description="isEntrada ? 'Registre recebimentos e outras receitas.' : 'Registre despesas e gastos.'"
      >
        <template v-if="podeGerenciar" #action>
          <BaseButton @click="formOpen = true">
            {{ isEntrada ? 'Nova entrada' : 'Nova saída' }}
          </BaseButton>
        </template>
      </FinanceiroEmptyState>

      <div v-else class="financeiro-table-wrap hidden md:block">
        <table class="financeiro-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Status</th>
              <th class="text-right">Valor</th>
              <th v-if="podeGerenciar" />
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in itens" :key="item.id">
              <td>{{ formatDate(item.data) }}</td>
              <td>{{ item.descricao }}</td>
              <td>
                <FinanceiroStatusBadge :status="rotuloStatus(item.status)" />
              </td>
              <td class="text-right font-medium">{{ formatCurrency(item.valor) }}</td>
              <td v-if="podeGerenciar" class="text-right">
                <BaseButton
                  v-if="item.acoes.podeMarcarRecebido || item.acoes.podeMarcarPago"
                  variant="secondary"
                  size="sm"
                  @click="abrirConfirmacao(item)"
                >
                  {{ isEntrada ? 'Marcar recebido' : 'Marcar pago' }}
                </BaseButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="space-y-3 md:hidden">
        <div
          v-for="item in itens"
          :key="item.id"
          class="financeiro-table__row-card"
        >
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="font-urbanist font-medium text-glow-text">{{ item.descricao }}</p>
              <p class="text-sm text-glow-text-subtle">{{ formatDate(item.data) }}</p>
            </div>
            <p class="font-satoshi font-bold text-glow-text">{{ formatCurrency(item.valor) }}</p>
          </div>
          <div class="mt-2 flex items-center justify-between">
            <FinanceiroStatusBadge :status="rotuloStatus(item.status)" />
            <BaseButton
              v-if="podeGerenciar && (item.acoes.podeMarcarRecebido || item.acoes.podeMarcarPago)"
              variant="secondary"
              size="sm"
              @click="abrirConfirmacao(item)"
            >
              {{ isEntrada ? 'Recebido' : 'Pago' }}
            </BaseButton>
          </div>
        </div>
      </div>

      <FinanceiroPagination
        v-if="totalPaginas > 1"
        :pagina="pagina"
        :total-paginas="totalPaginas"
        :total="total"
        class="mt-6"
        @anterior="pagina = Math.max(1, pagina - 1)"
        @proxima="pagina = Math.min(totalPaginas, pagina + 1)"
      />
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

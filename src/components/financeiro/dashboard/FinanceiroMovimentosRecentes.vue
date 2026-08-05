<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import FinanceiroSearchBar from '@/components/financeiro/FinanceiroSearchBar.vue'
import FinanceiroEmptyState from '@/components/financeiro/FinanceiroEmptyState.vue'
import FinanceiroStatusBadge from '@/components/financeiro/FinanceiroStatusBadge.vue'
import FinanceiroPagination from '@/components/financeiro/FinanceiroPagination.vue'
import FinanceiroConfirmDialog from '@/components/financeiro/FinanceiroConfirmDialog.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { financeiroService } from '@/services/financeiroService'
import type { MovimentoDirecao, MovimentoFinanceiro } from '@/types/negocio/financeiro.types'
import {
  formatSignedCurrency,
  resolveFormaPagamento,
  resolveTituloMovimento,
  statusLabel,
} from '@/utils/financeiroMovimentosList'
import { formatCurrency, formatDate } from '@/utils/formatters'

const props = withDefaults(
  defineProps<{
    direcao: MovimentoDirecao
    inicio?: string
    fim?: string
    status?: string
  }>(),
  {
    inicio: undefined,
    fim: undefined,
    status: '',
  },
)

const emit = defineEmits<{
  'update:direcao': [value: MovimentoDirecao]
  changed: []
}>()

const { estabelecimentoId, ready } = useEstabelecimentoView()
const { possuiPermissao } = useNegocioContext()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const itens = ref<MovimentoFinanceiro[]>([])
const total = ref(0)
const loading = ref(false)
const actionLoading = ref(false)
const busca = ref('')
const pagina = ref(1)
const tamanhoPagina = 8
const confirmOpen = ref(false)
const movimentoAcao = ref<MovimentoFinanceiro | null>(null)

const isEntrada = computed(() => props.direcao === 'entrada')
const podeGerenciar = computed(() => possuiPermissao('CaixaGerenciar'))
const totalPaginas = computed(() => Math.max(1, Math.ceil(total.value / tamanhoPagina)))

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  try {
    const filtro = {
      inicio: props.inicio,
      fim: props.fim,
      status: props.status || undefined,
      q: busca.value.trim() || undefined,
      pagina: pagina.value,
      tamanhoPagina,
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

function onSearch(term: string) {
  busca.value = term
  pagina.value = 1
  void load()
}

function setDirecao(aba: MovimentoDirecao) {
  if (props.direcao === aba) return
  emit('update:direcao', aba)
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
    emit('changed')
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    actionLoading.value = false
  }
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

watch(
  ready,
  (isReady) => {
    if (isReady) void load()
  },
  { immediate: true },
)

watch(
  () => [props.direcao, props.inicio, props.fim, props.status] as const,
  () => {
    pagina.value = 1
    void load()
  },
)

watch(pagina, () => void load())

defineExpose({ reload: load })
</script>

<template>
  <section
    id="financeiro-movimentos"
    class="rounded-2xl border border-glow-border-soft bg-glow-surface p-4 shadow-glow-sm sm:p-5"
  >
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 class="font-satoshi text-base font-bold text-glow-text">Movimentações recentes</h2>
        <p class="mt-0.5 font-urbanist text-xs text-glow-text-subtle">
          Lançamentos do período selecionado no filtro global.
        </p>
      </div>
      <div class="inline-flex rounded-xl border border-glow-border-soft bg-glow-hover-surface p-1" role="tablist">
        <button
          type="button"
          role="tab"
          class="rounded-lg px-3 py-1.5 font-urbanist text-sm transition"
          :class="
            isEntrada
              ? 'bg-glow-surface font-semibold text-glow-text shadow-glow-sm'
              : 'text-glow-text-subtle hover:text-glow-text'
          "
          :aria-selected="isEntrada"
          @click="setDirecao('entrada')"
        >
          Entradas
        </button>
        <button
          type="button"
          role="tab"
          class="rounded-lg px-3 py-1.5 font-urbanist text-sm transition"
          :class="
            !isEntrada
              ? 'bg-glow-surface font-semibold text-glow-text shadow-glow-sm'
              : 'text-glow-text-subtle hover:text-glow-text'
          "
          :aria-selected="!isEntrada"
          @click="setDirecao('saida')"
        >
          Saídas
        </button>
      </div>
    </div>

    <div class="mt-4">
      <FinanceiroSearchBar
        v-model="busca"
        :placeholder="
          isEntrada
            ? 'Buscar cliente, serviço ou descrição...'
            : 'Buscar fornecedor, categoria ou descrição...'
        "
        @search="onSearch"
      />
    </div>

    <div class="mt-4 min-h-[12rem]">
      <FinanceiroEmptyState
        v-if="!loading && itens.length === 0"
        :title="isEntrada ? 'Nenhuma entrada no período' : 'Nenhuma saída no período'"
        description="Altere o período global ou registre um novo lançamento."
      />

      <template v-else-if="itens.length > 0">
        <div class="financeiro-table-wrap hidden md:block">
          <table class="financeiro-table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Pagamento</th>
                <th>Data</th>
                <th>Status</th>
                <th class="text-right">Valor</th>
                <th v-if="podeGerenciar" />
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in itens" :key="item.id">
                <td>
                  <p class="font-urbanist text-sm font-medium text-glow-text">
                    {{ resolveTituloMovimento(item) }}
                  </p>
                </td>
                <td class="text-glow-text-subtle">{{ resolveFormaPagamento(item) }}</td>
                <td class="whitespace-nowrap text-glow-text-subtle">
                  {{ formatDataRelativa(item.data) }}
                </td>
                <td>
                  <FinanceiroStatusBadge :status="statusLabel(item.status, isEntrada)" />
                </td>
                <td class="text-right">
                  <span
                    class="financeiro-valor-assinado"
                    :class="
                      isEntrada
                        ? 'financeiro-valor-assinado--entrada'
                        : 'financeiro-valor-assinado--saida'
                    "
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
            v-for="item in itens"
            :key="item.id"
            class="rounded-xl border border-glow-border-soft px-3.5 py-3"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="truncate font-urbanist text-sm font-medium text-glow-text">
                  {{ resolveTituloMovimento(item) }}
                </p>
                <p class="mt-0.5 font-urbanist text-xs text-glow-text-subtle">
                  {{ formatDataRelativa(item.data) }} · {{ resolveFormaPagamento(item) }}
                </p>
              </div>
              <span
                class="shrink-0 font-satoshi text-sm font-bold"
                :class="isEntrada ? 'text-emerald-600' : 'text-rose-600'"
              >
                {{ formatSignedCurrency(item.valor, direcao) }}
              </span>
            </div>
            <div class="mt-2 flex items-center justify-between gap-2">
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

        <FinanceiroPagination
          v-if="totalPaginas > 1"
          class="mt-4"
          :pagina="pagina"
          :total-paginas="totalPaginas"
          :total="total"
          :tamanho-pagina="tamanhoPagina"
          @anterior="pagina = Math.max(1, pagina - 1)"
          @proxima="pagina = Math.min(totalPaginas, pagina + 1)"
          @ir-para="pagina = $event"
        />
      </template>
    </div>

    <FinanceiroConfirmDialog
      v-model="confirmOpen"
      :title="isEntrada ? 'Marcar como recebido?' : 'Marcar como pago?'"
      :message="
        movimentoAcao ? `${movimentoAcao.descricao} — ${formatCurrency(movimentoAcao.valor)}` : ''
      "
      :confirm-label="isEntrada ? 'Marcar recebido' : 'Marcar pago'"
      :loading="actionLoading"
      @confirm="confirmarMarcacao"
    />
  </section>
</template>

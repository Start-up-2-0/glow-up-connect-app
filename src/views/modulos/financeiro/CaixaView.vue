<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import ContentAlert from '@/components/feedback/ContentAlert.vue'
import FinanceiroPageHeader from '@/components/financeiro/FinanceiroPageHeader.vue'
import FinanceiroQuickFilters from '@/components/financeiro/FinanceiroQuickFilters.vue'
import FinanceiroPeriodoFiltro from '@/components/financeiro/FinanceiroPeriodoFiltro.vue'
import FinanceiroKpiCard from '@/components/financeiro/FinanceiroKpiCard.vue'
import FinanceiroEmptyState from '@/components/financeiro/FinanceiroEmptyState.vue'
import CaixaSessaoBanner from '@/components/financeiro/CaixaSessaoBanner.vue'
import AjusteCaixaModal from '@/components/financeiro/AjusteCaixaModal.vue'
import SessaoCaixaModal from '@/components/financeiro/SessaoCaixaModal.vue'
import EstornarLancamentoModal from '@/components/financeiro/EstornarLancamentoModal.vue'
import { FINANCEIRO_PAGE_CLASS } from '@/constants/designTokens'
import { ROUTE_PATHS } from '@/constants/routes'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useFinanceiroFiltros } from '@/composables/useFinanceiroFiltros'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { caixaService } from '@/services/caixaService'
import type { CaixaResumo, LancamentoCaixa, SessaoCaixa, SubtipoAjusteManual } from '@/types/negocio/caixa.types'
import { formatCurrency, formatDateTime } from '@/utils/formatters'

const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const { possuiPermissao } = useNegocioContext()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()
const router = useRouter()

const { periodPreset, inicioCustom, fimCustom, apiFiltro, resetPagina } = useFinanceiroFiltros('hoje')

const resumo = ref<CaixaResumo | null>(null)
const lancamentos = ref<LancamentoCaixa[]>([])
const sessao = ref<SessaoCaixa | null>(null)
const loading = ref(false)
const actionLoading = ref(false)
const ajusteModalOpen = ref(false)
const sessaoModalOpen = ref(false)
const estornoModalOpen = ref(false)
const ajusteSubtipo = ref<SubtipoAjusteManual>('Reforco')
const lancamentoEstorno = ref<LancamentoCaixa | null>(null)

const podeGerenciar = computed(() => possuiPermissao('CaixaGerenciar'))

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  try {
    const [r, l] = await Promise.all([
      caixaService.obterResumo(estabelecimentoId.value),
      caixaService.listarLancamentos(estabelecimentoId.value, apiFiltro.value),
    ])
    resumo.value = r
    lancamentos.value = l.itens
    try {
      sessao.value = await caixaService.obterSessaoAtual(estabelecimentoId.value)
    } catch {
      sessao.value = null
    }
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

function abrirAjuste(subtipo: SubtipoAjusteManual) {
  ajusteSubtipo.value = subtipo
  ajusteModalOpen.value = true
}

async function confirmarAjuste(payload: { valor: number; descricao: string }) {
  if (!estabelecimentoId.value) return
  actionLoading.value = true
  try {
    await caixaService.registrarAjuste(estabelecimentoId.value, {
      subtipo: ajusteSubtipo.value,
      valor: payload.valor,
      descricao: payload.descricao,
    })
    notifications.push('success', 'Lançamento registrado.')
    ajusteModalOpen.value = false
    await load()
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    actionLoading.value = false
  }
}

function abrirEstorno(l: LancamentoCaixa) {
  lancamentoEstorno.value = l
  estornoModalOpen.value = true
}

async function confirmarEstorno(motivo: string) {
  if (!estabelecimentoId.value || !lancamentoEstorno.value) return
  actionLoading.value = true
  try {
    await caixaService.estornarLancamento(
      estabelecimentoId.value,
      lancamentoEstorno.value.id,
      motivo,
    )
    notifications.push('success', 'Estorno registrado.')
    estornoModalOpen.value = false
    await load()
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    actionLoading.value = false
  }
}

function abrirSessaoModal() {
  sessaoModalOpen.value = true
}

async function confirmarAbrirSessao(saldoInicial: number) {
  if (!estabelecimentoId.value) return
  actionLoading.value = true
  try {
    sessao.value = await caixaService.abrirSessao(estabelecimentoId.value, saldoInicial)
    notifications.push('success', 'Caixa aberto.')
    sessaoModalOpen.value = false
    await load()
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    actionLoading.value = false
  }
}

async function confirmarFecharSessao(saldoInformado: number) {
  if (!estabelecimentoId.value || !sessao.value) return
  actionLoading.value = true
  try {
    await caixaService.fecharSessao(estabelecimentoId.value, sessao.value.id, saldoInformado)
    notifications.push('success', 'Caixa fechado.')
    sessao.value = null
    sessaoModalOpen.value = false
    await load()
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    actionLoading.value = false
  }
}

function irParaAgendamento(agendamentoId: number | null) {
  if (!agendamentoId) return
  void router.push(`${ROUTE_PATHS.AGENDA}/${agendamentoId}`)
}

watch(ready, (isReady) => { if (isReady) void load() }, { immediate: true })
</script>

<template>
  <div :class="FINANCEIRO_PAGE_CLASS">
    <FinanceiroPageHeader
      title="Caixa"
      subtitle="Saldo e movimentações do caixa."
      :back-to="ROUTE_PATHS.FINANCEIRO"
    >
      <template #filters>
        <FinanceiroQuickFilters
          v-model="periodPreset"
          @aplicar="onPresetChange"
        />
        <FinanceiroPeriodoFiltro
          v-if="periodPreset === 'custom'"
          v-model:inicio="inicioCustom"
          v-model:fim="fimCustom"
          @aplicar="load"
        />
      </template>
      <template #actions>
        <button
          v-if="podeGerenciar"
          type="button"
          class="financeiro-btn-outline"
          @click="abrirAjuste('Reforco')"
        >
          Reforço
        </button>
        <button
          v-if="podeGerenciar"
          type="button"
          class="financeiro-btn-outline"
          @click="abrirAjuste('Sangria')"
        >
          Sangria
        </button>
      </template>
    </FinanceiroPageHeader>

    <CaixaSessaoBanner
      :sessao="sessao"
      :pode-gerenciar="podeGerenciar"
      :loading="actionLoading"
      @abrir="abrirSessaoModal"
      @fechar="abrirSessaoModal"
    />

    <ContentAlert v-if="contextError" variant="error">{{ contextError }}</ContentAlert>
    <LoadingSpinner v-if="contextLoading || (loading && !resumo)" />

    <template v-else>
      <div v-if="resumo" class="financeiro-kpi-grid">
        <FinanceiroKpiCard label="Saldo total" :value="formatCurrency(resumo.saldoTotal)" />
        <FinanceiroKpiCard
          label="Disponível"
          :value="formatCurrency(resumo.saldoDisponivel)"
          variant="positive"
        />
        <FinanceiroKpiCard label="Retido" :value="formatCurrency(resumo.saldoRetido)" />
      </div>

      <div class="financeiro-table-wrap">
        <FinanceiroEmptyState
          v-if="lancamentos.length === 0"
          title="Nenhum lançamento"
          description="As movimentações do caixa aparecerão aqui."
        />
        <table v-else class="financeiro-table hidden md:table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Tipo</th>
              <th>Descrição</th>
              <th>Agendamento</th>
              <th class="text-right">Valor</th>
              <th v-if="podeGerenciar" />
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in lancamentos" :key="l.id">
              <td class="text-glow-text-subtle">{{ formatDateTime(l.criadoEm) }}</td>
              <td>{{ l.tipo }}</td>
              <td>{{ l.descricao }}</td>
              <td>
                <button
                  v-if="l.agendamentoId"
                  type="button"
                  class="text-glow-gold underline"
                  @click="irParaAgendamento(l.agendamentoId)"
                >
                  #{{ l.agendamentoId }}
                </button>
                <span v-else class="text-glow-text-subtle">—</span>
              </td>
              <td class="text-right font-medium">{{ formatCurrency(l.valor) }}</td>
              <td v-if="podeGerenciar" class="text-right">
                <button
                  v-if="l.tipo !== 'Estorno'"
                  type="button"
                  class="financeiro-btn-outline"
                  :disabled="actionLoading"
                  @click="abrirEstorno(l)"
                >
                  Estornar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="space-y-3 p-3 md:hidden">
          <div
            v-for="l in lancamentos"
            :key="l.id"
            class="financeiro-table__row-card"
          >
            <p class="text-xs text-glow-text-subtle">{{ formatDateTime(l.criadoEm) }}</p>
            <p class="font-medium text-glow-text">{{ l.descricao }}</p>
            <p class="text-sm text-glow-text-subtle">{{ l.tipo }}</p>
            <p class="mt-1 font-bold">{{ formatCurrency(l.valor) }}</p>
            <button
              v-if="podeGerenciar && l.tipo !== 'Estorno'"
              type="button"
              class="financeiro-btn-outline mt-2"
              @click="abrirEstorno(l)"
            >
              Estornar
            </button>
          </div>
        </div>
      </div>
    </template>

    <AjusteCaixaModal
      v-model="ajusteModalOpen"
      :subtipo="ajusteSubtipo"
      :loading="actionLoading"
      @confirm="confirmarAjuste"
    />
    <SessaoCaixaModal
      v-model="sessaoModalOpen"
      :sessao="sessao"
      :loading="actionLoading"
      @abrir="confirmarAbrirSessao"
      @fechar="confirmarFecharSessao"
    />
    <EstornarLancamentoModal
      v-model="estornoModalOpen"
      :lancamento="lancamentoEstorno"
      :loading="actionLoading"
      @confirm="confirmarEstorno"
    />
  </div>
</template>

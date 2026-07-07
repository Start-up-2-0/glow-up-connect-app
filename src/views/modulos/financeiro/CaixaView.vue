<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import FinanceiroPeriodoFiltro from '@/components/financeiro/FinanceiroPeriodoFiltro.vue'
import AjusteCaixaModal from '@/components/financeiro/AjusteCaixaModal.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { caixaService } from '@/services/caixaService'
import type { CaixaResumo, LancamentoCaixa, SessaoCaixa, SubtipoAjusteManual } from '@/types/negocio/caixa.types'
import { ROUTE_PATHS } from '@/constants/routes'
import { formatCurrency, formatDateTime } from '@/utils/formatters'

const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const { possuiPermissao } = useNegocioContext()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()
const router = useRouter()

const resumo = ref<CaixaResumo | null>(null)
const lancamentos = ref<LancamentoCaixa[]>([])
const sessao = ref<SessaoCaixa | null>(null)
const loading = ref(false)
const actionLoading = ref(false)
const filtroInicio = ref('')
const filtroFim = ref('')
const ajusteModalOpen = ref(false)
const ajusteSubtipo = ref<SubtipoAjusteManual>('Reforco')

const podeGerenciar = computed(() => possuiPermissao('CaixaGerenciar'))

function filtroAtual() {
  const filtro: { inicio?: string; fim?: string } = {}
  if (filtroInicio.value) filtro.inicio = new Date(filtroInicio.value).toISOString()
  if (filtroFim.value) filtro.fim = new Date(filtroFim.value + 'T23:59:59').toISOString()
  return filtro
}

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  try {
    const filtro = filtroAtual()
    const [r, l] = await Promise.all([
      caixaService.obterResumo(estabelecimentoId.value),
      caixaService.listarLancamentos(estabelecimentoId.value, filtro),
    ])
    resumo.value = r
    lancamentos.value = l
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

async function estornar(lancamentoId: number) {
  if (!estabelecimentoId.value) return
  const motivo = window.prompt('Motivo do estorno:')
  if (!motivo?.trim()) return
  actionLoading.value = true
  try {
    await caixaService.estornarLancamento(estabelecimentoId.value, lancamentoId, motivo.trim())
    notifications.push('success', 'Estorno registrado.')
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
  <div class="space-y-4 lg:space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="font-satoshi text-xl font-bold leading-tight text-glow-text lg:text-2xl">Caixa</h1>
        <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">Saldo e movimentações do caixa.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <BaseButton
          v-if="podeGerenciar"
          variant="secondary"
          size="sm"
          @click="abrirAjuste('Reforco')"
        >
          Reforço
        </BaseButton>
        <BaseButton
          v-if="podeGerenciar"
          variant="secondary"
          size="sm"
          @click="abrirAjuste('Sangria')"
        >
          Sangria
        </BaseButton>
        <RouterLink :to="ROUTE_PATHS.FINANCEIRO">
          <BaseButton variant="secondary" size="sm">Visão geral</BaseButton>
        </RouterLink>
      </div>
    </div>

    <div
      v-if="sessao"
      class="rounded-lg border border-green-200 bg-green-50 px-4 py-3 font-urbanist text-sm text-green-800"
    >
      Caixa aberto desde {{ formatDateTime(sessao.abertoEm) }} · saldo inicial
      {{ formatCurrency(sessao.saldoInicial) }}
    </div>

    <FinanceiroPeriodoFiltro
      v-model:inicio="filtroInicio"
      v-model:fim="filtroFim"
      @aplicar="load"
    />

    <p v-if="contextError" class="font-urbanist text-sm text-red-600">{{ contextError }}</p>
    <LoadingSpinner v-if="contextLoading || loading" />

    <template v-else>
      <div v-if="resumo" class="grid gap-4 sm:grid-cols-3">
        <BaseCard title="Saldo total">
          <p class="font-satoshi text-xl font-bold text-glow-text">{{ formatCurrency(resumo.saldoTotal) }}</p>
        </BaseCard>
        <BaseCard title="Disponível">
          <p class="font-satoshi text-xl font-bold text-green-700">{{ formatCurrency(resumo.saldoDisponivel) }}</p>
        </BaseCard>
        <BaseCard title="Retido">
          <p class="font-satoshi text-xl font-bold text-glow-text-subtle">{{ formatCurrency(resumo.saldoRetido) }}</p>
        </BaseCard>
      </div>

      <BaseCard title="Lançamentos">
        <EmptyState
          v-if="lancamentos.length === 0"
          title="Nenhum lançamento"
          description="As movimentações do caixa aparecerão aqui."
        />
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[40rem] font-urbanist text-sm">
            <thead>
              <tr class="border-b border-glow-border-soft text-left text-glow-text-subtle">
                <th class="pb-2 pr-4 font-medium">Data</th>
                <th class="pb-2 pr-4 font-medium">Tipo</th>
                <th class="pb-2 pr-4 font-medium">Descrição</th>
                <th class="pb-2 pr-4 font-medium">Agendamento</th>
                <th class="pb-2 text-right font-medium">Valor</th>
                <th v-if="podeGerenciar" class="pb-2 pl-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="l in lancamentos"
                :key="l.id"
                class="border-b border-glow-border-soft/60"
              >
                <td class="py-2 pr-4 text-glow-text-subtle">{{ formatDateTime(l.criadoEm) }}</td>
                <td class="py-2 pr-4 text-glow-text">{{ l.tipo }}</td>
                <td class="py-2 pr-4 text-glow-text">{{ l.descricao }}</td>
                <td class="py-2 pr-4">
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
                <td class="py-2 text-right font-medium text-glow-text">{{ formatCurrency(l.valor) }}</td>
                <td v-if="podeGerenciar" class="py-2 pl-2 text-right">
                  <BaseButton
                    v-if="l.tipo !== 'Estorno'"
                    variant="secondary"
                    size="sm"
                    :disabled="actionLoading"
                    @click="estornar(l.id)"
                  >
                    Estornar
                  </BaseButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </BaseCard>
    </template>

    <AjusteCaixaModal
      v-model="ajusteModalOpen"
      :subtipo="ajusteSubtipo"
      :loading="actionLoading"
      @confirm="confirmarAjuste"
    />
  </div>
</template>

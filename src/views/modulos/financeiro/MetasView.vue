<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import ContentAlert from '@/components/feedback/ContentAlert.vue'
import SegmentedControl from '@/components/ui/SegmentedControl.vue'
import FinanceiroPageHeader from '@/components/financeiro/FinanceiroPageHeader.vue'
import FinanceiroEmptyState from '@/components/financeiro/FinanceiroEmptyState.vue'
import FinanceiroConfirmDialog from '@/components/financeiro/FinanceiroConfirmDialog.vue'
import MetaFormModal from '@/components/financeiro/MetaFormModal.vue'
import { FINANCEIRO_PAGE_CLASS } from '@/constants/designTokens'
import { ROUTE_PATHS } from '@/constants/routes'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { caixaService } from '@/services/caixaService'
import type {
  Meta,
  CriarMetaPayload,
  AtualizarMetaPayload,
  MetaProgressoProfissional,
} from '@/types/negocio/caixa.types'
import { formatCurrency } from '@/utils/formatters'

const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const { possuiPermissao } = useNegocioContext()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const aba = ref('metas')
const metas = ref<Meta[]>([])
const progresso = ref<MetaProgressoProfissional[]>([])
const loading = ref(false)
const actionLoading = ref(false)
const formModalOpen = ref(false)
const confirmDesativarOpen = ref(false)
const metaEditando = ref<Meta | null>(null)
const metaDesativarId = ref<number | null>(null)

const podeGerenciar = computed(() => possuiPermissao('MetaGerenciar') || possuiPermissao('CaixaGerenciar'))

const abaOptions = computed(() => {
  const opts = [{ value: 'metas', label: 'Metas' }]
  opts.push({ value: 'progresso', label: 'Progresso' })
  return opts
})

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
    if (aba.value === 'metas') await loadMetas()
    else if (aba.value === 'progresso') await loadProgresso()
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    loading.value = false
  }
}

function abrirNova() {
  metaEditando.value = null
  formModalOpen.value = true
}

function abrirEditar(m: Meta) {
  metaEditando.value = m
  formModalOpen.value = true
}

function abrirDesativar(id: number) {
  metaDesativarId.value = id
  confirmDesativarOpen.value = true
}

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
    formModalOpen.value = false
    await loadMetas()
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    actionLoading.value = false
  }
}

async function confirmarDesativar() {
  if (!estabelecimentoId.value || !metaDesativarId.value) return
  actionLoading.value = true
  try {
    await caixaService.desativarMeta(estabelecimentoId.value, metaDesativarId.value)
    notifications.push('success', 'Meta desativada.')
    confirmDesativarOpen.value = false
    await loadMetas()
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    actionLoading.value = false
  }
}

watch(ready, (isReady) => {
  if (isReady) void load()
}, { immediate: true })

watch(aba, () => void load())
</script>

<template>
  <div :class="FINANCEIRO_PAGE_CLASS">
    <FinanceiroPageHeader
      title="Metas"
      subtitle="Metas de comissão por desempenho."
      :back-to="ROUTE_PATHS.FINANCEIRO"
    >
      <template #filters>
        <SegmentedControl v-model="aba" :options="abaOptions" aria-label="Visão de metas" />
      </template>
      <template v-if="podeGerenciar && aba === 'metas'" #actions>
        <button type="button" class="financeiro-btn-primary" @click="abrirNova">
          Nova meta
        </button>
      </template>
    </FinanceiroPageHeader>

    <ContentAlert v-if="contextError" variant="error">{{ contextError }}</ContentAlert>
    <LoadingSpinner v-if="contextLoading || loading" />

    <!-- Aba: Metas (CRUD) -->
    <template v-else-if="aba === 'metas'">
      <FinanceiroEmptyState
        v-if="metas.length === 0"
        title="Nenhuma meta"
        description="Crie metas de comissão por desempenho para os profissionais."
      >
        <template v-if="podeGerenciar" #action>
          <button type="button" class="financeiro-btn-primary" @click="abrirNova">
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
              v-if="podeGerenciar && m.ativa"
              type="button"
              class="financeiro-btn-outline"
              @click="abrirEditar(m)"
            >
              Editar
            </button>
            <button
              v-if="podeGerenciar && m.ativa"
              type="button"
              class="financeiro-btn-outline"
              @click="abrirDesativar(m.id)"
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

    <MetaFormModal
      v-model="formModalOpen"
      :loading="actionLoading"
      :meta="metaEditando"
      @confirm="salvarMeta"
    />
    <FinanceiroConfirmDialog
      v-model="confirmDesativarOpen"
      title="Desativar meta?"
      message="Esta meta deixará de ser considerada para cálculos de comissão."
      confirm-label="Desativar meta"
      variant="danger"
      :loading="actionLoading"
      @confirm="confirmarDesativar"
    />
  </div>
</template>

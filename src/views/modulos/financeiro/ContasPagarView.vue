<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import CriarContaPagarModal from '@/components/financeiro/CriarContaPagarModal.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { caixaService } from '@/services/caixaService'
import type { ContaPagar } from '@/types/negocio/caixa.types'
import { ROUTE_PATHS } from '@/constants/routes'
import { formatCurrency } from '@/utils/formatters'

const { estabelecimentoId, ready, loading: contextLoading } = useEstabelecimentoView()
const { possuiPermissao } = useNegocioContext()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const contas = ref<ContaPagar[]>([])
const loading = ref(false)
const actionLoading = ref(false)
const modalOpen = ref(false)
const podeGerenciar = () => possuiPermissao('CaixaGerenciar')

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  try {
    contas.value = await caixaService.listarContasPagar(estabelecimentoId.value)
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    loading.value = false
  }
}

async function handleCriar(payload: {
  fornecedor: string
  categoria: string
  descricao: string
  valor: number
  vencimento: string
  recorrente: boolean
}) {
  if (!estabelecimentoId.value) return
  actionLoading.value = true
  try {
    await caixaService.criarContaPagar(estabelecimentoId.value, payload)
    notifications.push('success', 'Conta criada.')
    modalOpen.value = false
    await load()
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    actionLoading.value = false
  }
}

async function baixar(contaId: number) {
  if (!estabelecimentoId.value) return
  actionLoading.value = true
  try {
    await caixaService.baixarContaPagar(estabelecimentoId.value, contaId)
    notifications.push('success', 'Conta baixada.')
    await load()
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    actionLoading.value = false
  }
}

watch(ready, (isReady) => { if (isReady) void load() }, { immediate: true })
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <h1 class="font-satoshi text-xl font-bold text-glow-text">Contas a pagar</h1>
      <div class="flex gap-2">
        <BaseButton v-if="podeGerenciar()" size="sm" @click="modalOpen = true">Nova conta</BaseButton>
        <RouterLink :to="ROUTE_PATHS.FINANCEIRO">
          <BaseButton variant="secondary" size="sm">Voltar</BaseButton>
        </RouterLink>
      </div>
    </div>
    <LoadingSpinner v-if="contextLoading || loading" />
    <BaseCard v-else>
      <EmptyState v-if="contas.length === 0" title="Nenhuma conta" description="Cadastre despesas a pagar." />
      <div v-else class="space-y-2">
        <div
          v-for="conta in contas"
          :key="conta.id"
          class="flex items-center justify-between rounded border border-glow-border-soft px-4 py-3"
        >
          <div>
            <p class="font-urbanist text-sm font-semibold text-glow-text">{{ conta.fornecedor }} — {{ conta.descricao }}</p>
            <p class="text-xs text-glow-text-subtle">{{ conta.categoria }} · {{ conta.status }}</p>
          </div>
          <div class="flex items-center gap-3">
            <span class="font-semibold">{{ formatCurrency(conta.valor) }}</span>
            <BaseButton
              v-if="podeGerenciar() && conta.status === 'Aberta'"
              size="sm"
              variant="secondary"
              :disabled="actionLoading"
              @click="baixar(conta.id)"
            >
              Baixar
            </BaseButton>
          </div>
        </div>
      </div>
    </BaseCard>

    <CriarContaPagarModal
      v-model="modalOpen"
      :loading="actionLoading"
      @confirm="handleCriar"
    />
  </div>
</template>

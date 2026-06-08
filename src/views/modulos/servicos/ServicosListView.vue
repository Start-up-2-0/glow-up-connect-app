<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useNegocioStore } from '@/stores/negocio.store'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { servicoService } from '@/services/servicoService'
import type { Servico } from '@/types/negocio/servico.types'
import {
  ROUTE_PATHS,
  servicoEditarPath,
  servicoProfissionaisPath,
} from '@/constants/routes'
import { formatCurrency, formatLimite } from '@/utils/formatters'

const router = useRouter()
const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const { possuiPermissao, possuiModulo } = useNegocioContext()
const negocioStore = useNegocioStore()
const { limites } = storeToRefs(negocioStore)
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const servicos = ref<Servico[]>([])
const loading = ref(false)
const togglingId = ref<number | null>(null)

const podeGerenciar = computed(() => possuiPermissao('ServicoGerenciar'))
const temModuloProfissionais = computed(() => possuiModulo('Profissionais'))
const limiteServicos = computed(() => limites.value?.servicos ?? null)
const usoServicos = computed(() => servicos.value.length)
const limiteAtingido = computed(
  () => limiteServicos.value !== null && usoServicos.value >= limiteServicos.value,
)

function profissionaisAtivos(servico: Servico): number {
  return servico.profissionais.filter((p) => p.ativo).length
}

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  try {
    servicos.value = await servicoService.listar(estabelecimentoId.value)
  } catch (err) {
    notifications.push('error', resolveError(err, 'Não foi possível carregar os serviços.'))
  } finally {
    loading.value = false
  }
}

async function handleToggleStatus(servico: Servico) {
  if (!estabelecimentoId.value || !podeGerenciar.value) return
  togglingId.value = servico.id
  try {
    const atualizado = await servicoService.alterarStatus(
      estabelecimentoId.value,
      servico.id,
      !servico.ativo,
    )
    servicos.value = servicos.value.map((s) => (s.id === servico.id ? atualizado : s))
    notifications.push('success', atualizado.ativo ? 'Serviço ativado.' : 'Serviço desativado.')
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    togglingId.value = null
  }
}

function irNovo() {
  void router.push(ROUTE_PATHS.SERVICOS_NOVO)
}

function irEditar(id: number) {
  void router.push(servicoEditarPath(id))
}

function irProfissionais(id: number) {
  void router.push(servicoProfissionaisPath(id))
}

watch(
  ready,
  (isReady) => {
    if (isReady) void load()
  },
  { immediate: true },
)
</script>

<template>
  <div class="space-y-4 lg:space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="font-satoshi text-xl font-bold leading-tight text-glow-text lg:text-2xl">
          Serviços
        </h1>
        <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
          {{
            podeGerenciar
              ? 'Cadastre e gerencie os serviços oferecidos pelo estabelecimento.'
              : 'Visualize os serviços oferecidos pelo estabelecimento.'
          }}
        </p>
        <p v-if="limiteServicos !== null" class="mt-1 font-urbanist text-xs text-glow-text-subtle">
          Uso: {{ usoServicos }} / {{ formatLimite(limiteServicos) }}
        </p>
      </div>
      <BaseButton
        v-if="podeGerenciar"
        variant="primary"
        :disabled="limiteAtingido"
        @click="irNovo"
      >
        Novo serviço
      </BaseButton>
    </div>

    <p v-if="contextError" class="font-urbanist text-sm text-red-600">{{ contextError }}</p>

    <LoadingSpinner v-if="contextLoading || (loading && servicos.length === 0)" />

    <BaseCard v-else-if="servicos.length === 0">
      <EmptyState
        title="Nenhum serviço"
        :description="
          podeGerenciar
            ? 'Cadastre o primeiro serviço para começar a receber agendamentos.'
            : 'Nenhum serviço cadastrado neste estabelecimento.'
        "
      />
      <div v-if="podeGerenciar" class="mt-4 flex justify-center">
        <BaseButton variant="primary" :disabled="limiteAtingido" @click="irNovo">
          Novo serviço
        </BaseButton>
      </div>
    </BaseCard>

    <div v-else class="space-y-3">
      <div
        v-for="servico in servicos"
        :key="servico.id"
        class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-glow-border-soft bg-glow-surface p-4"
      >
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <p class="font-urbanist text-base font-semibold text-glow-text">{{ servico.nome }}</p>
            <span
              class="inline-flex rounded-full px-2.5 py-0.5 font-urbanist text-xs font-medium"
              :class="
                servico.ativo
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-glow-canvas text-glow-text-subtle'
              "
            >
              {{ servico.ativo ? 'Ativo' : 'Inativo' }}
            </span>
          </div>
          <p v-if="servico.descricao" class="mt-1 font-urbanist text-sm text-glow-text-subtle">
            {{ servico.descricao }}
          </p>
          <p class="mt-1 font-urbanist text-sm text-glow-text">
            {{ formatCurrency(servico.precoBase) }} · {{ servico.duracaoMinutos }} min
          </p>
          <p
            v-if="temModuloProfissionais && profissionaisAtivos(servico) > 0"
            class="mt-1 font-urbanist text-xs text-glow-text-subtle"
          >
            {{ profissionaisAtivos(servico) }}
            {{ profissionaisAtivos(servico) === 1 ? 'profissional vinculado' : 'profissionais vinculados' }}
          </p>
        </div>
        <div v-if="podeGerenciar" class="flex flex-wrap gap-2">
          <BaseButton variant="secondary" size="sm" @click="irEditar(servico.id)">
            Editar
          </BaseButton>
          <BaseButton
            v-if="temModuloProfissionais"
            variant="secondary"
            size="sm"
            @click="irProfissionais(servico.id)"
          >
            Profissionais
          </BaseButton>
          <BaseButton
            variant="secondary"
            size="sm"
            :loading="togglingId === servico.id"
            @click="handleToggleStatus(servico)"
          >
            {{ servico.ativo ? 'Desativar' : 'Ativar' }}
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNegocioStore } from '@/stores/negocio.store'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { servicoService } from '@/services/servicoService'
import type { Servico } from '@/types/negocio/servico.types'
import { formatCurrency, formatLimite } from '@/utils/formatters'

const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const negocioStore = useNegocioStore()
const { limites } = storeToRefs(negocioStore)
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const servicos = ref<Servico[]>([])
const loading = ref(false)
const showForm = ref(false)
const saving = ref(false)
const togglingId = ref<number | null>(null)

const form = ref<{ nome: string; descricao: string; precoBase: number; duracaoMinutos: number }>({
  nome: '',
  descricao: '',
  precoBase: 0,
  duracaoMinutos: 30,
})

const limiteServicos = computed(() => limites.value?.servicos ?? null)
const usoServicos = computed(() => servicos.value.length)
const limiteAtingido = computed(
  () => limiteServicos.value !== null && usoServicos.value >= limiteServicos.value,
)

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

async function handleCriar() {
  if (!estabelecimentoId.value || !form.value.nome.trim()) return
  saving.value = true
  try {
    const criado = await servicoService.criar(estabelecimentoId.value, {
      nome: form.value.nome.trim(),
      descricao: form.value.descricao?.trim() || undefined,
      precoBase: Number(form.value.precoBase),
      duracaoMinutos: Number(form.value.duracaoMinutos),
    })
    servicos.value = [...servicos.value, criado]
    form.value = { nome: '', descricao: '', precoBase: 0, duracaoMinutos: 30 }
    showForm.value = false
    notifications.push('success', 'Serviço criado.')
  } catch (err) {
    notifications.push('error', resolveError(err, 'Não foi possível criar o serviço.'))
  } finally {
    saving.value = false
  }
}

async function handleToggleStatus(servico: Servico) {
  if (!estabelecimentoId.value) return
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
          Cadastre e gerencie os serviços oferecidos pelo estabelecimento.
        </p>
        <p v-if="limiteServicos !== null" class="mt-1 font-urbanist text-xs text-glow-text-subtle">
          Uso: {{ usoServicos }} / {{ formatLimite(limiteServicos) }}
        </p>
      </div>
      <BaseButton
        variant="primary"
        :disabled="limiteAtingido"
        @click="showForm = !showForm"
      >
        {{ showForm ? 'Cancelar' : 'Novo serviço' }}
      </BaseButton>
    </div>

    <p v-if="contextError" class="font-urbanist text-sm text-red-600">{{ contextError }}</p>

    <BaseCard v-if="showForm" title="Novo serviço">
      <form class="space-y-4" @submit.prevent="handleCriar">
        <div class="grid gap-4 sm:grid-cols-2">
          <BaseInput v-model="form.nome" label="Nome" required />
          <BaseInput
            v-model="form.descricao"
            label="Descrição"
            placeholder="Opcional"
          />
          <BaseInput
            :model-value="String(form.precoBase)"
            label="Preço base (R$)"
            type="number"
            @update:model-value="form.precoBase = Number($event)"
          />
          <BaseInput
            :model-value="String(form.duracaoMinutos)"
            label="Duração (minutos)"
            type="number"
            @update:model-value="form.duracaoMinutos = Number($event)"
          />
        </div>
        <div class="flex justify-end">
          <BaseButton type="submit" :loading="saving">Salvar</BaseButton>
        </div>
      </form>
    </BaseCard>

    <LoadingSpinner v-if="contextLoading || (loading && servicos.length === 0)" />

    <BaseCard v-else-if="servicos.length === 0">
      <EmptyState
        title="Nenhum serviço"
        description="Cadastre o primeiro serviço para começar a receber agendamentos."
      />
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
        </div>
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
</template>

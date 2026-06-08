<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import CurrencyInput from '@/components/ui/CurrencyInput.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { servicoService } from '@/services/servicoService'
import {
  ROUTE_NAMES,
  ROUTE_PATHS,
  servicoProfissionaisPath,
} from '@/constants/routes'
import { isValidCurrencyValue } from '@/utils/formatters'

const route = useRoute()
const router = useRouter()
const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const { possuiModulo } = useNegocioContext()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const isNovo = computed(() => route.name === ROUTE_NAMES.SERVICOS_NOVO)
const servicoId = computed(() => {
  if (isNovo.value) return null
  const id = Number(route.params.id)
  return Number.isFinite(id) ? id : null
})

const loading = ref(false)
const saving = ref(false)
const notFound = ref(false)

const form = ref({
  nome: '',
  descricao: '',
  precoBase: 0,
  duracaoMinutos: 30,
})

const errors = ref<{ nome?: string; precoBase?: string; duracaoMinutos?: string }>({})

const temModuloProfissionais = computed(() => possuiModulo('Profissionais'))
const pageTitle = computed(() => (isNovo.value ? 'Novo serviço' : 'Editar serviço'))

function validate(): boolean {
  const next: typeof errors.value = {}
  if (!form.value.nome.trim()) {
    next.nome = 'Nome é obrigatório.'
  }
  if (!isValidCurrencyValue(form.value.precoBase)) {
    next.precoBase = 'Informe um valor válido.'
  }
  const duracao = Number(form.value.duracaoMinutos)
  if (!Number.isFinite(duracao) || duracao < 1) {
    next.duracaoMinutos = 'Duração mínima de 1 minuto.'
  }
  errors.value = next
  return Object.keys(next).length === 0
}

async function loadServico() {
  if (!estabelecimentoId.value || !servicoId.value) return
  loading.value = true
  notFound.value = false
  try {
    const servicos = await servicoService.listar(estabelecimentoId.value)
    const servico = servicos.find((s) => s.id === servicoId.value)
    if (!servico) {
      notFound.value = true
      return
    }
    form.value = {
      nome: servico.nome,
      descricao: servico.descricao ?? '',
      precoBase: servico.precoBase,
      duracaoMinutos: servico.duracaoMinutos,
    }
  } catch (err) {
    notifications.push('error', resolveError(err, 'Não foi possível carregar o serviço.'))
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  if (!estabelecimentoId.value || !validate()) return
  saving.value = true
  try {
    const payload = {
      nome: form.value.nome.trim(),
      descricao: form.value.descricao?.trim() || undefined,
      precoBase: form.value.precoBase,
      duracaoMinutos: Number(form.value.duracaoMinutos),
    }
    if (isNovo.value) {
      await servicoService.criar(estabelecimentoId.value, payload)
      notifications.push('success', 'Serviço criado.')
    } else if (servicoId.value) {
      await servicoService.atualizar(estabelecimentoId.value, servicoId.value, payload)
      notifications.push('success', 'Serviço atualizado.')
    }
    await router.push(ROUTE_PATHS.SERVICOS)
  } catch (err) {
    notifications.push('error', resolveError(err, 'Não foi possível salvar o serviço.'))
  } finally {
    saving.value = false
  }
}

function voltar() {
  void router.push(ROUTE_PATHS.SERVICOS)
}

function irProfissionais() {
  if (!servicoId.value) return
  void router.push(servicoProfissionaisPath(servicoId.value))
}

watch(
  ready,
  (isReady) => {
    if (!isReady) return
    if (isNovo.value) return
    void loadServico()
  },
  { immediate: true },
)
</script>

<template>
  <div class="space-y-4 lg:space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="font-satoshi text-xl font-bold leading-tight text-glow-text lg:text-2xl">
          {{ pageTitle }}
        </h1>
        <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
          {{
            isNovo
              ? 'Cadastre um novo serviço oferecido pelo estabelecimento.'
              : 'Atualize as informações do serviço.'
          }}
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <BaseButton variant="secondary" size="sm" @click="voltar">Voltar</BaseButton>
        <BaseButton
          v-if="!isNovo && temModuloProfissionais && servicoId"
          variant="secondary"
          size="sm"
          @click="irProfissionais"
        >
          Profissionais vinculados
        </BaseButton>
      </div>
    </div>

    <p v-if="contextError" class="font-urbanist text-sm text-red-600">{{ contextError }}</p>

    <LoadingSpinner v-if="contextLoading || loading" />

    <BaseCard v-else-if="notFound" title="Serviço não encontrado">
      <p class="font-urbanist text-sm text-glow-text-subtle">
        O serviço solicitado não existe ou foi removido.
      </p>
      <div class="mt-4">
        <BaseButton variant="secondary" @click="voltar">Voltar à listagem</BaseButton>
      </div>
    </BaseCard>

    <BaseCard v-else :title="pageTitle">
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div class="grid gap-4 sm:grid-cols-2">
          <BaseInput
            v-model="form.nome"
            label="Nome"
            required
            :error="errors.nome"
          />
          <BaseInput
            v-model="form.descricao"
            label="Descrição"
            placeholder="Opcional"
          />
          <CurrencyInput
            v-model="form.precoBase"
            label="Preço base"
            required
            :error="errors.precoBase"
          />
          <BaseInput
            :model-value="String(form.duracaoMinutos)"
            label="Duração (minutos)"
            type="number"
            min="1"
            required
            :error="errors.duracaoMinutos"
            @update:model-value="form.duracaoMinutos = Number($event)"
          />
        </div>
        <div class="flex justify-end gap-2">
          <BaseButton type="button" variant="secondary" @click="voltar">Cancelar</BaseButton>
          <BaseButton type="submit" :loading="saving">Salvar</BaseButton>
        </div>
      </form>
    </BaseCard>
  </div>
</template>

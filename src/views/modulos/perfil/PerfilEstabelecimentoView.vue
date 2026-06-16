<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ContentAlert from '@/components/feedback/ContentAlert.vue'
import EnderecoForm from '@/components/form/EnderecoForm.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useApiError } from '@/composables/useApiError'
import { useNotificationsStore } from '@/stores/notifications.store'
import { estabelecimentoPerfilService } from '@/services/estabelecimentoPerfilService'
import type { EnderecoFormFields } from '@/types/endereco.types'
import type { EstabelecimentoPerfilCompleto } from '@/types/estabelecimento.types'
import { emptyEnderecoFormFields } from '@/types/endereco.types'
import { labelModulos } from '@/utils/moduloLabels'
import { formatEnderecoOnboarding, telefoneLocalFromApi } from '@/utils/formatters'
import { draftEnderecoToApi, validateEnderecoForSubmit } from '@/utils/enderecoPayload'
import { buildAtualizarPerfilPayload } from '@/utils/perfilPayload'
import { maskCep } from '@/utils/cep'

const { estabelecimentoAtivo, estabelecimentoId, ready, error: contextError, loading } =
  useEstabelecimentoView()
const { planoNome, assinaturaAtiva, role } = useNegocioContext()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const perfil = ref<EstabelecimentoPerfilCompleto | null>(null)
const loadError = ref<string | null>(null)
const loadingPerfil = ref(false)
const editingEndereco = ref(false)
const savingEndereco = ref(false)
const enderecoError = ref<string | null>(null)
const endereco = ref<EnderecoFormFields>(emptyEnderecoFormFields())

const enderecoIncompleto = computed(
  () => perfil.value?.endereco != null && perfil.value.endereco.enderecoCompleto === false,
)

const enderecoResumo = computed(() => {
  if (!perfil.value?.endereco) return 'Endereço não informado'
  const e = perfil.value.endereco
  return formatEnderecoOnboarding({
    cep: e.cep,
    logradouro: e.logradouro,
    numero: e.numero,
    bairro: e.bairro,
    cidade: e.cidade,
    estado: e.estado,
    complemento: e.complemento ?? '',
  })
})

async function carregarPerfil() {
  if (!estabelecimentoId.value) return
  loadingPerfil.value = true
  loadError.value = null
  try {
    perfil.value = await estabelecimentoPerfilService.obterPerfil(estabelecimentoId.value)
  } catch (err) {
    loadError.value = resolveError(err)
  } finally {
    loadingPerfil.value = false
  }
}

function iniciarEdicaoEndereco() {
  const atual = perfil.value?.endereco
  endereco.value = atual
    ? {
        cep: maskCep(atual.cep.replace(/\D/g, '')),
        logradouro: atual.logradouro,
        numero: atual.numero,
        bairro: atual.bairro,
        cidade: atual.cidade,
        estado: atual.estado,
        complemento: atual.complemento ?? '',
      }
    : emptyEnderecoFormFields()
  enderecoError.value = null
  editingEndereco.value = true
}

function cancelarEdicaoEndereco() {
  editingEndereco.value = false
  enderecoError.value = null
}

async function salvarEndereco() {
  if (!estabelecimentoId.value || !perfil.value) return
  const validationError = validateEnderecoForSubmit(endereco.value)
  if (validationError) {
    enderecoError.value = validationError
    return
  }

  savingEndereco.value = true
  enderecoError.value = null
  try {
    perfil.value = await estabelecimentoPerfilService.atualizarPerfil(
      estabelecimentoId.value,
      buildAtualizarPerfilPayload(perfil.value, {
        endereco: draftEnderecoToApi(endereco.value),
      }),
    )
    editingEndereco.value = false
    notifications.push('success', 'Endereço atualizado com sucesso.')
  } catch (err) {
    enderecoError.value = resolveError(err)
  } finally {
    savingEndereco.value = false
  }
}

watch(
  estabelecimentoId,
  (id) => {
    if (id) void carregarPerfil()
  },
  { immediate: true },
)
</script>

<template>
  <div class="space-y-4 lg:space-y-6">
    <div>
      <h1 class="font-satoshi text-xl font-bold leading-tight text-glow-text lg:text-2xl">
        Perfil do estabelecimento
      </h1>
      <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
        Informações do negócio selecionado.
      </p>
    </div>

    <ContentAlert v-if="contextError" variant="error" compact>{{ contextError }}</ContentAlert>
    <ContentAlert v-else-if="loadError" variant="error" compact>{{ loadError }}</ContentAlert>

    <ContentAlert
      v-if="enderecoIncompleto && !editingEndereco"
      variant="warning"
      title="Endereço incompleto"
      compact
    >
      Complete seu endereço para aparecer na busca por proximidade dos clientes.
    </ContentAlert>

    <LoadingSpinner v-if="(loading && !ready) || loadingPerfil" />

    <BaseCard v-else-if="estabelecimentoAtivo" title="Dados do negócio">
      <div class="flex gap-4">
        <div
          v-if="estabelecimentoAtivo.logo"
          class="size-16 shrink-0 overflow-hidden rounded-lg bg-glow-canvas"
        >
          <img
            :src="estabelecimentoAtivo.logo"
            :alt="estabelecimentoAtivo.nome"
            class="size-full object-cover"
          />
        </div>
        <dl class="space-y-3 font-urbanist text-sm">
          <div>
            <dt class="font-medium text-glow-text-subtle">Nome</dt>
            <dd class="text-glow-text">{{ perfil?.nome ?? estabelecimentoAtivo.nome }}</dd>
          </div>
          <div>
            <dt class="font-medium text-glow-text-subtle">Seu papel</dt>
            <dd class="text-glow-text">{{ role ?? estabelecimentoAtivo.role }}</dd>
          </div>
          <div v-if="perfil?.email">
            <dt class="font-medium text-glow-text-subtle">E-mail</dt>
            <dd class="text-glow-text">{{ perfil.email }}</dd>
          </div>
          <div v-if="perfil?.telefone">
            <dt class="font-medium text-glow-text-subtle">Telefone</dt>
            <dd class="text-glow-text">{{ telefoneLocalFromApi(perfil.telefone) }}</dd>
          </div>
          <div>
            <dt class="font-medium text-glow-text-subtle">Plano</dt>
            <dd class="text-glow-text">{{ planoNome ?? '—' }}</dd>
          </div>
          <div>
            <dt class="font-medium text-glow-text-subtle">Assinatura</dt>
            <dd class="text-glow-text">{{ assinaturaAtiva ? 'Ativa' : 'Inativa' }}</dd>
          </div>
          <div>
            <dt class="font-medium text-glow-text-subtle">Módulos</dt>
            <dd class="text-glow-text">
              {{ labelModulos(estabelecimentoAtivo.modulos).join(', ') || '—' }}
            </dd>
          </div>
        </dl>
      </div>
    </BaseCard>

    <BaseCard v-if="estabelecimentoAtivo && !loadingPerfil" title="Endereço">
      <template v-if="!editingEndereco">
        <p class="font-urbanist text-sm text-glow-text">{{ enderecoResumo }}</p>
        <BaseButton class="mt-4" variant="secondary" @click="iniciarEdicaoEndereco">
          Editar endereço
        </BaseButton>
      </template>

      <template v-else>
        <ContentAlert v-if="enderecoError" variant="error" compact class="mb-4">
          {{ enderecoError }}
        </ContentAlert>
        <EnderecoForm v-model="endereco" variant="dashboard" id-prefix="perfil-end" />
        <div class="mt-4 flex flex-wrap gap-3">
          <BaseButton variant="primary" :loading="savingEndereco" @click="salvarEndereco">
            Salvar endereço
          </BaseButton>
          <BaseButton variant="secondary" :disabled="savingEndereco" @click="cancelarEdicaoEndereco">
            Cancelar
          </BaseButton>
        </div>
      </template>
    </BaseCard>
  </div>
</template>

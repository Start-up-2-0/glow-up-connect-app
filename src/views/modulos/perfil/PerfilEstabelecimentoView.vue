<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ROUTE_PATHS } from '@/constants/routes'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import ContentAlert from '@/components/feedback/ContentAlert.vue'
import EnderecoForm from '@/components/form/EnderecoForm.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import AuthAvatarUpload from '@/components/auth/AuthAvatarUpload.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNegocioContext } from '@/composables/useNegocioContext'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import { useApiError } from '@/composables/useApiError'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useNegocioStore } from '@/stores/negocio.store'
import { publicoService } from '@/services/publicoService'
import { estabelecimentoPerfilService } from '@/services/estabelecimentoPerfilService'
import type { EnderecoFormFields } from '@/types/endereco.types'
import type { EstabelecimentoCategoria, EstabelecimentoPerfilCompleto } from '@/types/estabelecimento.types'
import { emptyEnderecoFormFields } from '@/types/endereco.types'
import { labelModulos } from '@/utils/moduloLabels'
import { formatEnderecoOnboarding, telefoneLocalFromApi } from '@/utils/formatters'
import { draftEnderecoToApi, validateEnderecoForSubmit } from '@/utils/enderecoPayload'
import { buildAtualizarPerfilPayload } from '@/utils/perfilPayload'
import { readFileAsDataUrl } from '@/utils/avatarFile'
import { maskCep } from '@/utils/cep'

const { estabelecimentoAtivo, estabelecimentoId, ready, error: contextError, loading } =
  useEstabelecimentoView()
const { planoNome, assinaturaAtiva, role } = useNegocioContext()
const negocioStore = useNegocioStore()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const perfil = ref<EstabelecimentoPerfilCompleto | null>(null)
const loadError = ref<string | null>(null)
const loadingPerfil = ref(false)

const editingBasico = ref(false)
const savingBasico = ref(false)
const basicoError = ref<string | null>(null)
const nomeDraft = ref('')
const logoDraft = ref<string | null>(null)
const logoError = ref<string | null>(null)
const categorias = ref<EstabelecimentoCategoria[]>([])
const categoriaIdDraft = ref('')
const categoriaOptions = computed(() => categorias.value.map((c) => ({ value: String(c.id), label: c.nome })))

async function carregarCategorias() {
  try {
    categorias.value = await publicoService.listarCategorias()
  } catch {
    categorias.value = []
  }
}

const editingEndereco = ref(false)
const savingEndereco = ref(false)
const enderecoError = ref<string | null>(null)
const endereco = ref<EnderecoFormFields>(emptyEnderecoFormFields())

const logoPreview = computed(() => logoDraft.value ?? perfil.value?.logo ?? estabelecimentoAtivo.value?.logo ?? null)
const nomeExibido = computed(() => perfil.value?.nome ?? estabelecimentoAtivo.value?.nome ?? '')

const enderecoIncompleto = computed(
  () => perfil.value?.endereco != null && perfil.value.endereco.enderecoCompleto === false,
)

const linkPublico = computed(() => {
  if (!estabelecimentoAtivo.value?.publicGuid) return ''
  return `${window.location.origin}${ROUTE_PATHS.LOJA}/${estabelecimentoAtivo.value.publicGuid}/agendar`
})

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

function sincronizarContextoNegocio(atualizado: EstabelecimentoPerfilCompleto) {
  negocioStore.patchEstabelecimentoAtivo({
    nome: atualizado.nome,
    logo: atualizado.logo,
  })
}

async function copiarLinkPublico() {
  try {
    await navigator.clipboard.writeText(linkPublico.value)
    notifications.push('success', 'Link copiado para a área de transferência!')
  } catch {
    notifications.push('error', 'Não foi possível copiar o link.')
  }
}

async function carregarPerfil() {
  void carregarCategorias()
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

function iniciarEdicaoBasico() {
  nomeDraft.value = nomeExibido.value
  logoDraft.value = perfil.value?.logo ?? estabelecimentoAtivo.value?.logo ?? null
  categoriaIdDraft.value = perfil.value?.categoriaId ? String(perfil.value.categoriaId) : ''
  logoError.value = null
  basicoError.value = null
  editingBasico.value = true
}

function cancelarEdicaoBasico() {
  editingBasico.value = false
  basicoError.value = null
  logoError.value = null
}

async function onLogoChange(file: File | null) {
  logoError.value = null
  if (!file) {
    logoDraft.value = perfil.value?.logo ?? estabelecimentoAtivo.value?.logo ?? null
    return
  }
  try {
    logoDraft.value = await readFileAsDataUrl(file)
  } catch {
    logoError.value = 'Não foi possível carregar a logo.'
  }
}

async function salvarBasico() {
  if (!estabelecimentoId.value || !perfil.value) return
  const nome = nomeDraft.value.trim()
  if (!nome) {
    basicoError.value = 'Informe o nome da loja.'
    return
  }
  if (!logoDraft.value) {
    basicoError.value = 'Envie a logo da loja.'
    return
  }

  savingBasico.value = true
  basicoError.value = null
  try {
    const atualizado = await estabelecimentoPerfilService.atualizarPerfil(
      estabelecimentoId.value,
      buildAtualizarPerfilPayload(perfil.value, {
        nome,
        logo: logoDraft.value,
        categoriaId: categoriaIdDraft.value ? Number(categoriaIdDraft.value) : undefined,
      }),
    )
    perfil.value = atualizado
    sincronizarContextoNegocio(atualizado)
    editingBasico.value = false
    notifications.push('success', 'Informações da loja atualizadas.')
  } catch (err) {
    basicoError.value = resolveError(err)
  } finally {
    savingBasico.value = false
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
        Edite nome, logo e endereço da sua loja.
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

    <template v-else-if="estabelecimentoAtivo">
      <BaseCard title="Informações da loja">
        <template v-if="!editingBasico">
          <div class="flex gap-4">
            <div
              v-if="logoPreview"
              class="size-16 shrink-0 overflow-hidden rounded-lg bg-glow-canvas"
            >
              <img
                :src="logoPreview"
                :alt="nomeExibido"
                class="size-full object-cover"
              />
            </div>
            <div class="min-w-0 flex-1">
              <p class="font-satoshi text-lg font-bold text-glow-text">{{ nomeExibido }}</p>
              <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
                Nome e logo exibidos para clientes no app.
              </p>
            </div>
          </div>
          <BaseButton class="mt-4" variant="secondary" @click="iniciarEdicaoBasico">
            Editar informações
          </BaseButton>
        </template>

        <template v-else>
          <ContentAlert v-if="basicoError" variant="error" compact class="mb-4">
            {{ basicoError }}
          </ContentAlert>
          <ContentAlert v-if="logoError" variant="error" compact class="mb-4">
            {{ logoError }}
          </ContentAlert>

          <div class="space-y-4">
            <div v-if="logoPreview" class="flex justify-center">
              <img
                :src="logoPreview"
                :alt="nomeDraft || 'Logo da loja'"
                class="size-20 rounded-xl object-cover"
              />
            </div>
            <AuthAvatarUpload label="Logo da loja" @change="onLogoChange" @error="(msg) => (logoError = msg)" />
            <BaseInput
              v-model="nomeDraft"
              label="Nome da loja"
              placeholder="Ex.: Studio Glow Beauty"
              autocomplete="organization"
            />
            <BaseSelect
              v-model="categoriaIdDraft"
              label="Categoria do estabelecimento"
              :options="categoriaOptions"
              placeholder="Selecione a categoria"
            />
          </div>

          <div class="mt-4 flex flex-wrap gap-3">
            <BaseButton variant="primary" :loading="savingBasico" @click="salvarBasico">
              Salvar informações
            </BaseButton>
            <BaseButton variant="secondary" :disabled="savingBasico" @click="cancelarEdicaoBasico">
              Cancelar
            </BaseButton>
          </div>
        </template>
      </BaseCard>

      <BaseCard title="Endereço">
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

      <BaseCard title="Sua conta neste negócio">
        <dl class="space-y-3 font-urbanist text-sm">
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
      </BaseCard>

      <BaseCard title="Link Público de Agendamento">
        <p class="font-urbanist text-sm text-glow-text-subtle">
          Compartilhe este link para que seus clientes possam agendar diretamente com sua loja.
        </p>
        <div class="mt-4 space-y-3">
          <BaseInput
            id="link-publico"
            :model-value="linkPublico"
            readonly
            label="URL do seu link público"
          />
          <BaseButton variant="secondary" @click="copiarLinkPublico">
            Copiar link
          </BaseButton>
        </div>
      </BaseCard>
    </template>
  </div>
</template>

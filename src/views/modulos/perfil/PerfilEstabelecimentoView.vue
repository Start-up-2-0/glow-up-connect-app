<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Component } from 'vue'
import { RouterLink } from 'vue-router'
import {
  BadgeCheck,
  Blocks,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  Crown,
  Link2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Settings,
  Store,
  UsersRound,
} from 'lucide-vue-next'
import { lojaAgendarUrl, ROUTE_PATHS } from '@/constants/routes'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import ContentAlert from '@/components/feedback/ContentAlert.vue'
import EnderecoForm from '@/components/form/EnderecoForm.vue'
import AuthAvatarUpload from '@/components/auth/AuthAvatarUpload.vue'
import PerfilTabNav from '@/components/perfil/PerfilTabNav.vue'
import PerfilSectionCard from '@/components/perfil/PerfilSectionCard.vue'
import LojaLinkPublicoCard from '@/components/perfil/LojaLinkPublicoCard.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useApiError } from '@/composables/useApiError'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useNegocioStore } from '@/stores/negocio.store'
import { useUserStore } from '@/stores/user.store'
import { publicoService } from '@/services/publicoService'
import { estabelecimentoPerfilService } from '@/services/estabelecimentoPerfilService'
import { establishmentRoleLabel } from '@/constants/establishmentRoles'
import type { EnderecoFormFields } from '@/types/endereco.types'
import type { EstabelecimentoCategoria, EstabelecimentoPerfilCompleto } from '@/types/estabelecimento.types'
import {
  opcoesCategoriaDoTipo,
  placeholderCategoria,
  sugerirCategoriaId,
} from '@/utils/categoriasEstabelecimento'
import { emptyEnderecoFormFields } from '@/types/endereco.types'
import { labelModulos } from '@/utils/moduloLabels'
import { formatTelefone, telefoneLocalFromApi } from '@/utils/formatters'
import { draftEnderecoToApi, validateEnderecoForSubmit } from '@/utils/enderecoPayload'
import { buildAtualizarPerfilPayload } from '@/utils/perfilPayload'
import { readFileAsDataUrl } from '@/utils/avatarFile'
import { maskCep } from '@/utils/cep'
import { storeToRefs } from 'pinia'
import GlowGuideLauncher from '@/tutorials/components/GlowGuideLauncher.vue'
import { usePageTutorial } from '@/tutorials/hooks/usePageTutorial'

type LojaPerfilTabId = 'informacoes' | 'conta' | 'links' | 'configuracoes'
type EditingSection = 'basico' | 'endereco' | null

const { startPageTutorial } = usePageTutorial('store-profile')

const TABS: { id: LojaPerfilTabId; label: string; icon: Component }[] = [
  { id: 'informacoes', label: 'Informações da loja', icon: Store },
  { id: 'conta', label: 'Conta e assinatura', icon: BriefcaseBusiness },
  { id: 'links', label: 'Links e agendamentos', icon: Link2 },
  { id: 'configuracoes', label: 'Configurações', icon: Settings },
]

const { estabelecimentoAtivo, estabelecimentoId, ready, error: contextError, loading } =
  useEstabelecimentoView()
const {
  planoNome,
  assinaturaAtiva,
  role,
  proximaDataVencimento,
} = useNegocioContext()
const negocioStore = useNegocioStore()
const userStore = useUserStore()
const { profile } = storeToRefs(userStore)
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const perfil = ref<EstabelecimentoPerfilCompleto | null>(null)
const loadError = ref<string | null>(null)
const loadingPerfil = ref(false)
const saveSuccess = ref<string | null>(null)

const activeTab = ref<LojaPerfilTabId>('informacoes')
const editingSection = ref<EditingSection>(null)

const savingBasico = ref(false)
const basicoError = ref<string | null>(null)
const nomeDraft = ref('')
const logoDraft = ref<string | null>(null)
const logoError = ref<string | null>(null)
const categorias = ref<EstabelecimentoCategoria[]>([])
const categoriaIdDraft = ref('')
const tipoCategoria = computed(() =>
  negocioStore.tipoAssinatura === 'ProfissionalAutonomo'
    ? ('ProfissionalAutonomo' as const)
    : ('Estabelecimento' as const),
)
const categoriaOptions = computed(() =>
  opcoesCategoriaDoTipo(categorias.value, tipoCategoria.value),
)
const categoriaPlaceholder = computed(() => placeholderCategoria(tipoCategoria.value))

const savingEndereco = ref(false)
const enderecoError = ref<string | null>(null)
const endereco = ref<EnderecoFormFields>(emptyEnderecoFormFields())

const linkCopied = ref(false)
const modulosExpandidos = ref(false)

const logoPreview = computed(
  () => logoDraft.value ?? perfil.value?.logo ?? estabelecimentoAtivo.value?.logo ?? null,
)
const nomeExibido = computed(() => perfil.value?.nome ?? estabelecimentoAtivo.value?.nome ?? '')

const enderecoIncompleto = computed(
  () => perfil.value?.endereco != null && perfil.value.endereco.enderecoCompleto === false,
)

const temEndereco = computed(() => Boolean(perfil.value?.endereco))

const linkPublico = computed(() => {
  if (!estabelecimentoAtivo.value?.publicGuid) return ''
  return lojaAgendarUrl(estabelecimentoAtivo.value.publicGuid)
})

const linkPublicoExibido = computed(() =>
  linkPublico.value.replace(/^https?:\/\//i, ''),
)

const enderecoLinha1 = computed(() => {
  const e = perfil.value?.endereco
  if (!e) return ''
  const partes = [
    e.logradouro,
    e.numero ? `nº ${e.numero}` : '',
    e.bairro ? `- ${e.bairro}` : '',
  ]
  return partes.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
})

const enderecoLinha2 = computed(() => {
  const e = perfil.value?.endereco
  if (!e) return ''
  const cidadeUf =
    e.cidade && e.estado ? `${e.cidade}/${e.estado}` : e.cidade || e.estado || ''
  const cep = e.cep ? `CEP ${maskCep(e.cep.replace(/\D/g, ''))}` : ''
  return [cidadeUf, cep].filter(Boolean).join(' — ')
})

const roleExibido = computed(() => {
  const raw = role.value ?? estabelecimentoAtivo.value?.role
  return raw ? establishmentRoleLabel(raw) : '—'
})

const planoExibido = computed(() => {
  const nome = planoNome.value?.trim()
  if (!nome) return '—'
  return nome.toLowerCase().startsWith('plano') ? nome : nome
})

const renovacaoExibida = computed(() => formatDate(proximaDataVencimento.value) || '—')

const telefoneExibido = computed(() => {
  const tel = perfil.value?.telefone
  if (!tel) return '—'
  return formatTelefone(tel) || telefoneLocalFromApi(tel) || '—'
})

const emailExibido = computed(() => perfil.value?.email?.trim() || '—')

const responsavelNome = computed(() => profile.value?.nome?.trim() || '—')

const modulosLabels = computed(() =>
  labelModulos(estabelecimentoAtivo.value?.modulos ?? []),
)

const modulosCount = computed(() => modulosLabels.value.length)

const pageLoading = computed(
  () => (loading.value && !ready.value) || loadingPerfil.value,
)

async function carregarCategorias() {
  try {
    categorias.value = await publicoService.listarCategorias(tipoCategoria.value)
  } catch {
    categorias.value = []
  }
}

function dash(value?: string | null): string {
  const trimmed = value?.trim()
  return trimmed ? trimmed : '—'
}

function formatDate(value?: string | null): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('pt-BR')
}

function sincronizarContextoNegocio(atualizado: EstabelecimentoPerfilCompleto) {
  negocioStore.patchEstabelecimentoAtivo({
    nome: atualizado.nome,
    logo: atualizado.logo,
  })
}

function selectTab(id: string) {
  if (editingSection.value) cancelEditing()
  saveSuccess.value = null
  activeTab.value = id as LojaPerfilTabId
}

function cancelEditing() {
  editingSection.value = null
  basicoError.value = null
  logoError.value = null
  enderecoError.value = null
}

function startEditBasico() {
  nomeDraft.value = nomeExibido.value
  logoDraft.value = perfil.value?.logo ?? estabelecimentoAtivo.value?.logo ?? null
  categoriaIdDraft.value = sugerirCategoriaId(
    categorias.value,
    tipoCategoria.value,
    perfil.value?.categoriaId ? String(perfil.value.categoriaId) : '',
  )
  logoError.value = null
  basicoError.value = null
  saveSuccess.value = null
  editingSection.value = 'basico'
}

function startEditEndereco() {
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
  saveSuccess.value = null
  editingSection.value = 'endereco'
}

async function copiarLinkPublico() {
  if (!linkPublico.value) return
  try {
    await navigator.clipboard.writeText(linkPublico.value)
    linkCopied.value = true
    notifications.push('success', 'Link copiado para a área de transferência!')
    window.setTimeout(() => {
      linkCopied.value = false
    }, 2000)
  } catch {
    notifications.push('error', 'Não foi possível copiar o link.')
  }
}

function abrirLinkPublico() {
  if (!linkPublico.value) return
  window.open(linkPublico.value, '_blank', 'noopener,noreferrer')
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
    editingSection.value = null
    saveSuccess.value = 'Informações da loja atualizadas.'
    notifications.push('success', 'Informações da loja atualizadas.')
  } catch (err) {
    basicoError.value = resolveError(err)
  } finally {
    savingBasico.value = false
  }
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
    editingSection.value = null
    saveSuccess.value = 'Endereço atualizado com sucesso.'
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

watch(activeTab, () => {
  if (editingSection.value) cancelEditing()
})
</script>

<template>
  <div class="perfil-page loja-perfil" data-tour="store-profile-page">
    <header class="perfil-page__header flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <h1 class="perfil-page__title">Perfil do estabelecimento</h1>
        <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
          Edite nome, logo e endereço da sua loja.
        </p>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <GlowGuideLauncher class="max-sm:hidden" @click="startPageTutorial" />
        <GlowGuideLauncher class="sm:hidden" compact @click="startPageTutorial" />
      </div>
    </header>

    <ContentAlert v-if="contextError" variant="error" compact>{{ contextError }}</ContentAlert>
    <ContentAlert v-else-if="loadError" variant="error" compact>{{ loadError }}</ContentAlert>
    <ContentAlert v-else-if="saveSuccess" variant="success" compact>{{ saveSuccess }}</ContentAlert>

    <ContentAlert
      v-if="enderecoIncompleto && editingSection !== 'endereco' && !pageLoading"
      variant="warning"
      title="Endereço incompleto"
      compact
    >
      Complete seu endereço para aparecer na busca por proximidade dos clientes.
    </ContentAlert>

    <div v-if="pageLoading" class="loja-perfil-skeleton" aria-busy="true" aria-label="Carregando perfil">
      <div class="loja-perfil-skeleton__tabs" />
      <div class="loja-perfil-skeleton__grid">
        <div class="loja-perfil-skeleton__card">
          <div class="loja-perfil-skeleton__line loja-perfil-skeleton__line--lg" />
          <div class="loja-perfil-skeleton__line loja-perfil-skeleton__line--sm" />
          <div class="loja-perfil-skeleton__logo-row">
            <div class="loja-perfil-skeleton__logo" />
            <div class="min-w-0 flex-1 space-y-2">
              <div class="loja-perfil-skeleton__line loja-perfil-skeleton__line--md" />
              <div class="loja-perfil-skeleton__line loja-perfil-skeleton__line--sm" />
            </div>
          </div>
        </div>
        <div class="loja-perfil-skeleton__card">
          <div class="loja-perfil-skeleton__line loja-perfil-skeleton__line--lg" />
          <div class="loja-perfil-skeleton__line loja-perfil-skeleton__line--sm" />
          <div class="loja-perfil-skeleton__line loja-perfil-skeleton__line--full" />
          <div class="loja-perfil-skeleton__line loja-perfil-skeleton__line--md" />
        </div>
      </div>
      <div class="loja-perfil-skeleton__card">
        <div class="loja-perfil-skeleton__line loja-perfil-skeleton__line--lg" />
        <div class="loja-perfil-skeleton__info-grid">
          <div v-for="n in 6" :key="n" class="loja-perfil-skeleton__info">
            <div class="loja-perfil-skeleton__icon" />
            <div class="min-w-0 flex-1 space-y-2">
              <div class="loja-perfil-skeleton__line loja-perfil-skeleton__line--sm" />
              <div class="loja-perfil-skeleton__line loja-perfil-skeleton__line--md" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <template v-else-if="estabelecimentoAtivo">
      <PerfilTabNav
        :tabs="TABS"
        :active-id="activeTab"
        variant="standalone"
        aria-label="Seções do perfil do estabelecimento"
        @select="selectTab"
      />

      <div class="perfil-content-panel" role="tabpanel">
        <Transition name="perfil-tab-panel" mode="out-in">
          <!-- Tab: Informações da loja -->
          <div v-if="activeTab === 'informacoes'" key="informacoes" class="loja-perfil-stack">
            <div class="loja-perfil-top-grid">
              <PerfilSectionCard
                title="Informações da loja"
                description="Nome, logo e detalhes principais exibidos para seus clientes."
                editable
                :editing="editingSection === 'basico'"
                @edit="startEditBasico"
              >
                <form
                  v-if="editingSection === 'basico'"
                  class="perfil-edit-form"
                  @submit.prevent="salvarBasico"
                >
                  <ContentAlert v-if="basicoError" variant="error" compact>
                    {{ basicoError }}
                  </ContentAlert>
                  <ContentAlert v-if="logoError" variant="error" compact>
                    {{ logoError }}
                  </ContentAlert>

                  <BaseInput
                    v-model="nomeDraft"
                    label="Nome da loja"
                    placeholder="Ex.: Studio Glow Beauty"
                    autocomplete="organization"
                  />

                  <div class="space-y-3">
                    <span class="block text-sm font-medium text-glow-text">Logo</span>
                    <div v-if="logoPreview" class="flex items-center gap-4">
                      <img
                        :src="logoPreview"
                        :alt="nomeDraft || 'Logo da loja'"
                        class="loja-perfil-logo"
                      />
                      <p class="font-urbanist text-sm text-glow-text-subtle">
                        Pré-visualização da logo atual.
                      </p>
                    </div>
                    <AuthAvatarUpload
                      label="Alterar imagem"
                      @change="onLogoChange"
                      @error="(msg) => (logoError = msg)"
                    />
                  </div>

                  <BaseSelect
                    v-model="categoriaIdDraft"
                    :label="
                      negocioStore.ehProfissionalAutonomo
                        ? 'Área de atuação'
                        : 'Categoria do estabelecimento'
                    "
                    :options="categoriaOptions"
                    :placeholder="categoriaPlaceholder"
                  />

                  <div class="perfil-edit-form__actions">
                    <BaseButton type="button" variant="ghost" :disabled="savingBasico" @click="cancelEditing">
                      Cancelar
                    </BaseButton>
                    <BaseButton type="submit" :loading="savingBasico">
                      Salvar alterações
                    </BaseButton>
                  </div>
                </form>

                <div v-else class="loja-perfil-store">
                  <div class="loja-perfil-store__main">
                    <div v-if="logoPreview" class="loja-perfil-logo shrink-0 overflow-hidden">
                      <img
                        :src="logoPreview"
                        :alt="nomeExibido"
                        class="size-full object-cover"
                      />
                    </div>
                    <div
                      v-else
                      class="loja-perfil-logo loja-perfil-logo--empty flex shrink-0 items-center justify-center"
                    >
                      <Store class="size-8 text-glow-text-subtle" aria-hidden="true" />
                    </div>

                    <div class="min-w-0 flex-1">
                      <div class="flex flex-wrap items-center gap-2.5">
                        <h3 class="font-satoshi text-lg font-bold text-glow-text sm:text-xl">
                          {{ dash(nomeExibido) }}
                        </h3>
                        <span
                          class="perfil-badge"
                          :class="assinaturaAtiva ? 'perfil-badge--success' : 'perfil-badge--danger'"
                        >
                          <span
                            class="loja-perfil-status-dot"
                            :class="assinaturaAtiva ? 'loja-perfil-status-dot--ok' : 'loja-perfil-status-dot--off'"
                          />
                          {{ assinaturaAtiva ? 'Ativa' : 'Inativa' }}
                        </span>
                      </div>
                      <p class="mt-1.5 font-urbanist text-sm text-glow-text-subtle">
                        Nome e logo exibidos para clientes no app.
                      </p>
                      <BaseButton
                        class="mt-4"
                        variant="secondary"
                        size="sm"
                        @click="startEditBasico"
                      >
                        <Camera class="mr-1.5 size-3.5" aria-hidden="true" />
                        {{ logoPreview ? 'Editar informações' : 'Adicionar logo' }}
                      </BaseButton>
                    </div>
                  </div>

                  <p v-if="!logoPreview" class="mt-4 font-urbanist text-sm text-glow-text-subtle">
                    Nenhuma logo cadastrada.
                  </p>
                </div>
              </PerfilSectionCard>

              <PerfilSectionCard
                title="Endereço da loja"
                description="Endereço utilizado para localização e dados fiscais."
                editable
                :editing="editingSection === 'endereco'"
                @edit="startEditEndereco"
              >
                <form
                  v-if="editingSection === 'endereco'"
                  class="perfil-edit-form"
                  @submit.prevent="salvarEndereco"
                >
                  <ContentAlert v-if="enderecoError" variant="error" compact>
                    {{ enderecoError }}
                  </ContentAlert>
                  <EnderecoForm v-model="endereco" variant="dashboard" id-prefix="perfil-end" />
                  <div class="perfil-edit-form__actions">
                    <BaseButton
                      type="button"
                      variant="ghost"
                      :disabled="savingEndereco"
                      @click="cancelEditing"
                    >
                      Cancelar
                    </BaseButton>
                    <BaseButton type="submit" :loading="savingEndereco">
                      Salvar alterações
                    </BaseButton>
                  </div>
                </form>

                <div v-else-if="temEndereco" class="loja-perfil-address">
                  <span class="loja-perfil-icon" aria-hidden="true">
                    <MapPin class="size-5" />
                  </span>
                  <div class="min-w-0">
                    <span class="perfil-field__label">Endereço completo</span>
                    <p class="perfil-field__value">{{ enderecoLinha1 }}</p>
                    <p v-if="enderecoLinha2" class="mt-0.5 font-urbanist text-sm text-glow-text">
                      {{ enderecoLinha2 }}
                    </p>
                    <p
                      v-if="perfil?.endereco?.complemento"
                      class="mt-1 font-urbanist text-xs text-glow-text-subtle"
                    >
                      {{ perfil.endereco.complemento }}
                    </p>
                  </div>
                </div>

                <div v-else class="loja-perfil-empty">
                  <p class="font-urbanist text-sm font-medium text-glow-text">
                    Nenhum endereço cadastrado.
                  </p>
                  <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
                    Adicione o endereço da sua loja para que seus clientes consigam encontrá-la com
                    facilidade.
                  </p>
                  <BaseButton class="mt-4" variant="secondary" size="sm" @click="startEditEndereco">
                    <Plus class="mr-1.5 size-3.5" aria-hidden="true" />
                    Adicionar endereço
                  </BaseButton>
                </div>
              </PerfilSectionCard>
            </div>

            <PerfilSectionCard
              title="Sua conta neste negócio"
              description="Responsável, dados de contato, plano e módulos ativos."
            >
              <div class="loja-perfil-info-grid">
                <div class="loja-perfil-info">
                  <span class="loja-perfil-icon" aria-hidden="true">
                    <UsersRound class="size-5" />
                  </span>
                  <div class="min-w-0">
                    <span class="perfil-field__label">Seu papel</span>
                    <p class="perfil-field__value">{{ roleExibido }}</p>
                  </div>
                </div>

                <div class="loja-perfil-info">
                  <span class="loja-perfil-icon" aria-hidden="true">
                    <Mail class="size-5" />
                  </span>
                  <div class="min-w-0">
                    <span class="perfil-field__label">E-mail</span>
                    <p class="perfil-field__value break-all">{{ emailExibido }}</p>
                  </div>
                </div>

                <div class="loja-perfil-info">
                  <span class="loja-perfil-icon" aria-hidden="true">
                    <Phone class="size-5" />
                  </span>
                  <div class="min-w-0">
                    <span class="perfil-field__label">Telefone</span>
                    <p class="perfil-field__value">{{ telefoneExibido }}</p>
                  </div>
                </div>

                <div class="loja-perfil-info">
                  <span class="loja-perfil-icon" aria-hidden="true">
                    <Crown class="size-5" />
                  </span>
                  <div class="min-w-0">
                    <span class="perfil-field__label">Plano</span>
                    <p class="perfil-field__value">{{ planoExibido }}</p>
                  </div>
                </div>

                <div class="loja-perfil-info">
                  <span class="loja-perfil-icon" aria-hidden="true">
                    <BadgeCheck class="size-5" />
                  </span>
                  <div class="min-w-0">
                    <span class="perfil-field__label">Assinatura</span>
                    <p class="perfil-field__value">
                      {{ assinaturaAtiva ? 'Ativa' : 'Inativa' }}
                    </p>
                  </div>
                </div>

                <div class="loja-perfil-info">
                  <span class="loja-perfil-icon" aria-hidden="true">
                    <CalendarDays class="size-5" />
                  </span>
                  <div class="min-w-0">
                    <span class="perfil-field__label">Renovação</span>
                    <p class="perfil-field__value">{{ renovacaoExibida }}</p>
                  </div>
                </div>
              </div>

              <div class="loja-perfil-modules">
                <div class="loja-perfil-info">
                  <span class="loja-perfil-icon" aria-hidden="true">
                    <Blocks class="size-5" />
                  </span>
                  <div class="min-w-0 flex-1">
                    <span class="perfil-field__label">Módulos ativos</span>
                    <template v-if="modulosCount === 0">
                      <p class="perfil-field__value">Nenhum módulo ativo</p>
                    </template>
                    <template v-else-if="!modulosExpandidos && modulosCount > 6">
                      <div class="mt-1 flex flex-wrap items-center justify-between gap-2">
                        <p class="perfil-field__value">{{ modulosCount }} módulos ativos</p>
                        <button
                          type="button"
                          class="perfil-field__action mt-0"
                          @click="modulosExpandidos = true"
                        >
                          Ver módulos →
                        </button>
                      </div>
                    </template>
                    <template v-else>
                      <p class="perfil-field__value leading-relaxed">
                        {{ modulosLabels.join(', ') }}
                      </p>
                      <button
                        v-if="modulosCount > 6"
                        type="button"
                        class="perfil-field__action"
                        @click="modulosExpandidos = false"
                      >
                        Ocultar
                      </button>
                    </template>
                  </div>
                </div>
              </div>
            </PerfilSectionCard>

            <LojaLinkPublicoCard
              :link-url="linkPublico"
              :link-label="linkPublicoExibido"
              :ativo="Boolean(assinaturaAtiva)"
              :copied="linkCopied"
              @copy="copiarLinkPublico"
              @open="abrirLinkPublico"
            />
          </div>

          <!-- Tab: Conta e assinatura -->
          <div v-else-if="activeTab === 'conta'" key="conta" class="loja-perfil-stack">
            <PerfilSectionCard
              title="Conta e assinatura"
              description="Plano, status e responsável pela conta deste estabelecimento."
            >
              <div class="perfil-fields">
                <div class="perfil-field">
                  <span class="perfil-field__label">Plano atual</span>
                  <p class="perfil-field__value">
                    <span v-if="planoNome" class="perfil-badge perfil-badge--plan">
                      {{ planoExibido }}
                    </span>
                    <template v-else>—</template>
                  </p>
                </div>
                <div class="perfil-field">
                  <span class="perfil-field__label">Status da assinatura</span>
                  <p class="perfil-field__value">
                    <span
                      class="perfil-badge"
                      :class="assinaturaAtiva ? 'perfil-badge--success' : 'perfil-badge--danger'"
                    >
                      <span
                        class="loja-perfil-status-dot"
                        :class="assinaturaAtiva ? 'loja-perfil-status-dot--ok' : 'loja-perfil-status-dot--off'"
                      />
                      {{ assinaturaAtiva ? 'Ativa' : 'Inativa' }}
                    </span>
                  </p>
                </div>
                <div class="perfil-field">
                  <span class="perfil-field__label">Próxima renovação</span>
                  <p class="perfil-field__value">{{ renovacaoExibida }}</p>
                </div>
                <div class="perfil-field">
                  <span class="perfil-field__label">Responsável pela conta</span>
                  <p class="perfil-field__value">{{ responsavelNome }}</p>
                </div>
                <div class="perfil-field">
                  <span class="perfil-field__label">Seu papel</span>
                  <p class="perfil-field__value">{{ roleExibido }}</p>
                </div>
                <div class="perfil-field">
                  <span class="perfil-field__label">E-mail</span>
                  <p class="perfil-field__value break-all">{{ emailExibido }}</p>
                </div>
              </div>

              <div class="mt-6">
                <RouterLink :to="ROUTE_PATHS.CONFIG_ASSINATURA">
                  <BaseButton variant="secondary">Gerenciar assinatura</BaseButton>
                </RouterLink>
              </div>
            </PerfilSectionCard>
          </div>

          <!-- Tab: Links e agendamentos -->
          <div v-else-if="activeTab === 'links'" key="links" class="loja-perfil-stack">
            <LojaLinkPublicoCard
              :link-url="linkPublico"
              :link-label="linkPublicoExibido"
              :ativo="Boolean(assinaturaAtiva)"
              :copied="linkCopied"
              @copy="copiarLinkPublico"
              @open="abrirLinkPublico"
            />
          </div>

          <!-- Tab: Configurações -->
          <div v-else key="configuracoes" class="loja-perfil-stack">
            <PerfilSectionCard
              title="Módulos do estabelecimento"
              description="Recursos ativos neste negócio conforme o seu plano."
            >
              <div class="loja-perfil-info">
                <span class="loja-perfil-icon" aria-hidden="true">
                  <Blocks class="size-5" />
                </span>
                <div class="min-w-0 flex-1">
                  <span class="perfil-field__label">Módulos ativos</span>
                  <p v-if="modulosCount === 0" class="perfil-field__value">Nenhum módulo ativo</p>
                  <ul v-else class="loja-perfil-module-list">
                    <li v-for="modulo in modulosLabels" :key="modulo">{{ modulo }}</li>
                  </ul>
                </div>
              </div>
            </PerfilSectionCard>

            <PerfilSectionCard
              v-if="perfil?.categoria"
              title="Categoria"
              description="Categoria usada na descoberta e no marketplace."
            >
              <div class="perfil-field">
                <span class="perfil-field__label">Categoria cadastrada</span>
                <p class="perfil-field__value">{{ perfil.categoria }}</p>
              </div>
              <p class="mt-3 font-urbanist text-xs text-glow-text-subtle">
                Para alterar a categoria, edite as informações da loja na primeira aba.
              </p>
            </PerfilSectionCard>
          </div>
        </Transition>
      </div>
    </template>
  </div>
</template>

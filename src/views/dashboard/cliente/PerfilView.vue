<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import type { Component } from 'vue'
import {
  AlertTriangle,
  Bell,
  Check,
  CircleCheck,
  Clock3,
  Mail,
  Settings,
  Shield,
  Smartphone,
  User,
} from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import SegmentedControl from '@/components/ui/SegmentedControl.vue'
import TelefoneInput from '@/components/ui/TelefoneInput.vue'
import ContentAlert from '@/components/feedback/ContentAlert.vue'
import AuthPasswordToggle from '@/components/auth/AuthPasswordToggle.vue'
import PerfilSidebar from '@/components/perfil/PerfilSidebar.vue'
import PerfilPasswordRules from '@/components/perfil/PerfilPasswordRules.vue'
import PerfilTabNav from '@/components/perfil/PerfilTabNav.vue'
import PerfilSectionCard from '@/components/perfil/PerfilSectionCard.vue'
import { useUserStore } from '@/stores/user.store'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useFetchOnce } from '@/composables/useFetchOnce'
import { useWhatsAppConfirmacao } from '@/composables/useWhatsAppConfirmacao'
import { useApiError } from '@/composables/useApiError'
import { getUserRoleLabel } from '@/utils/userRoleLabel'
import { compressAvatarFile } from '@/utils/avatarFile'
import { getUnmetPasswordRules } from '@/utils/passwordRules'
import { calcularProgressoPerfil, formatUltimaAtualizacao } from '@/utils/perfilUtils'
import type { UpdateProfilePayload } from '@/types/user.types'
import { formatTelefone, telefoneLocalFromApi, telefoneToApi } from '@/utils/formatters'
import GlowGuideLauncher from '@/tutorials/components/GlowGuideLauncher.vue'
import { usePageTutorial } from '@/tutorials/hooks/usePageTutorial'

type PerfilTabId = 'informacoes' | 'conta' | 'seguranca' | 'notificacoes'
type EditingSection = 'pessoal' | null

const { startPageTutorial } = usePageTutorial('profile')

const TABS: { id: PerfilTabId; label: string; icon: Component }[] = [
  { id: 'informacoes', label: 'Perfil', icon: User },
  { id: 'conta', label: 'Conta', icon: Settings },
  { id: 'seguranca', label: 'Segurança', icon: Shield },
  { id: 'notificacoes', label: 'Notificações', icon: Bell },
]

const userStore = useUserStore()
const notificationsStore = useNotificationsStore()
const { profile, saving, changingPassword, regeneratingCodigo } = storeToRefs(userStore)
const { planoNome, proximaDataVencimento } = useNegocioContext()
const { resolveError } = useApiError()

const activeTab = ref<PerfilTabId>('informacoes')
const editingSection = ref<EditingSection>(null)

const form = reactive({ nome: '', telefone: '', sexo: '' as '' | 'Masculino' | 'Feminino' })
const SEXO_OPTIONS = [
  { value: 'Masculino', label: 'Masculino' },
  { value: 'Feminino', label: 'Feminino' },
]
const passwordForm = reactive({ senha: '', confirmarSenha: '' })

const profileError = ref<string | null>(null)
const profileSuccess = ref(false)
const passwordError = ref<string | null>(null)
const passwordSuccess = ref(false)
const passwordExpanded = ref(false)
const codigoCopied = ref(false)
const savingAvatar = ref(false)

const mostrarNovaSenha = ref(false)
const mostrarConfirmarSenha = ref(false)

const notificacoes = reactive({
  email: true,
  whatsapp: true,
  push: false,
  sms: false,
})

const {
  instrucoes,
  solicitando,
  polling,
  pollError,
  solicitarConfirmacao,
  toggleOptIn,
} = useWhatsAppConfirmacao()

const { execute: loadProfile } = useFetchOnce('cliente-perfil')

const whatsAppState = computed(() => {
  if (!profile.value?.telefone) return 'sem-telefone' as const
  if (profile.value.whatsAppConfirmado) return 'confirmado' as const
  if (profile.value.whatsAppPendenteConfirmacao || instrucoes.value || polling.value) {
    return 'pendente' as const
  }
  return 'nao-confirmado' as const
})

const progressoPerfil = computed(() => calcularProgressoPerfil(profile.value))
const roleLabel = computed(() => getUserRoleLabel(profile.value?.role))
const telefoneExibido = computed(() =>
  profile.value?.telefone ? formatTelefone(profile.value.telefone) : '',
)
const membroDesde = computed(() => formatDate(profile.value?.createdAt))
const planoExibido = computed(() => formatPlanoNome(planoNome.value))
const renovacaoExibida = computed(() => formatDate(proximaDataVencimento.value))

const canChangePassword = computed(() => {
  if (!passwordForm.senha || !passwordForm.confirmarSenha) return false
  if (passwordForm.senha !== passwordForm.confirmarSenha) return false
  return getUnmetPasswordRules(passwordForm.senha).length === 0
})

const resumoItems = computed(() => {
  const contaAtiva = profile.value?.ativo !== false
  const emailOk = Boolean(profile.value?.email)
  const whatsOk = whatsAppState.value === 'confirmado'
  const progresso = progressoPerfil.value

  return [
    {
      id: 'conta',
      icon: CircleCheck,
      tone: contaAtiva ? 'ok' : 'warn',
      title: contaAtiva ? 'Conta ativa' : 'Conta inativa',
      desc: contaAtiva ? 'Sua conta está ativa' : 'Sua conta precisa de atenção',
      status: contaAtiva ? 'Ativo' : 'Inativa',
    },
    {
      id: 'email',
      icon: Mail,
      tone: emailOk ? 'ok' : 'warn',
      title: 'E-mail confirmado',
      desc: emailOk ? 'Seu e-mail está verificado' : 'Confirme seu e-mail',
      status: emailOk ? 'Confirmado' : 'Pendente',
    },
    {
      id: 'whatsapp',
      icon: Smartphone,
      tone: whatsOk ? 'ok' : 'warn',
      title: whatsOk ? 'WhatsApp confirmado' : 'WhatsApp pendente',
      desc: whatsOk ? 'Número verificado' : 'Confirme seu número',
      status: whatsOk ? 'Confirmado' : 'Pendente',
    },
    {
      id: 'perfil',
      icon: Clock3,
      tone: progresso >= 100 ? 'ok' : 'primary',
      title: 'Perfil completo',
      desc: progresso >= 100 ? 'Tudo certo por aqui' : 'Continue assim!',
      status: `${progresso}%`,
    },
  ] as const
})

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

function formatPlanoNome(nome?: string | null): string {
  if (!nome?.trim()) return ''
  return nome.toLowerCase().startsWith('plano') ? nome : `Plano ${nome}`
}

function selectTab(id: string) {
  if (editingSection.value) cancelEditing()
  activeTab.value = id as PerfilTabId
}

function startEdit(section: Exclude<EditingSection, null>) {
  if (section === 'pessoal') syncFormFromProfile()
  profileError.value = null
  profileSuccess.value = false
  editingSection.value = section
}

function cancelEditing() {
  if (editingSection.value === 'pessoal') syncFormFromProfile()
  editingSection.value = null
  profileError.value = null
}

function handleAlterarEmail() {
  notificationsStore.push(
    'info',
    'Este e-mail é usado para login e alertas. Para alterá-lo, entre em contato com o suporte da plataforma.',
  )
}

function syncFormFromProfile() {
  if (!profile.value) return
  form.nome = profile.value.nome
  form.telefone = telefoneLocalFromApi(profile.value.telefone)
  form.sexo = profile.value?.sexo ?? ''
  notificacoes.whatsapp = profile.value.whatsAppOptIn ?? true
}

async function onAvatarChange(file: File) {
  profileError.value = null
  profileSuccess.value = false
  savingAvatar.value = true
  try {
    const compressed = await compressAvatarFile(file)
    await userStore.updateProfile({
      avatarBase64: compressed.dataUrl,
      avatarContentType: compressed.contentType,
    })
    profileSuccess.value = true
  } catch (err) {
    profileError.value = resolveError(err, 'Não foi possível atualizar a foto.')
  } finally {
    savingAvatar.value = false
  }
}

function onAvatarError(message: string) {
  profileError.value = message
}

onMounted(async () => {
  await loadProfile(() => userStore.fetchMe(true))
  syncFormFromProfile()
})

watch(activeTab, () => {
  if (editingSection.value) cancelEditing()
})

async function handleSaveProfile() {
  profileError.value = null
  profileSuccess.value = false

  try {
    const payload: UpdateProfilePayload = {
      nome: form.nome.trim(),
      telefone: telefoneToApi(form.telefone),
      sexo: form.sexo || null,
    }

    await userStore.updateProfile(payload)
    syncFormFromProfile()
    profileSuccess.value = true
    editingSection.value = null
  } catch (err) {
    profileError.value = resolveError(err, 'Não foi possível salvar o perfil.')
  }
}

async function handleChangePassword() {
  passwordError.value = null
  passwordSuccess.value = false

  if (passwordForm.senha !== passwordForm.confirmarSenha) {
    passwordError.value = 'As senhas não coincidem.'
    return
  }

  const unmet = getUnmetPasswordRules(passwordForm.senha)
  if (unmet.length > 0) {
    passwordError.value = 'A nova senha não atende aos requisitos.'
    return
  }

  try {
    await userStore.changePassword({
      senha: passwordForm.senha,
      confirmarSenha: passwordForm.confirmarSenha,
    })
    passwordForm.senha = ''
    passwordForm.confirmarSenha = ''
    passwordSuccess.value = true
    passwordExpanded.value = false
  } catch (err) {
    passwordError.value = resolveError(err, 'Não foi possível alterar a senha.')
  }
}

async function handleCopyCodigo() {
  const codigo = profile.value?.codigoAgendamento
  if (!codigo) return
  try {
    await navigator.clipboard.writeText(codigo)
    codigoCopied.value = true
    notificationsStore.push('success', 'Código copiado.')
    window.setTimeout(() => {
      codigoCopied.value = false
    }, 2000)
  } catch {
    notificationsStore.push('error', 'Não foi possível copiar o código.')
  }
}

async function handleRegenerarCodigo() {
  try {
    await userStore.regenerarCodigoAgendamento()
    notificationsStore.push('success', 'Novo código gerado. O anterior deixa de funcionar.')
  } catch (err) {
    notificationsStore.push('error', resolveError(err, 'Não foi possível regenerar o código.'))
  }
}

async function handleOptInChange(event: Event) {
  const target = event.target as HTMLInputElement
  try {
    await toggleOptIn(target.checked)
    notificacoes.whatsapp = target.checked
  } catch (err) {
    profileError.value = resolveError(err, 'Não foi possível atualizar alertas.')
    target.checked = !target.checked
  }
}

async function handleSolicitarWhatsApp() {
  profileError.value = null
  try {
    await solicitarConfirmacao()
  } catch (err) {
    profileError.value = resolveError(err, 'Não foi possível solicitar confirmação.')
  }
}
</script>

<template>
  <div class="perfil-page" data-tour="profile-page">
    <header class="perfil-page__header flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <h1 class="perfil-page__title">Meu perfil</h1>
        <div v-if="profile" class="perfil-page__meta">
          <span>{{ profile.ativo ? 'Conta ativa' : 'Conta inativa' }}</span>
          <span class="perfil-page__meta-dot" />
          <span>Perfil {{ progressoPerfil }}% completo</span>
          <span class="perfil-page__meta-dot" />
          <span>Última atualização {{ formatUltimaAtualizacao(profile.updatedAt) }}</span>
        </div>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <GlowGuideLauncher class="max-sm:hidden" @click="startPageTutorial" />
        <GlowGuideLauncher class="sm:hidden" compact @click="startPageTutorial" />
      </div>
    </header>

    <template v-if="profile">
      <ContentAlert v-if="profileError" variant="error" compact>{{ profileError }}</ContentAlert>
      <ContentAlert v-else-if="profileSuccess" variant="success" compact>
        Perfil atualizado com sucesso.
      </ContentAlert>

      <section class="perfil-hero">
        <PerfilSidebar
          :current-src="profile.avatarBase64"
          :name="profile.nome"
          :role-label="roleLabel"
          :ativo="profile.ativo"
          :email="profile.email"
          :telefone="telefoneExibido"
          :membro-desde="membroDesde"
          :progresso="progressoPerfil"
          :saving="savingAvatar"
          @change="onAvatarChange"
          @error="onAvatarError"
        />
        <PerfilTabNav :tabs="TABS" :active-id="activeTab" @select="selectTab" />
      </section>

      <div class="perfil-content-panel" role="tabpanel">
        <Transition name="perfil-tab-panel" mode="out-in">
          <div v-if="activeTab === 'informacoes'" key="informacoes" class="perfil-profile-grid">
            <PerfilSectionCard
              title="Informações pessoais"
              description="Seus dados pessoais e de contato."
              editable
              :editing="editingSection === 'pessoal'"
              @edit="startEdit('pessoal')"
            >
              <form
                v-if="editingSection === 'pessoal'"
                class="perfil-edit-form"
                @submit.prevent="handleSaveProfile"
              >
                <BaseInput v-model="form.nome" label="Nome completo" autocomplete="name" required />
                <TelefoneInput
                  v-model="form.telefone"
                  label="Telefone"
                  unified
                  :show-ddi-prefix="false"
                  hint="Formato: +55 (DDD) número"
                />
                <div class="flex flex-col gap-1.5">
                  <span class="text-sm font-medium text-glow-text">Sexo</span>
                  <SegmentedControl v-model="form.sexo" :options="SEXO_OPTIONS" aria-label="Sexo" />
                </div>
                <div class="perfil-readonly-field">
                  <span class="perfil-field__label">E-mail</span>
                  <p class="perfil-field__value">{{ profile.email }}</p>
                  <p class="perfil-field__hint">Utilizado para login e alertas</p>
                </div>
                <div class="perfil-edit-form__actions">
                  <BaseButton type="button" variant="ghost" @click="cancelEditing">Cancelar</BaseButton>
                  <BaseButton type="submit" :loading="saving">Salvar alterações</BaseButton>
                </div>
              </form>

              <div v-else class="perfil-fields">
                <div class="perfil-field">
                  <span class="perfil-field__label">Nome completo</span>
                  <p class="perfil-field__value">{{ dash(profile.nome) }}</p>
                </div>
                <div class="perfil-field">
                  <span class="perfil-field__label">E-mail</span>
                  <p class="perfil-field__value">{{ dash(profile.email) }}</p>
                  <span v-if="profile.email" class="perfil-field__status perfil-field__status--ok">
                    <Check class="size-3.5" aria-hidden="true" />
                    Confirmado
                  </span>
                </div>
                <div class="perfil-field">
                  <span class="perfil-field__label">Telefone</span>
                  <p class="perfil-field__value">{{ dash(telefoneExibido) }}</p>
                </div>
                <div class="perfil-field">
                  <span class="perfil-field__label">WhatsApp</span>
                  <template v-if="whatsAppState === 'confirmado'">
                    <p class="perfil-field__value">{{ dash(telefoneExibido) }}</p>
                    <span class="perfil-field__status perfil-field__status--ok">
                      <Check class="size-3.5" aria-hidden="true" />
                      Confirmado
                    </span>
                  </template>
                  <template v-else-if="whatsAppState === 'sem-telefone'">
                    <p class="perfil-field__value">—</p>
                  </template>
                  <template v-else>
                    <p class="perfil-field__value perfil-field__value--warn">
                      <AlertTriangle class="size-3.5 shrink-0" aria-hidden="true" />
                      Número não confirmado
                    </p>
                    <p v-if="pollError" class="perfil-field__hint perfil-field__hint--warn">{{ pollError }}</p>
                    <a
                      v-if="instrucoes?.linkWhatsApp"
                      :href="instrucoes.linkWhatsApp"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="perfil-field__action"
                    >
                      Abrir WhatsApp
                    </a>
                    <button
                      v-else
                      type="button"
                      class="perfil-field__action"
                      :disabled="solicitando"
                      @click="handleSolicitarWhatsApp"
                    >
                      Confirmar número
                    </button>
                    <a
                      v-if="instrucoes?.linkConfirmacao"
                      :href="instrucoes.linkConfirmacao"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="perfil-field__action"
                    >
                      Abrir link de confirmação
                    </a>
                    <span v-if="polling" class="perfil-field__hint">Aguardando confirmação…</span>
                  </template>
                </div>
                <div class="perfil-field">
                  <span class="perfil-field__label">Sexo</span>
                  <p class="perfil-field__value">{{ dash(profile.sexo) }}</p>
                </div>
              </div>
            </PerfilSectionCard>

            <PerfilSectionCard title="Resumo rápido" description="Uma visão geral do seu perfil.">
              <ul class="perfil-summary">
                <li
                  v-for="item in resumoItems"
                  :key="item.id"
                  class="perfil-summary__item"
                >
                  <span class="perfil-summary__icon" :class="`perfil-summary__icon--${item.tone}`">
                    <component :is="item.icon" class="size-4" aria-hidden="true" />
                  </span>
                  <div class="min-w-0 flex-1">
                    <p class="perfil-summary__title">{{ item.title }}</p>
                    <p class="perfil-summary__desc">{{ item.desc }}</p>
                  </div>
                  <span class="perfil-summary__status" :class="`perfil-summary__status--${item.tone}`">
                    {{ item.status }}
                  </span>
                </li>
              </ul>
            </PerfilSectionCard>

            <PerfilSectionCard
              title="Informações da conta"
              description="Dados relacionados à sua conta na plataforma."
            >
              <div class="perfil-fields">
                <div class="perfil-field">
                  <span class="perfil-field__label">Tipo de conta</span>
                  <p class="perfil-field__value">{{ dash(roleLabel) }}</p>
                </div>
                <div class="perfil-field">
                  <span class="perfil-field__label">Plano atual</span>
                  <p v-if="planoExibido" class="perfil-field__value">
                    <span class="perfil-badge perfil-badge--plan">{{ planoExibido }}</span>
                  </p>
                  <p v-else class="perfil-field__value">—</p>
                </div>
                <div class="perfil-field">
                  <span class="perfil-field__label">Status</span>
                  <p class="perfil-field__value">
                    <span
                      class="perfil-badge"
                      :class="profile.ativo ? 'perfil-badge--success' : 'perfil-badge--danger'"
                    >
                      {{ profile.ativo ? 'Ativa' : 'Inativa' }}
                    </span>
                  </p>
                </div>
                <div class="perfil-field">
                  <span class="perfil-field__label">Renovação</span>
                  <p class="perfil-field__value">{{ dash(renovacaoExibida) }}</p>
                </div>
                <div class="perfil-field">
                  <span class="perfil-field__label">Membro desde</span>
                  <p class="perfil-field__value">{{ dash(membroDesde) }}</p>
                </div>
                <div class="perfil-field">
                  <span class="perfil-field__label">Perfil completo</span>
                  <p class="perfil-field__value">{{ progressoPerfil }}%</p>
                </div>
              </div>
            </PerfilSectionCard>
          </div>

          <div v-else-if="activeTab === 'conta'" key="conta">
            <PerfilSectionCard
              title="Informações da conta"
              description="Dados relacionados à sua conta na plataforma."
            >
              <div class="perfil-fields">
                <div class="perfil-field">
                  <span class="perfil-field__label">Tipo de conta</span>
                  <p class="perfil-field__value">{{ dash(roleLabel) }}</p>
                </div>
                <div class="perfil-field">
                  <span class="perfil-field__label">Plano atual</span>
                  <p v-if="planoExibido" class="perfil-field__value">
                    <span class="perfil-badge perfil-badge--plan">{{ planoExibido }}</span>
                  </p>
                  <p v-else class="perfil-field__value">—</p>
                </div>
                <div class="perfil-field">
                  <span class="perfil-field__label">Status</span>
                  <p class="perfil-field__value">
                    <span
                      class="perfil-badge"
                      :class="profile.ativo ? 'perfil-badge--success' : 'perfil-badge--danger'"
                    >
                      {{ profile.ativo ? 'Ativa' : 'Inativa' }}
                    </span>
                  </p>
                </div>
                <div class="perfil-field">
                  <span class="perfil-field__label">Renovação</span>
                  <p class="perfil-field__value">{{ dash(renovacaoExibida) }}</p>
                </div>
                <div class="perfil-field">
                  <span class="perfil-field__label">E-mail</span>
                  <p class="perfil-field__value">{{ dash(profile.email) }}</p>
                  <button type="button" class="perfil-field__action" @click="handleAlterarEmail">
                    Alterar e-mail
                  </button>
                </div>
                <div class="perfil-field">
                  <span class="perfil-field__label">Membro desde</span>
                  <p class="perfil-field__value">{{ dash(membroDesde) }}</p>
                </div>
              </div>
            </PerfilSectionCard>
          </div>

          <div v-else-if="activeTab === 'seguranca'" key="seguranca">
            <PerfilSectionCard title="Segurança" description="Proteja o acesso à sua conta.">
              <div class="perfil-security">
                <div class="perfil-security__row">
                  <div>
                    <p class="perfil-security__label">Senha</p>
                    <p class="perfil-security__meta">Última alteração não disponível</p>
                  </div>
                  <BaseButton
                    variant="secondary"
                    size="sm"
                    @click="passwordExpanded = !passwordExpanded"
                  >
                    {{ passwordExpanded ? 'Cancelar' : 'Alterar senha' }}
                  </BaseButton>
                </div>

                <form
                  v-if="passwordExpanded"
                  class="perfil-password-form"
                  @submit.prevent="handleChangePassword"
                >
                  <ContentAlert v-if="passwordError" variant="error" compact>{{ passwordError }}</ContentAlert>
                  <div v-if="passwordSuccess" class="perfil-inline-alert perfil-inline-alert--success">
                    Senha alterada com sucesso.
                  </div>

                  <div class="perfil-password-form__grid">
                    <div class="relative [&_input]:pr-12">
                      <BaseInput
                        v-model="passwordForm.senha"
                        label="Nova senha"
                        :type="mostrarNovaSenha ? 'text' : 'password'"
                        autocomplete="new-password"
                        required
                      />
                      <AuthPasswordToggle
                        class="!bottom-[11px]"
                        :pressed="mostrarNovaSenha"
                        @click="mostrarNovaSenha = !mostrarNovaSenha"
                      />
                    </div>
                    <div class="relative [&_input]:pr-12">
                      <BaseInput
                        v-model="passwordForm.confirmarSenha"
                        label="Confirmar nova senha"
                        :type="mostrarConfirmarSenha ? 'text' : 'password'"
                        autocomplete="new-password"
                        required
                      />
                      <AuthPasswordToggle
                        class="!bottom-[11px]"
                        :pressed="mostrarConfirmarSenha"
                        @click="mostrarConfirmarSenha = !mostrarConfirmarSenha"
                      />
                    </div>
                  </div>

                  <PerfilPasswordRules :password="passwordForm.senha" />

                  <div class="perfil-password-form__actions">
                    <BaseButton type="submit" :loading="changingPassword" :disabled="!canChangePassword">
                      Atualizar senha
                    </BaseButton>
                  </div>
                </form>

                <div class="perfil-security__row">
                  <div class="min-w-0 flex-1">
                    <p class="perfil-security__label">Código de agendamento</p>
                    <p class="perfil-security__meta">
                      Use este código no link público da loja para agendar sem e-mail e senha.
                      A sessão dura 15 minutos.
                    </p>
                    <p
                      v-if="profile?.codigoAgendamento"
                      class="mt-2 font-mono text-base font-semibold tracking-wider text-glow-text"
                    >
                      {{ profile.codigoAgendamento }}
                    </p>
                    <p v-else class="mt-2 text-sm text-glow-text-subtle">
                      O código será gerado automaticamente ao salvar o perfil.
                    </p>
                  </div>
                  <div class="flex shrink-0 flex-wrap gap-2">
                    <BaseButton
                      variant="secondary"
                      size="sm"
                      :disabled="!profile?.codigoAgendamento"
                      @click="handleCopyCodigo"
                    >
                      {{ codigoCopied ? 'Copiado' : 'Copiar' }}
                    </BaseButton>
                    <BaseButton
                      variant="secondary"
                      size="sm"
                      :loading="regeneratingCodigo"
                      @click="handleRegenerarCodigo"
                    >
                      Regenerar
                    </BaseButton>
                  </div>
                </div>

                <div class="perfil-security__row perfil-security__row--muted">
                  <div>
                    <p class="perfil-security__label">Autenticação em dois fatores (2FA)</p>
                    <p class="perfil-security__meta">Desativado</p>
                  </div>
                  <BaseButton variant="secondary" size="sm" disabled>Ativar</BaseButton>
                </div>

                <div class="perfil-sessions">
                  <h3 class="perfil-sessions__title">Dispositivos conectados</h3>
                  <ul class="perfil-sessions__list">
                    <li class="perfil-sessions__item">
                      <div>
                        <p class="perfil-sessions__device">Windows · Chrome</p>
                        <p class="perfil-sessions__meta">Sessão atual · Agora</p>
                      </div>
                    </li>
                  </ul>
                  <p class="perfil-sessions__hint">Gerenciamento completo de sessões em breve.</p>
                </div>
              </div>
            </PerfilSectionCard>
          </div>

          <div v-else key="notificacoes">
            <PerfilSectionCard title="Notificações" description="Escolha como deseja ser avisado.">
              <ul class="perfil-prefs">
                <li class="perfil-prefs__item">
                  <div>
                    <p class="perfil-prefs__label">E-mail</p>
                    <p class="perfil-prefs__desc">Confirmações e atualizações da conta</p>
                  </div>
                  <input v-model="notificacoes.email" type="checkbox" class="perfil-toggle" disabled />
                </li>
                <li class="perfil-prefs__item">
                  <div>
                    <p class="perfil-prefs__label">WhatsApp</p>
                    <p class="perfil-prefs__desc">Lembretes de agendamento</p>
                  </div>
                  <input
                    type="checkbox"
                    class="perfil-toggle"
                    :checked="profile.whatsAppOptIn ?? false"
                    :disabled="whatsAppState !== 'confirmado'"
                    @change="handleOptInChange"
                  />
                </li>
                <li class="perfil-prefs__item">
                  <div>
                    <p class="perfil-prefs__label">Push</p>
                    <p class="perfil-prefs__desc">Notificações no navegador</p>
                  </div>
                  <input v-model="notificacoes.push" type="checkbox" class="perfil-toggle" disabled />
                </li>
                <li class="perfil-prefs__item">
                  <div>
                    <p class="perfil-prefs__label">SMS</p>
                    <p class="perfil-prefs__desc">Alertas por mensagem de texto</p>
                  </div>
                  <input v-model="notificacoes.sms" type="checkbox" class="perfil-toggle" disabled />
                </li>
              </ul>
            </PerfilSectionCard>
          </div>
        </Transition>
      </div>
    </template>
  </div>
</template>

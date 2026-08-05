<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import SegmentedControl from '@/components/ui/SegmentedControl.vue'
import TelefoneInput from '@/components/ui/TelefoneInput.vue'
import BaseAlert from '@/components/feedback/BaseAlert.vue'
import AuthPasswordToggle from '@/components/auth/AuthPasswordToggle.vue'
import PerfilStatusCard from '@/components/perfil/PerfilStatusCard.vue'
import PerfilSidebar from '@/components/perfil/PerfilSidebar.vue'
import PerfilSaveBar from '@/components/perfil/PerfilSaveBar.vue'
import PerfilPasswordRules from '@/components/perfil/PerfilPasswordRules.vue'
import PerfilTabNav from '@/components/perfil/PerfilTabNav.vue'
import { useUserStore } from '@/stores/user.store'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useFetchOnce } from '@/composables/useFetchOnce'
import { useWhatsAppConfirmacao } from '@/composables/useWhatsAppConfirmacao'
import { useApiError } from '@/composables/useApiError'
import { getUserRoleLabel } from '@/utils/userRoleLabel'
import { readFileAsDataUrl } from '@/utils/avatarFile'
import { getUnmetPasswordRules } from '@/utils/passwordRules'
import {
  buildPerfilStatusItems,
  calcularProgressoPerfil,
  formatUltimaAtualizacao,
} from '@/utils/perfilUtils'
import type { UpdateProfilePayload } from '@/types/user.types'
import {
  formatTelefone,
  telefoneLocalFromApi,
  telefoneToApi,
} from '@/utils/formatters'

type PerfilTabId = 'informacoes' | 'conta' | 'seguranca' | 'notificacoes'

const TABS = [
  { id: 'informacoes' as const, label: 'Perfil', description: 'Dados e foto', icon: '👤' },
  { id: 'conta' as const, label: 'Conta', description: 'Status e plano', icon: '🏷️' },
  { id: 'seguranca' as const, label: 'Segurança', description: 'Senha e acesso', icon: '🔒' },
  { id: 'notificacoes' as const, label: 'Notificações', description: 'Alertas e avisos', icon: '🔔' },
]

const userStore = useUserStore()
const notificationsStore = useNotificationsStore()
const { profile, saving, changingPassword } = storeToRefs(userStore)
const { resolveError } = useApiError()

const activeTab = ref<PerfilTabId>('informacoes')

const form = reactive({ nome: '', telefone: '', sexo: '' as '' | 'Masculino' | 'Feminino' })
const SEXO_OPTIONS = [
  { value: 'Masculino', label: 'Masculino' },
  { value: 'Feminino', label: 'Feminino' },
]
const passwordForm = reactive({ senha: '', confirmarSenha: '' })
const avatarFile = ref<File | null>(null)
const avatarRemoved = ref(false)

const profileError = ref<string | null>(null)
const profileSuccess = ref(false)
const passwordError = ref<string | null>(null)
const passwordSuccess = ref(false)
const passwordExpanded = ref(false)

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
const statusItems = computed(() =>
  profile.value ? buildPerfilStatusItems(profile.value, whatsAppState.value) : [],
)

const isProfileDirty = computed(() => {
  if (!profile.value) return false
  if (avatarFile.value || avatarRemoved.value) return true
  return (
    form.nome.trim() !== profile.value.nome ||
    telefoneToApi(form.telefone) !== (profile.value.telefone ?? '') ||
    form.sexo !== (profile.value?.sexo ?? '')
  )
})

const canChangePassword = computed(() => {
  if (!passwordForm.senha || !passwordForm.confirmarSenha) return false
  if (passwordForm.senha !== passwordForm.confirmarSenha) return false
  return getUnmetPasswordRules(passwordForm.senha).length === 0
})

const whatsAppLabel = computed(() => {
  const map = {
    'sem-telefone': 'Não cadastrado',
    confirmado: 'Confirmado',
    pendente: 'Aguardando confirmação',
    'nao-confirmado': 'Não confirmado',
  } as const
  return map[whatsAppState.value]
})

function selectTab(id: string) {
  activeTab.value = id as PerfilTabId
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
  avatarFile.value = null
  avatarRemoved.value = false
  notificacoes.whatsapp = profile.value.whatsAppOptIn ?? true
}

function onAvatarChange(file: File) {
  avatarFile.value = file
  avatarRemoved.value = false
  profileError.value = null
}

function onAvatarError(message: string) {
  profileError.value = message
}

onMounted(async () => {
  await loadProfile(() => userStore.fetchMe(true))
  syncFormFromProfile()
})

function cancelProfileChanges() {
  syncFormFromProfile()
  profileError.value = null
  profileSuccess.value = false
}

async function handleSaveProfile() {
  profileError.value = null
  profileSuccess.value = false

  try {
    const payload: UpdateProfilePayload = {
      nome: form.nome.trim(),
      telefone: telefoneToApi(form.telefone),
      sexo: form.sexo || null,
    }

    if (avatarRemoved.value) {
      payload.avatarBase64 = null
    } else if (avatarFile.value) {
      payload.avatarBase64 = await readFileAsDataUrl(avatarFile.value)
      payload.avatarContentType = avatarFile.value.type
    }

    await userStore.updateProfile(payload)
    syncFormFromProfile()
    profileSuccess.value = true
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
  <div class="perfil-page" :class="{ 'perfil-page--dirty': isProfileDirty }">
    <header class="perfil-page__header">
      <div>
        <h1 class="perfil-page__title">Meu perfil</h1>
        <div v-if="profile" class="perfil-page__meta">
          <span>{{ profile.ativo ? 'Conta ativa' : 'Conta inativa' }}</span>
          <span class="perfil-page__meta-dot" />
          <span>Perfil {{ progressoPerfil }}% completo</span>
          <span class="perfil-page__meta-dot" />
          <span>Última atualização {{ formatUltimaAtualizacao(profile.updatedAt) }}</span>
        </div>
      </div>
    </header>

    <template v-if="profile">
      <PerfilTabNav :tabs="TABS" :active-id="activeTab" @select="selectTab" />

      <PerfilStatusCard
        :items="statusItems"
        :progresso="progressoPerfil"
        :seguranca-label="passwordExpanded ? 'Em atualização' : 'Boa'"
      />

      <div class="perfil-content-panel" role="tabpanel">
        <Transition name="perfil-tab-panel" mode="out-in">
          <!-- Tab: Perfil -->
          <div v-if="activeTab === 'informacoes'" key="informacoes" class="perfil-tab-panel">
            <div class="perfil-layout">
              <PerfilSidebar
                :current-src="profile.avatarBase64"
                :name="form.nome || profile.nome"
                :role-label="getUserRoleLabel(profile.role)"
                :ativo="profile.ativo"
                @change="onAvatarChange"
                @error="onAvatarError"
              >
                <template #email>{{ profile.email }}</template>
                <template #telefone>{{ profile.telefone ? formatTelefone(profile.telefone) : 'Não informado' }}</template>
                <template #whatsapp>{{ whatsAppLabel }}</template>
              </PerfilSidebar>

              <div class="perfil-tab-panel__stack">
                <section
                  v-if="whatsAppState !== 'confirmado'"
                  class="perfil-card perfil-card--alert"
                >
                  <div class="perfil-card__alert-icon">🟡</div>
                  <div class="perfil-card__alert-body">
                    <h2 class="perfil-card__alert-title">Confirme seu WhatsApp</h2>
                    <p class="perfil-card__alert-desc">
                      Receba lembretes automáticos de agendamento e atualizações importantes.
                    </p>
                    <div v-if="whatsAppState === 'sem-telefone'" class="perfil-card__alert-actions">
                      <p class="perfil-card__alert-desc">Cadastre seu telefone no formulário abaixo.</p>
                    </div>
                    <template v-else>
                      <div v-if="pollError" class="perfil-inline-alert perfil-inline-alert--warning">
                        {{ pollError }}
                      </div>
                      <div class="perfil-card__alert-actions">
                        <a
                          v-if="instrucoes?.linkWhatsApp"
                          :href="instrucoes.linkWhatsApp"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="perfil-btn perfil-btn--primary"
                        >
                          Confirmar no WhatsApp
                        </a>
                        <BaseButton
                          v-else
                          variant="primary"
                          :loading="solicitando"
                          @click="handleSolicitarWhatsApp"
                        >
                          Confirmar
                        </BaseButton>
                        <span v-if="polling" class="perfil-polling">Aguardando confirmação…</span>
                      </div>
                    </template>
                  </div>
                </section>

                <section class="perfil-card">
                  <div class="perfil-card__header">
                    <h2 class="perfil-card__title">Informações pessoais</h2>
                    <p class="perfil-card__subtitle">Atualize nome e telefone de contato.</p>
                  </div>

                  <form class="perfil-card__body" @submit.prevent="handleSaveProfile">
                    <BaseAlert v-if="profileError" variant="error">{{ profileError }}</BaseAlert>
                    <div
                      v-if="profileSuccess"
                      class="perfil-inline-alert perfil-inline-alert--success"
                      role="status"
                    >
                      Perfil atualizado com sucesso.
                    </div>

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

                    <div class="perfil-email-field">
                      <label class="perfil-email-field__label">E-mail</label>
                      <div class="perfil-email-field__value">
                        <span>{{ profile.email }}</span>
                        <span class="perfil-email-field__lock">🔒 Utilizado para login e alertas</span>
                      </div>
                      <button
                        type="button"
                        class="perfil-link-btn"
                        @click="handleAlterarEmail"
                      >
                        Alterar e-mail
                      </button>
                    </div>
                  </form>
                </section>
              </div>
            </div>
          </div>

          <!-- Tab: Conta -->
          <div v-else-if="activeTab === 'conta'" key="conta" class="perfil-tab-panel">
            <section class="perfil-card">
              <div class="perfil-card__header">
                <h2 class="perfil-card__title">Conta</h2>
                <p class="perfil-card__subtitle">Informações gerais da sua conta na plataforma.</p>
              </div>
              <dl class="perfil-dl">
                <div class="perfil-dl__row">
                  <dt>Tipo</dt>
                  <dd>{{ getUserRoleLabel(profile.role) }}</dd>
                </div>
                <div class="perfil-dl__row">
                  <dt>Status</dt>
                  <dd>{{ profile.ativo ? 'Ativa' : 'Inativa' }}</dd>
                </div>
                <div class="perfil-dl__row">
                  <dt>E-mail</dt>
                  <dd>{{ profile.email }}</dd>
                </div>
                <div class="perfil-dl__row">
                  <dt>Telefone</dt>
                  <dd>{{ profile.telefone ? formatTelefone(profile.telefone) : 'Não informado' }}</dd>
                </div>
                <div class="perfil-dl__row">
                  <dt>Membro desde</dt>
                  <dd>{{ profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('pt-BR') : '—' }}</dd>
                </div>
                <div class="perfil-dl__row">
                  <dt>Perfil completo</dt>
                  <dd>{{ progressoPerfil }}%</dd>
                </div>
              </dl>
            </section>
          </div>

          <!-- Tab: Segurança -->
          <div v-else-if="activeTab === 'seguranca'" key="seguranca" class="perfil-tab-panel">
            <section class="perfil-card">
              <div class="perfil-card__header">
                <h2 class="perfil-card__title">Segurança</h2>
                <p class="perfil-card__subtitle">Proteja o acesso à sua conta.</p>
              </div>

              <div class="perfil-card__body">
                <div class="perfil-security-row">
                  <div>
                    <p class="perfil-security-row__label">Senha</p>
                    <p class="perfil-security-row__meta">Última alteração não disponível</p>
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
                  <BaseAlert v-if="passwordError" variant="error">{{ passwordError }}</BaseAlert>
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

                <div class="perfil-security-row perfil-security-row--muted">
                  <div>
                    <p class="perfil-security-row__label">Autenticação em dois fatores (2FA)</p>
                    <p class="perfil-security-row__meta">Desativado</p>
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
            </section>
          </div>

          <!-- Tab: Notificações -->
          <div v-else key="notificacoes" class="perfil-tab-panel">
            <section class="perfil-card">
              <div class="perfil-card__header">
                <h2 class="perfil-card__title">Notificações</h2>
                <p class="perfil-card__subtitle">Escolha como deseja ser avisado.</p>
              </div>
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
            </section>
          </div>
        </Transition>
      </div>
    </template>

    <PerfilSaveBar
      :visible="isProfileDirty && activeTab === 'informacoes'"
      :loading="saving"
      @cancel="cancelProfileChanges"
      @save="handleSaveProfile"
    />
  </div>
</template>

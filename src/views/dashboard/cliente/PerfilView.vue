<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import TelefoneInput from '@/components/ui/TelefoneInput.vue'
import BaseAlert from '@/components/feedback/BaseAlert.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import UserAvatar from '@/components/layout/UserAvatar.vue'
import ProfileAvatarEditor from '@/components/cliente/ProfileAvatarEditor.vue'
import AuthPasswordRules from '@/components/auth/recovery/AuthPasswordRules.vue'
import AuthPasswordToggle from '@/components/auth/AuthPasswordToggle.vue'
import { useUserStore } from '@/stores/user.store'
import { useFetchOnce } from '@/composables/useFetchOnce'
import { useWhatsAppConfirmacao } from '@/composables/useWhatsAppConfirmacao'
import { useApiError } from '@/composables/useApiError'
import { getUserRoleLabel } from '@/utils/userRoleLabel'
import { readFileAsDataUrl } from '@/utils/avatarFile'
import { getUnmetPasswordRules } from '@/utils/passwordRules'
import type { UpdateProfilePayload } from '@/types/user.types'
import {
  formatTelefone,
  telefoneLocalFromApi,
  telefoneToApi,
} from '@/utils/formatters'

const CARD_CLASS =
  'overflow-hidden rounded-xl border border-glow-border-soft bg-glow-surface shadow-sm'
const CARD_HEADER_CLASS = 'border-b border-glow-border-soft px-5 py-3.5'
const CARD_BODY_CLASS = 'p-5'
const CARD_FOOTER_CLASS = 'border-t border-glow-border-soft px-5 py-4'

const userStore = useUserStore()
const { profile, saving, changingPassword } = storeToRefs(userStore)
const { resolveError } = useApiError()

const form = reactive({ nome: '', telefone: '' })
const passwordForm = reactive({ senha: '', confirmarSenha: '' })
const avatarFile = ref<File | null>(null)
const avatarRemoved = ref(false)

const profileError = ref<string | null>(null)
const profileSuccess = ref(false)
const passwordError = ref<string | null>(null)
const passwordSuccess = ref(false)

const mostrarNovaSenha = ref(false)
const mostrarConfirmarSenha = ref(false)

const {
  instrucoes,
  solicitando,
  polling,
  pollError,
  solicitarConfirmacao,
  toggleOptIn,
} = useWhatsAppConfirmacao()

const { execute: loadProfile, loading } = useFetchOnce('cliente-perfil')

const whatsAppState = computed(() => {
  if (!profile.value?.telefone) return 'sem-telefone'
  if (profile.value.whatsAppConfirmado) return 'confirmado'
  if (profile.value.whatsAppPendenteConfirmacao || instrucoes.value || polling.value) {
    return 'pendente'
  }
  return 'nao-confirmado'
})

const whatsAppBadge = computed(() => {
  const map = {
    'sem-telefone': { label: 'Sem telefone', class: 'bg-glow-canvas text-glow-text-subtle' },
    confirmado: {
      label: 'Confirmado',
      class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    },
    pendente: {
      label: 'Aguardando confirmação',
      class: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    },
    'nao-confirmado': {
      label: 'Não confirmado',
      class: 'bg-glow-canvas text-glow-text-subtle',
    },
  } as const
  return map[whatsAppState.value]
})

const canChangePassword = computed(() => {
  if (!passwordForm.senha || !passwordForm.confirmarSenha) {
    return false
  }
  if (passwordForm.senha !== passwordForm.confirmarSenha) return false
  return getUnmetPasswordRules(passwordForm.senha).length === 0
})

function syncFormFromProfile() {
  if (!profile.value) return
  form.nome = profile.value.nome
  form.telefone = telefoneLocalFromApi(profile.value.telefone)
  avatarFile.value = null
  avatarRemoved.value = false
}

function onAvatarChange(file: File) {
  avatarFile.value = file
  avatarRemoved.value = false
  profileError.value = null
}

function onAvatarRemove() {
  avatarFile.value = null
  avatarRemoved.value = true
  profileError.value = null
}

function onAvatarError(message: string) {
  profileError.value = message
}

onMounted(async () => {
  await loadProfile(() => userStore.fetchMe(true))
  syncFormFromProfile()
})

async function handleSaveProfile() {
  profileError.value = null
  profileSuccess.value = false

  try {
    const payload: UpdateProfilePayload = {
      nome: form.nome.trim(),
      telefone: telefoneToApi(form.telefone),
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
  } catch (err) {
    passwordError.value = resolveError(err, 'Não foi possível alterar a senha.')
  }
}

async function handleOptInChange(event: Event) {
  const target = event.target as HTMLInputElement
  try {
    await toggleOptIn(target.checked)
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
  <div class="w-full space-y-5 lg:space-y-6">
    <header>
      <h1 class="font-satoshi text-xl font-bold leading-tight text-glow-text lg:text-2xl">
        Meu perfil
      </h1>
      <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
        Gerencie seus dados pessoais, conta e preferências de WhatsApp.
      </p>
    </header>

    <LoadingSpinner v-if="loading && !profile" class="mx-auto py-12" />

    <div
      v-else-if="profile"
      class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:gap-6 xl:grid-cols-12 xl:items-start"
    >
      <!-- Coluna esquerda: resumo + WhatsApp -->
      <div class="flex flex-col gap-5 max-md:contents md:col-span-1 xl:col-span-4 xl:gap-5">
        <!-- Resumo -->
        <section :class="CARD_CLASS" class="max-md:order-1">
          <div :class="CARD_BODY_CLASS" class="space-y-4 text-center">
            <UserAvatar
              :src="profile.avatarBase64"
              :name="profile.nome"
              size="xl"
              class="mx-auto"
            />
            <div class="min-w-0">
              <div class="flex flex-wrap items-center justify-center gap-2">
                <h2 class="font-satoshi text-lg font-bold text-glow-text">{{ profile.nome }}</h2>
                <span
                  class="inline-flex rounded-full px-2.5 py-0.5 font-urbanist text-xs font-medium"
                  :class="
                    profile.ativo
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  "
                >
                  {{ profile.ativo ? 'Conta ativa' : 'Conta inativa' }}
                </span>
              </div>
              <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
                {{ getUserRoleLabel(profile.role) }}
              </p>
            </div>

            <dl class="space-y-2.5 border-t border-glow-border-soft pt-4 text-left">
              <div class="grid grid-cols-[5.5rem_1fr] gap-x-3 gap-y-0.5">
                <dt class="font-urbanist text-xs font-medium uppercase tracking-wide text-glow-text-subtle">
                  E-mail
                </dt>
                <dd class="break-all font-urbanist text-sm text-glow-text">{{ profile.email }}</dd>
              </div>
              <div class="grid grid-cols-[5.5rem_1fr] gap-x-3 gap-y-0.5">
                <dt class="font-urbanist text-xs font-medium uppercase tracking-wide text-glow-text-subtle">
                  Telefone
                </dt>
                <dd class="font-urbanist text-sm text-glow-text">
                  {{ profile.telefone ? formatTelefone(profile.telefone) : 'Não informado' }}
                </dd>
              </div>
              <div class="grid grid-cols-[5.5rem_1fr] gap-x-3 gap-y-0.5">
                <dt class="font-urbanist text-xs font-medium uppercase tracking-wide text-glow-text-subtle">
                  WhatsApp
                </dt>
                <dd>
                  <span
                    class="inline-flex rounded-full px-2.5 py-0.5 font-urbanist text-xs font-medium"
                    :class="whatsAppBadge.class"
                  >
                    {{ whatsAppBadge.label }}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <!-- WhatsApp -->
        <section :class="CARD_CLASS" class="max-md:order-2">
          <div :class="CARD_HEADER_CLASS">
            <div class="flex items-start gap-3">
              <div
                class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                aria-hidden="true"
              >
                <svg class="size-5" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                  />
                </svg>
              </div>
              <div class="min-w-0">
                <h3 class="font-urbanist text-base font-semibold text-glow-text">WhatsApp</h3>
                <p class="mt-0.5 font-urbanist text-sm text-glow-text-subtle">
                  Confirme seu número e receba alertas de agendamento.
                </p>
              </div>
            </div>
          </div>

          <div :class="CARD_BODY_CLASS" class="space-y-4">
            <div v-if="whatsAppState === 'sem-telefone'" class="rounded-lg bg-glow-canvas px-4 py-3">
              <p class="font-urbanist text-sm text-glow-text-subtle">
                Cadastre seu telefone em Informações pessoais para habilitar alertas via WhatsApp.
              </p>
            </div>

            <template v-else-if="whatsAppState === 'confirmado'">
              <p class="font-urbanist text-sm text-glow-text">
                Confirmado para
                <span class="font-medium">{{ formatTelefone(profile.telefone) }}</span>.
              </p>

              <label
                class="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-glow-border-soft bg-glow-canvas px-4 py-3"
              >
                <div class="min-w-0">
                  <p class="font-urbanist text-sm font-medium text-glow-text">Alertas</p>
                  <p class="mt-0.5 font-urbanist text-xs text-glow-text-subtle">
                    Lembretes e atualizações
                  </p>
                </div>
                <div class="relative inline-flex shrink-0 cursor-pointer items-center">
                  <input
                    type="checkbox"
                    class="peer sr-only"
                    :checked="profile.whatsAppOptIn ?? false"
                    @change="handleOptInChange"
                  />
                  <div
                    class="peer h-6 w-11 rounded-full bg-glow-border-soft after:absolute after:start-[2px] after:top-[2px] after:size-5 after:rounded-full after:border after:border-glow-border-soft after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rtl:peer-checked:after:-translate-x-full"
                  />
                </div>
              </label>
            </template>

            <template v-else>
              <div
                class="rounded-lg border border-glow-border-soft bg-glow-canvas px-4 py-3"
                :class="whatsAppState === 'pendente' ? 'border-amber-200 dark:border-amber-800' : ''"
              >
                <p
                  v-if="whatsAppState === 'pendente' || instrucoes"
                  class="font-urbanist text-sm text-glow-text"
                >
                  Verifique seu e-mail e confirme pelo link no celular.
                </p>
                <p v-else class="font-urbanist text-sm text-glow-text-subtle">
                  Confirme
                  <span class="font-medium text-glow-text">{{
                    formatTelefone(profile.telefone)
                  }}</span>
                  para receber alertas.
                </p>
              </div>

              <div
                v-if="pollError"
                class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 font-urbanist text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
                role="alert"
              >
                {{ pollError }}
              </div>

              <div v-if="instrucoes?.linkWhatsApp" class="flex flex-wrap items-center gap-3">
                <a
                  :href="instrucoes.linkWhatsApp"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex h-10 items-center gap-2 rounded-lg bg-green-600 px-4 font-urbanist text-sm font-medium text-white transition hover:bg-green-700"
                >
                  Abrir WhatsApp
                </a>
                <p
                  v-if="polling"
                  class="flex items-center gap-2 font-urbanist text-xs text-glow-text-subtle"
                >
                  <span
                    class="inline-block size-3.5 animate-spin rounded-full border-2 border-glow-text-subtle border-t-transparent"
                  />
                  Aguardando confirmação…
                </p>
              </div>

              <BaseButton
                v-if="whatsAppState !== 'pendente' || !instrucoes"
                variant="secondary"
                :loading="solicitando"
                @click="handleSolicitarWhatsApp"
              >
                Enviar confirmação por e-mail
              </BaseButton>
            </template>
          </div>
        </section>
      </div>

      <!-- Coluna direita: informações + senha -->
      <div class="flex flex-col gap-5 max-md:contents md:col-span-1 xl:col-span-8 xl:gap-5">
        <!-- Informações pessoais -->
        <section :class="CARD_CLASS" class="max-md:order-3">
          <div :class="CARD_HEADER_CLASS">
            <h3 class="font-urbanist text-base font-semibold text-glow-text">Informações pessoais</h3>
            <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
              Atualize sua foto, nome e telefone. O e-mail é usado para login e não pode ser alterado
              aqui.
            </p>
          </div>

          <form @submit.prevent="handleSaveProfile">
            <div :class="CARD_BODY_CLASS" class="space-y-5">
              <BaseAlert v-if="profileError" variant="error">{{ profileError }}</BaseAlert>
              <div
                v-if="profileSuccess"
                class="rounded-lg border border-green-200 bg-green-50 px-4 py-3 font-urbanist text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300"
                role="status"
              >
                Perfil atualizado com sucesso.
              </div>

              <div class="rounded-lg border border-glow-border-soft bg-glow-canvas/50 p-4">
                <ProfileAvatarEditor
                  :current-src="profile.avatarBase64"
                  :name="form.nome"
                  @change="onAvatarChange"
                  @remove="onAvatarRemove"
                  @error="onAvatarError"
                />
              </div>

              <div class="grid gap-5 sm:grid-cols-2">
                <BaseInput v-model="form.nome" label="Nome completo" autocomplete="name" required />
                <TelefoneInput
                  v-model="form.telefone"
                  label="Telefone"
                  hint="DDD + número. O código do país (+55) é adicionado automaticamente."
                />
              </div>

              <BaseInput
                :model-value="profile.email"
                label="E-mail"
                type="email"
                readonly
                hint="Entre em contato com o suporte para alterar seu e-mail."
              />
            </div>

            <div :class="CARD_FOOTER_CLASS" class="flex justify-end">
              <BaseButton type="submit" :loading="saving">Salvar alterações</BaseButton>
            </div>
          </form>
        </section>

        <!-- Senha -->
        <section :class="CARD_CLASS" class="max-md:order-4">
          <div :class="CARD_HEADER_CLASS">
            <h3 class="font-urbanist text-base font-semibold text-glow-text">Senha</h3>
            <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
              Altere sua senha de acesso. Use uma combinação forte e diferente das anteriores.
            </p>
          </div>

          <form @submit.prevent="handleChangePassword">
            <div :class="CARD_BODY_CLASS" class="space-y-5">
              <BaseAlert v-if="passwordError" variant="error">{{ passwordError }}</BaseAlert>
              <div
                v-if="passwordSuccess"
                class="rounded-lg border border-green-200 bg-green-50 px-4 py-3 font-urbanist text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300"
                role="status"
              >
                Senha alterada com sucesso.
              </div>

              <div class="grid gap-5 md:grid-cols-2">
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

              <AuthPasswordRules :password="passwordForm.senha" />
            </div>

            <div :class="CARD_FOOTER_CLASS" class="flex justify-end">
              <BaseButton type="submit" :loading="changingPassword" :disabled="!canChangePassword">
                Atualizar senha
              </BaseButton>
            </div>
          </form>
        </section>
      </div>
    </div>
  </div>
</template>

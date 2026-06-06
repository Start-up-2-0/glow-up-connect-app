<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseAlert from '@/components/feedback/BaseAlert.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import UserAvatar from '@/components/layout/UserAvatar.vue'
import { useUserStore } from '@/stores/user.store'
import { useFetchOnce } from '@/composables/useFetchOnce'
import { useWhatsAppConfirmacao } from '@/composables/useWhatsAppConfirmacao'
import { useApiError } from '@/composables/useApiError'
import { getUserRoleLabel } from '@/utils/userRoleLabel'
import {
  formatTelefone,
  telefoneLocalFromApi,
  telefoneLocalFromInput,
  telefoneToApi,
} from '@/utils/formatters'

const userStore = useUserStore()
const { profile, saving } = storeToRefs(userStore)
const { resolveError } = useApiError()

const form = reactive({ nome: '', telefone: '' })
const saveError = ref<string | null>(null)
const saveSuccess = ref(false)

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

function syncFormFromProfile() {
  if (!profile.value) return
  form.nome = profile.value.nome
  form.telefone = telefoneLocalFromApi(profile.value.telefone)
}

function handleTelefoneInput(event: Event) {
  form.telefone = telefoneLocalFromInput((event.target as HTMLInputElement).value)
}

onMounted(async () => {
  await loadProfile(() => userStore.fetchMe(true))
  syncFormFromProfile()
})

async function handleSave() {
  saveError.value = null
  saveSuccess.value = false
  try {
    await userStore.updateProfile({
      nome: form.nome.trim(),
      telefone: telefoneToApi(form.telefone),
    })
    syncFormFromProfile()
    saveSuccess.value = true
  } catch (err) {
    saveError.value = resolveError(err, 'Não foi possível salvar o perfil.')
  }
}

async function handleOptInChange(event: Event) {
  const target = event.target as HTMLInputElement
  try {
    await toggleOptIn(target.checked)
  } catch (err) {
    saveError.value = resolveError(err, 'Não foi possível atualizar alertas.')
    target.checked = !target.checked
  }
}

async function handleSolicitarWhatsApp() {
  saveError.value = null
  try {
    await solicitarConfirmacao()
  } catch (err) {
    saveError.value = resolveError(err, 'Não foi possível solicitar confirmação.')
  }
}
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-6">
    <header>
      <h1 class="font-satoshi text-xl font-bold leading-tight text-glow-text lg:text-2xl">
        Meu perfil
      </h1>
      <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
        Gerencie seus dados pessoais, conta e preferências de WhatsApp.
      </p>
    </header>

    <BaseAlert v-if="saveError" variant="error">{{ saveError }}</BaseAlert>
    <div
      v-if="saveSuccess"
      class="rounded-lg border border-green-200 bg-green-50 px-4 py-3 font-urbanist text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300"
      role="status"
    >
      Perfil atualizado com sucesso.
    </div>

    <LoadingSpinner v-if="loading && !profile" class="mx-auto py-12" />

    <template v-else-if="profile">
      <!-- Cabeçalho do perfil -->
      <section
        class="overflow-hidden rounded-xl border border-glow-border-soft bg-glow-surface shadow-sm"
      >
        <div class="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
          <UserAvatar
            :src="profile.avatarBase64"
            :name="profile.nome"
            size="xl"
            class="mx-auto sm:mx-0"
          />
          <div class="min-w-0 flex-1 text-center sm:text-left">
            <div class="flex flex-col items-center gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <h2 class="truncate font-satoshi text-xl font-bold text-glow-text">
                {{ profile.nome }}
              </h2>
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
            <p class="mt-2 truncate font-urbanist text-sm text-glow-text">
              {{ profile.email }}
            </p>
            <p
              v-if="profile.telefone"
              class="mt-0.5 font-urbanist text-sm text-glow-text-subtle"
            >
              {{ formatTelefone(profile.telefone) }}
            </p>
          </div>
        </div>
      </section>

      <!-- Informações pessoais -->
      <section class="overflow-hidden rounded-xl border border-glow-border-soft bg-glow-surface shadow-sm">
        <div class="border-b border-glow-border-soft px-6 py-5">
          <h3 class="font-urbanist text-base font-semibold text-glow-text">
            Informações pessoais
          </h3>
          <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
            Atualize seu nome e telefone. O e-mail é usado para login e não pode ser alterado aqui.
          </p>
        </div>

        <form class="space-y-6 p-6" @submit.prevent="handleSave">
          <div class="grid gap-6 md:grid-cols-2">
            <BaseInput v-model="form.nome" label="Nome completo" autocomplete="name" required />
            <div class="flex flex-col gap-2">
              <label for="telefone" class="font-urbanist text-sm font-medium text-glow-text">
                Telefone
              </label>
              <div class="flex">
                <span
                  class="inline-flex h-11 shrink-0 items-center rounded-l-lg border border-r-0 border-glow-border-soft bg-glow-surface px-3.5 font-urbanist text-sm font-medium text-glow-text-subtle"
                  aria-hidden="true"
                >
                  +55
                </span>
                <input
                  id="telefone"
                  :value="form.telefone"
                  type="tel"
                  inputmode="numeric"
                  autocomplete="tel-national"
                  placeholder="79991917634"
                  class="h-11 w-full rounded-r-lg border border-glow-border-soft bg-glow-canvas px-3.5 font-urbanist text-sm text-glow-text outline-none transition placeholder:text-glow-placeholder focus:border-glow-gold focus:ring-1 focus:ring-glow-gold"
                  @input="handleTelefoneInput"
                />
              </div>
              <p class="font-urbanist text-xs text-glow-text-subtle">
                DDD + número. O código do país (+55) é adicionado automaticamente.
              </p>
            </div>
          </div>

          <BaseInput
            :model-value="profile.email"
            label="E-mail"
            type="email"
            readonly
            hint="Entre em contato com o suporte para alterar seu e-mail."
          />

          <div class="flex justify-end border-t border-glow-border-soft pt-5">
            <BaseButton type="submit" :loading="saving">Salvar alterações</BaseButton>
          </div>
        </form>
      </section>

      <!-- WhatsApp -->
      <section class="overflow-hidden rounded-xl border border-glow-border-soft bg-glow-surface shadow-sm">
        <div class="flex flex-col gap-3 border-b border-glow-border-soft px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
          <div class="flex gap-4">
            <div
              class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
              aria-hidden="true"
            >
              <svg class="size-5" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                />
              </svg>
            </div>
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="font-urbanist text-base font-semibold text-glow-text">WhatsApp</h3>
                <span
                  class="inline-flex rounded-full px-2.5 py-0.5 font-urbanist text-xs font-medium"
                  :class="whatsAppBadge.class"
                >
                  {{ whatsAppBadge.label }}
                </span>
              </div>
              <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
                Receba alertas de agendamento diretamente no seu celular.
              </p>
            </div>
          </div>
        </div>

        <div class="space-y-5 p-6">
          <div v-if="whatsAppState === 'sem-telefone'" class="rounded-lg bg-glow-canvas px-4 py-3">
            <p class="font-urbanist text-sm text-glow-text-subtle">
              Cadastre seu telefone na seção acima para habilitar alertas de agendamento via
              WhatsApp.
            </p>
          </div>

          <div v-else-if="whatsAppState === 'confirmado'" class="space-y-5">
            <p class="font-urbanist text-sm text-glow-text">
              WhatsApp confirmado para
              <span class="font-medium">{{ formatTelefone(profile.telefone) }}</span>.
            </p>

            <label
              class="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-glow-border-soft bg-glow-canvas px-4 py-3.5"
            >
              <div>
                <p class="font-urbanist text-sm font-medium text-glow-text">
                  Alertas de agendamento
                </p>
                <p class="mt-0.5 font-urbanist text-xs text-glow-text-subtle">
                  Receber lembretes e atualizações no WhatsApp
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
          </div>

          <div v-else class="space-y-5">
            <div
              class="rounded-lg border border-glow-border-soft bg-glow-canvas px-4 py-3"
              :class="whatsAppState === 'pendente' ? 'border-amber-200 dark:border-amber-800' : ''"
            >
              <p
                v-if="whatsAppState === 'pendente' || instrucoes"
                class="font-urbanist text-sm text-glow-text"
              >
                Verifique seu e-mail para confirmar o WhatsApp. Abra o link no celular e envie a
                mensagem do número cadastrado.
              </p>
              <p v-else class="font-urbanist text-sm text-glow-text-subtle">
                Confirme seu número
                <span class="font-medium text-glow-text">{{
                  formatTelefone(profile.telefone)
                }}</span>
                para receber alertas de agendamento.
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
                <svg class="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path
                    d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                  />
                </svg>
                Abrir WhatsApp
              </a>
              <p v-if="polling" class="flex items-center gap-2 font-urbanist text-xs text-glow-text-subtle">
                <span class="inline-block size-3.5 animate-spin rounded-full border-2 border-glow-text-subtle border-t-transparent" />
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
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useNegocioStore } from '@/stores/negocio.store'
import { useApiError } from '@/composables/useApiError'
import { useAuth } from '@/composables/useAuth'
import { useConsent } from '@/composables/useConsent'
import { privacidadeService } from '@/services/privacidadeService'
import { legalUrl } from '@/utils/landingUrl'
import GlowGuideLauncher from '@/tutorials/components/GlowGuideLauncher.vue'
import { usePageTutorial } from '@/tutorials/hooks/usePageTutorial'

const { startPageTutorial } = usePageTutorial('preferences')

const notifications = useNotificationsStore()
const negocioStore = useNegocioStore()
const { logout } = useAuth()
const { resolveError } = useApiError()
const {
  hasThirdPartyConsent,
  hasTermsAccepted,
  openPreferences,
  revokeThirdPartyConsent,
} = useConsent()
const exportando = ref(false)
const dialogoExclusaoAberto = ref(false)
const senhaExclusao = ref('')
const exclusaoLoading = ref(false)
const exclusaoErro = ref('')

const isOwner = () => negocioStore.role === 'Owner'

function abrirDialogoExclusao() {
  senhaExclusao.value = ''
  exclusaoErro.value = ''
  dialogoExclusaoAberto.value = true
}

function fecharDialogoExclusao() {
  if (exclusaoLoading.value) return
  dialogoExclusaoAberto.value = false
}

async function exportarDados() {
  exportando.value = true
  try {
    const { data } = await privacidadeService.exportarMeusDados()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'glow-up-connect-meus-dados.json'
    link.click()
    URL.revokeObjectURL(url)
    notifications.push('success', 'Exportação concluída.')
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    exportando.value = false
  }
}

async function confirmarExclusao() {
  exclusaoErro.value = ''
  if (!senhaExclusao.value.trim()) {
    exclusaoErro.value = 'Informe sua senha para confirmar.'
    return
  }

  exclusaoLoading.value = true
  try {
    await privacidadeService.solicitarExclusao(senhaExclusao.value)
    dialogoExclusaoAberto.value = false
    notifications.push(
      'success',
      'Exclusão solicitada. Você tem 30 dias para reativar a conta pelo login.',
    )
    await logout()
  } catch (err) {
    exclusaoErro.value = resolveError(err, 'Não foi possível solicitar a exclusão.')
  } finally {
    exclusaoLoading.value = false
  }
}

async function revogarConsentimento() {
  try {
    await privacidadeService.revogarConsentimento()
    notifications.push('success', 'Consentimento revogado.')
  } catch (err) {
    notifications.push('error', resolveError(err))
  }
}

function revogarCookiesTerceiros() {
  revokeThirdPartyConsent()
  notifications.push('info', 'Cookies de terceiros desativados. Pagamentos e busca de CEP automática ficam indisponíveis.')
}
</script>

<template>
  <div class="space-y-4 lg:space-y-6" data-tour="preferences-page">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Privacidade</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Exercite seus direitos previstos na LGPD e gerencie cookies.
        </p>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <GlowGuideLauncher class="max-sm:hidden" @click="startPageTutorial" />
        <GlowGuideLauncher class="sm:hidden" compact @click="startPageTutorial" />
      </div>
    </div>

    <BaseCard class="space-y-4">
      <div>
        <h2 class="font-medium text-gray-900 dark:text-white">Cookies e terceiros</h2>
        <p class="text-sm text-gray-500">
          Status:
          <strong>{{ hasThirdPartyConsent ? 'serviços de terceiros autorizados' : 'apenas cookies essenciais' }}</strong>
        </p>
        <p v-if="hasTermsAccepted" class="mt-1 text-xs text-gray-400">
          Termos de uso aceitos no cadastro.
        </p>
        <div class="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            class="rounded-lg bg-primary-600 px-4 py-2 text-sm text-white"
            @click="openPreferences"
          >
            Gerenciar cookies
          </button>
          <button
            v-if="hasThirdPartyConsent"
            type="button"
            class="rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-600"
            @click="revogarCookiesTerceiros"
          >
            Revogar cookies de terceiros
          </button>
        </div>
        <p class="mt-3 text-xs text-gray-400">
          <a :href="legalUrl('termos-de-uso')" class="text-primary-600 hover:underline" target="_blank" rel="noopener">
            Termos de uso
          </a>
          ·
          <a :href="legalUrl('politica-de-cookies')" class="text-primary-600 hover:underline" target="_blank" rel="noopener">
            Política de cookies
          </a>
        </p>
      </div>

      <div>
        <h2 class="font-medium text-gray-900 dark:text-white">Portabilidade</h2>
        <p class="text-sm text-gray-500">Baixe uma cópia dos seus dados cadastrais.</p>
        <button
          type="button"
          class="mt-2 rounded-lg bg-primary-600 px-4 py-2 text-sm text-white"
          :disabled="exportando"
          @click="exportarDados"
        >
          {{ exportando ? 'Exportando…' : 'Exportar meus dados' }}
        </button>
      </div>

      <div>
        <h2 class="font-medium text-gray-900 dark:text-white">Exclusão</h2>
        <p class="text-sm text-gray-500">
          A conta entra em um prazo de 30 dias. Nesse período você pode reativar pelo login.
          Depois disso, os dados pessoais são anonimizados, sujeito a retenção legal.
        </p>
        <button
          type="button"
          class="mt-2 rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700 dark:border-red-800 dark:text-red-400"
          @click="abrirDialogoExclusao"
        >
          Solicitar exclusão
        </button>
      </div>

      <div>
        <h2 class="font-medium text-gray-900 dark:text-white">Comunicações opcionais</h2>
        <p class="text-sm text-gray-500">Revogue consentimento para mensagens não essenciais.</p>
        <button
          type="button"
          class="mt-2 rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-600"
          @click="revogarConsentimento"
        >
          Revogar consentimento
        </button>
      </div>
    </BaseCard>

    <Teleport to="body">
      <div
        v-if="dialogoExclusaoAberto"
        class="fixed inset-0 z-[3000] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="exclusao-titulo"
      >
        <div class="absolute inset-0 glow-modal-scrim" @click="fecharDialogoExclusao" />
        <div class="relative z-10 w-full max-w-md rounded-lg border border-glow-border-soft bg-glow-surface p-6 shadow-xl">
          <h2 id="exclusao-titulo" class="mb-2 font-urbanist text-lg font-semibold text-glow-text">
            Excluir sua conta?
          </h2>
          <p class="mb-3 text-sm text-glow-text-subtle">
            A exclusão não é imediata. Você terá 30 dias para reativar a conta com e-mail e senha.
          </p>
          <p v-if="isOwner()" class="mb-4 text-sm text-glow-text-subtle">
            Como dono, a loja sai do Explorar, a equipe não consegue operar e a assinatura fica
            suspensa no mesmo prazo. Reativar restaura tudo.
          </p>
          <p v-else class="mb-4 text-sm text-glow-text-subtle">
            Apenas a sua conta pessoal entra no prazo de exclusão. A loja em que você trabalha
            continua ativa.
          </p>
          <BaseInput
            v-model="senhaExclusao"
            type="password"
            label="Confirme com sua senha"
            autocomplete="current-password"
            :error="exclusaoErro"
          />
          <div class="mt-6 flex justify-end gap-2">
            <BaseButton variant="ghost" :disabled="exclusaoLoading" @click="fecharDialogoExclusao">
              Cancelar
            </BaseButton>
            <BaseButton variant="danger" :loading="exclusaoLoading" @click="confirmarExclusao">
              Confirmar exclusão
            </BaseButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

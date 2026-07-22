<script setup lang="ts">
import { ref } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { useConsent } from '@/composables/useConsent'
import { privacidadeService } from '@/services/privacidadeService'
import { legalUrl } from '@/utils/landingUrl'

const notifications = useNotificationsStore()
const { resolveError } = useApiError()
const {
  hasThirdPartyConsent,
  hasTermsAccepted,
  openPreferences,
  revokeThirdPartyConsent,
} = useConsent()
const exportando = ref(false)

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

async function solicitarExclusao() {
  try {
    await privacidadeService.solicitarExclusao()
    notifications.push('success', 'Solicitação de exclusão registrada.')
  } catch (err) {
    notifications.push('error', resolveError(err))
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
  <div class="space-y-4 lg:space-y-6">
    <div>
      <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Privacidade</h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Exercite seus direitos previstos na LGPD e gerencie cookies.
      </p>
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
        <p class="text-sm text-gray-500">Solicite a eliminação da sua conta (sujeito a retenção legal).</p>
        <button
          type="button"
          class="mt-2 rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-600"
          @click="solicitarExclusao"
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
  </div>
</template>

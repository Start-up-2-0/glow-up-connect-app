<script setup lang="ts">
import { ref } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { privacidadeService } from '@/services/privacidadeService'

const notifications = useNotificationsStore()
const { resolveError } = useApiError()
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
</script>

<template>
  <div class="space-y-4 lg:space-y-6">
    <div>
      <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Privacidade</h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Exercite seus direitos previstos na LGPD.
      </p>
    </div>

    <BaseCard class="space-y-4">
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
        <h2 class="font-medium text-gray-900 dark:text-white">Consentimento</h2>
        <p class="text-sm text-gray-500">Revogue comunicações opcionais.</p>
        <button
          type="button"
          class="mt-2 rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-600"
          @click="revogarConsentimento"
        >
          Revogar consentimento
        </button>
      </div>

      <p class="text-xs text-gray-400">
        Política de Privacidade completa: consulte o site institucional da Glow Up Connect.
      </p>
    </BaseCard>
  </div>
</template>

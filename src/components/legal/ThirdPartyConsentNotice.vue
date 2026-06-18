<script setup lang="ts">
import { useConsent } from '@/composables/useConsent'
import { ROUTE_PATHS } from '@/constants/routes'
import { RouterLink } from 'vue-router'

withDefaults(
  defineProps<{
    compact?: boolean
  }>(),
  {
    compact: false,
  },
)

const { openPreferences } = useConsent()
</script>

<template>
  <div
    class="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-200"
    role="alert"
  >
    <p class="font-medium">Autorização necessária</p>
    <p class="mt-1" :class="compact ? 'text-xs' : ''">
      Para usar este recurso, precisamos enviar dados a serviços de terceiros (por exemplo,
      Mercado Pago ou consulta de CEP). Ajuste suas preferências de cookies para continuar.
    </p>
    <div class="mt-3 flex flex-wrap gap-2">
      <button
        type="button"
        class="rounded-lg bg-glow-gold px-3 py-1.5 text-xs font-medium text-white hover:brightness-95"
        @click="openPreferences"
      >
        Gerenciar cookies
      </button>
      <RouterLink
        :to="ROUTE_PATHS.POLITICA_COOKIES"
        class="rounded-lg border border-amber-400 px-3 py-1.5 text-xs font-medium hover:bg-amber-100 dark:border-amber-600 dark:hover:bg-amber-950/50"
      >
        Política de cookies
      </RouterLink>
    </div>
  </div>
</template>

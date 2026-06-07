<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ROUTE_PATHS } from '@/constants/routes'
import { formatDate } from '@/utils/formatters'

const props = defineProps<{
  diasTrial: number
  proximaDataVencimento: string
}>()

const diasRestantes = computed(() => {
  const fim = new Date(props.proximaDataVencimento)
  const hoje = new Date()
  const diff = Math.ceil((fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
})
</script>

<template>
  <div
    class="rounded-lg border border-amber-300/50 bg-amber-50 px-4 py-3 dark:border-amber-500/30 dark:bg-amber-950/30"
    role="status"
  >
    <p class="font-urbanist text-sm font-semibold text-glow-text">
      Período de teste — {{ diasRestantes }} dias restantes
    </p>
    <p class="mt-1 text-sm text-glow-text-subtle">
      Primeira cobrança em {{ formatDate(proximaDataVencimento) }}.
      <RouterLink
        :to="ROUTE_PATHS.CONFIG_ASSINATURA_FATURAS"
        class="font-medium text-glow-gold hover:underline"
      >
        Ver faturas
      </RouterLink>
    </p>
  </div>
</template>

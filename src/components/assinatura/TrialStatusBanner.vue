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
    class="rounded-xl border border-glow-border-accent bg-glow-accent-glow px-4 py-3 shadow-glow-sm"
    role="status"
  >
    <p class="font-urbanist text-sm font-semibold text-glow-text">
      Período de teste — {{ diasRestantes }} dias restantes
    </p>
    <p class="mt-1 text-sm text-glow-text-subtle">
      Primeira cobrança em {{ formatDate(proximaDataVencimento) }}.
      <RouterLink
        :to="ROUTE_PATHS.CONFIG_ASSINATURA_FATURAS"
        class="font-medium text-glow-gold-dark hover:underline"
      >
        Ver faturas
      </RouterLink>
    </p>
  </div>
</template>

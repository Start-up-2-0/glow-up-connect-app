<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineProps<{
  contasVencidas?: number
  sessaoAberta?: boolean
  sessaoDesde?: string
}>()
</script>

<template>
  <div class="space-y-2">
    <div
      v-if="sessaoAberta"
      class="financeiro-alert-banner financeiro-alert-banner--info"
    >
      Caixa aberto{{ sessaoDesde ? ` desde ${sessaoDesde}` : '' }}.
      <RouterLink to="/financeiro/caixa" class="ml-1 font-semibold underline">
        Ir para o caixa
      </RouterLink>
    </div>
    <div
      v-if="contasVencidas && contasVencidas > 0"
      class="financeiro-alert-banner financeiro-alert-banner--warning"
    >
      {{ contasVencidas }} conta(s) vencida(s).
      <RouterLink
        to="/financeiro/contas?aba=receber&status=Vencida"
        class="ml-1 font-semibold underline"
      >
        Ver contas
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import FinanceiroIcon from '@/components/financeiro/FinanceiroIcon.vue'

defineProps<{
  entradas: string
  saidas: string
  lucro: string
  lucroPositivo: boolean
}>()
</script>

<template>
  <div class="financeiro-summary-bar">
    <div class="financeiro-summary-bar__item">
      <FinanceiroIcon name="entrada" class="financeiro-summary-bar__icon financeiro-summary-bar__icon--entrada" />
      <div>
        <p class="financeiro-summary-bar__label">Receita</p>
        <p class="financeiro-summary-bar__value financeiro-summary-bar__value--positive">{{ entradas }}</p>
      </div>
    </div>
    <div class="financeiro-summary-bar__divider" aria-hidden="true" />
    <div class="financeiro-summary-bar__item">
      <FinanceiroIcon name="saida" class="financeiro-summary-bar__icon financeiro-summary-bar__icon--saida" />
      <div>
        <p class="financeiro-summary-bar__label">Despesas</p>
        <p class="financeiro-summary-bar__value financeiro-summary-bar__value--negative">{{ saidas }}</p>
      </div>
    </div>
    <div class="financeiro-summary-bar__divider" aria-hidden="true" />
    <div class="financeiro-summary-bar__item">
      <FinanceiroIcon name="lucro" class="financeiro-summary-bar__icon financeiro-summary-bar__icon--lucro" />
      <div>
        <p class="financeiro-summary-bar__label">Lucro</p>
        <p
          class="financeiro-summary-bar__value"
          :class="lucroPositivo ? 'financeiro-summary-bar__value--positive' : 'financeiro-summary-bar__value--negative'"
        >
          {{ lucro }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue'
import FinanceiroIcon from '@/components/financeiro/FinanceiroIcon.vue'

defineEmits<{
  novaEntrada: []
  novaSaida: []
}>()

defineProps<{
  showActions?: boolean
}>()
</script>

<template>
  <div class="financeiro-dashboard-empty">
    <div class="financeiro-dashboard-empty__icon-wrap">
      <FinanceiroIcon name="saldo" class="financeiro-dashboard-empty__icon" />
    </div>
    <div class="financeiro-dashboard-empty__content">
      <p class="financeiro-dashboard-empty__title">Comece registrando sua primeira entrada</p>
      <p class="financeiro-dashboard-empty__desc">
        Seu financeiro ficará organizado automaticamente. Cadastre vendas, registre gastos e acompanhe seu lucro.
      </p>
      <ul class="financeiro-dashboard-empty__tips">
        <li>cadastre uma venda</li>
        <li>registre um gasto</li>
        <li>acompanhe seu lucro</li>
      </ul>
      <div v-if="showActions" class="financeiro-dashboard-empty__actions">
        <BaseButton @click="$emit('novaEntrada')">+ Nova entrada</BaseButton>
        <BaseButton variant="secondary" @click="$emit('novaSaida')">+ Nova saída</BaseButton>
      </div>
    </div>
  </div>
</template>

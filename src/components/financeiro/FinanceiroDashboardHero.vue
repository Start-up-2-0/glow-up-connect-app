<script setup lang="ts">
defineProps<{
  saldo: string
  lucroLiquido: string
  lucroPositivo: boolean
}>()

defineEmits<{
  novaEntrada: []
  novaSaida: []
}>()
</script>

<template>
  <div class="financeiro-dashboard-hero">
    <div class="financeiro-dashboard-hero__content">
      <p class="financeiro-dashboard-hero__label">Saldo atual</p>
      <p class="financeiro-dashboard-hero__value">{{ saldo }}</p>
      <p
        class="financeiro-dashboard-hero__trend"
        :class="lucroPositivo ? 'financeiro-dashboard-hero__trend--positive' : 'financeiro-dashboard-hero__trend--neutral'"
      >
        Lucro líquido no período: {{ lucroLiquido }}
      </p>
    </div>
    <div v-if="$slots.actions" class="financeiro-dashboard-hero__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

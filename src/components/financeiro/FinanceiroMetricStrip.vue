<script setup lang="ts">
import FinanceiroMetricStripItem from '@/components/financeiro/FinanceiroMetricStripItem.vue'

defineProps<{
  lucro: string
  lucroPositivo: boolean
  lucroTrend?: number | null
  contas: string
  contasHint?: string
  comissoes: string
}>()

defineEmits<{
  contas: []
  comissoes: []
}>()
</script>

<template>
  <div class="financeiro-metric-strip">
    <FinanceiroMetricStripItem
      icon="lucro"
      label="Lucro"
      :value="lucro"
      :variant="lucroPositivo ? 'positive' : 'negative'"
      :trend="lucroTrend"
    />
    <FinanceiroMetricStripItem
      icon="contas"
      label="Contas em aberto"
      :value="contas"
      :hint="contasHint"
      clickable
      @click="$emit('contas')"
    />
    <FinanceiroMetricStripItem
      icon="comissao"
      label="Comissões"
      :value="comissoes"
      clickable
      @click="$emit('comissoes')"
    />
  </div>
</template>

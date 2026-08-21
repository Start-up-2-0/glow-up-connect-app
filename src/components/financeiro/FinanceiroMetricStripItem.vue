<script setup lang="ts">
import FinanceiroIcon from '@/components/financeiro/FinanceiroIcon.vue'
import FinanceiroTrendBadge from '@/components/financeiro/FinanceiroTrendBadge.vue'

defineProps<{
  label: string
  value: string
  hint?: string
  icon?: 'lucro' | 'contas' | 'comissao'
  variant?: 'default' | 'positive' | 'negative'
  trend?: number | null
  clickable?: boolean
}>()
</script>

<template>
  <component
    :is="clickable ? 'button' : 'div'"
    v-bind="clickable ? { type: 'button' } : {}"
    class="financeiro-metric-strip__item"
    :class="{ 'financeiro-metric-strip__item--clickable': clickable }"
  >
    <div class="financeiro-metric-strip__head">
      <FinanceiroIcon
        v-if="icon"
        :name="icon"
        class="financeiro-metric-strip__icon"
      />
      <p class="financeiro-metric-strip__label">{{ label }}</p>
    </div>
    <p
      class="financeiro-metric-strip__value"
      :class="{
        'financeiro-metric-strip__value--positive': variant === 'positive',
        'financeiro-metric-strip__value--negative': variant === 'negative',
      }"
    >
      {{ value }}
    </p>
    <p v-if="hint" class="financeiro-metric-strip__hint">{{ hint }}</p>
    <FinanceiroTrendBadge v-if="trend != null" :value="trend" />
  </component>
</template>

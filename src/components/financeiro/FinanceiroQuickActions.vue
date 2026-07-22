<script setup lang="ts">
import FinanceiroIcon from '@/components/financeiro/FinanceiroIcon.vue'

export interface FinanceiroQuickAction {
  id: string
  label: string
  icon: 'venda' | 'despesa' | 'export' | 'relatorio' | 'grafico'
}

defineProps<{
  actions: FinanceiroQuickAction[]
}>()

defineEmits<{
  action: [id: string]
}>()
</script>

<template>
  <section class="financeiro-quick-actions">
    <h2 class="financeiro-quick-actions__title">Ações rápidas</h2>
    <div class="financeiro-quick-actions__grid">
      <button
        v-for="action in actions"
        :key="action.id"
        type="button"
        class="financeiro-quick-actions__btn"
        @click="$emit('action', action.id)"
      >
        <FinanceiroIcon :name="action.icon" class="financeiro-quick-actions__icon" />
        <span>{{ action.label }}</span>
      </button>
    </div>
  </section>
</template>

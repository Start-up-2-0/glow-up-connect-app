<script setup lang="ts">
import { BarChart3, Target, Wallet } from 'lucide-vue-next'

defineProps<{
  aba: string
  metasCount: number
  regrasCount: number
  podeGerenciar?: boolean
}>()

const emit = defineEmits<{ 'update:aba': [value: string] }>()
</script>

<template>
  <nav class="comissoes-tabs" aria-label="Seções de comissões">
    <button
      type="button"
      class="comissoes-tabs__item"
      :class="{ 'comissoes-tabs__item--active': aba === 'acompanhamento' }"
      @click="emit('update:aba', 'acompanhamento')"
    >
      <BarChart3 :size="16" :stroke-width="1.75" />
      Acompanhamento
    </button>
    <button
      v-if="podeGerenciar"
      type="button"
      class="comissoes-tabs__item"
      :class="{ 'comissoes-tabs__item--active': aba === 'metas' }"
      @click="emit('update:aba', 'metas')"
    >
      <Target :size="16" :stroke-width="1.75" />
      Metas
      <span class="comissoes-tabs__badge">{{ metasCount }}</span>
    </button>
    <button
      v-if="podeGerenciar"
      type="button"
      class="comissoes-tabs__item"
      :class="{ 'comissoes-tabs__item--active': aba === 'regras' }"
      @click="emit('update:aba', 'regras')"
    >
      <Wallet :size="16" :stroke-width="1.75" />
      Regras
      <span class="comissoes-tabs__badge">{{ regrasCount }}</span>
    </button>
  </nav>
</template>

<style scoped>
.comissoes-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  border-bottom: 1px solid var(--glow-border-soft);
}
.comissoes-tabs__item {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: -1px;
  border-bottom: 2px solid transparent;
  padding: 0.7rem 0.85rem;
  font-family: 'Urbanist', ui-sans-serif, system-ui, sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--glow-text-subtle);
  transition:
    color 0.15s ease,
    border-color 0.15s ease;
}
.comissoes-tabs__item:hover {
  color: var(--glow-text);
}
.comissoes-tabs__item--active {
  border-bottom-color: var(--glow-gold-cta);
  color: var(--glow-gold-cta);
  font-weight: 600;
}
.comissoes-tabs__badge {
  display: inline-flex;
  min-width: 1.25rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: var(--glow-canvas);
  padding: 0 0.35rem;
  font-size: 11px;
  font-weight: 600;
  color: var(--glow-text-muted);
}
.comissoes-tabs__item--active .comissoes-tabs__badge {
  background: color-mix(in srgb, var(--glow-gold-cta) 15%, transparent);
  color: var(--glow-gold-cta);
}
</style>

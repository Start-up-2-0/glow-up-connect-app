<script setup lang="ts">
import { ArrowRight, Info } from 'lucide-vue-next'

const emit = defineEmits<{ 'ver-regras': [] }>()
</script>

<template>
  <aside class="comissoes-aviso">
    <div class="flex min-w-0 items-start gap-3">
      <span
        class="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-glow-gold-cta/15 text-glow-gold-cta"
      >
        <Info :size="16" :stroke-width="1.75" />
      </span>
      <p class="font-urbanist text-[12px] leading-relaxed text-glow-text-subtle">
        Os valores exibidos são estimativas. Os valores finais podem variar de acordo com
        ajustes, regras e cancelamentos.
      </p>
    </div>
    <button type="button" class="comissoes-aviso__link" @click="emit('ver-regras')">
      Ver regras de comissão
      <ArrowRight :size="14" :stroke-width="2" />
    </button>
  </aside>
</template>

<style scoped>
.comissoes-aviso {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--glow-border-soft);
  background: var(--glow-surface);
  padding: 0.9rem 1.1rem;
}
.comissoes-aviso__link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: 'Urbanist', ui-sans-serif, system-ui, sans-serif;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--glow-gold-cta);
  white-space: nowrap;
}
.comissoes-aviso__link:hover {
  text-decoration: underline;
}
</style>

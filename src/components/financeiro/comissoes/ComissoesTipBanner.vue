<script setup lang="ts">
import { Lightbulb, X } from 'lucide-vue-next'

defineProps<{
  titulo?: string
  texto: string
}>()

const emit = defineEmits<{ fechar: [] }>()
</script>

<template>
  <div class="comissoes-tip">
    <span class="comissoes-tip__icon">
      <Lightbulb :size="16" :stroke-width="1.75" />
    </span>
    <div class="min-w-0 flex-1">
      <p class="font-urbanist text-[13px] font-semibold text-glow-text">
        {{ titulo ?? 'Como funciona?' }}
      </p>
      <p class="mt-0.5 font-urbanist text-[12px] leading-relaxed text-glow-text-subtle">
        {{ texto }}
      </p>
    </div>
    <button
      type="button"
      class="shrink-0 rounded-lg p-1.5 text-glow-text-muted transition hover:bg-glow-hover-surface hover:text-glow-text"
      aria-label="Fechar"
      @click="emit('fechar')"
    >
      <X :size="16" :stroke-width="1.75" />
    </button>
  </div>
</template>

<style scoped>
.comissoes-tip {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--glow-info, #3b82f6) 22%, transparent);
  background: color-mix(in srgb, var(--glow-info, #3b82f6) 8%, var(--glow-surface));
  padding: 0.9rem 1rem;
}
.comissoes-tip__icon {
  display: inline-flex;
  height: 32px;
  width: 32px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: color-mix(in srgb, var(--glow-info, #3b82f6) 14%, transparent);
  color: var(--glow-info, #3b82f6);
}
</style>

<script setup lang="ts">
import { Headphones, CircleHelp } from 'lucide-vue-next'

const emit = defineEmits<{ suporte: [] }>()
</script>

<template>
  <aside class="faturas-support">
    <div class="flex min-w-0 items-start gap-3">
      <span
        class="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-glow-gold-cta/15 text-glow-gold-cta"
      >
        <CircleHelp :size="18" :stroke-width="1.75" />
      </span>
      <div class="min-w-0">
        <p class="font-urbanist text-[14px] font-semibold text-glow-text">
          Dúvidas sobre sua fatura?
        </p>
        <p class="mt-0.5 font-urbanist text-[12px] leading-relaxed text-glow-text-subtle">
          Estamos aqui para ajudar você com qualquer dúvida sobre pagamentos e cobranças.
        </p>
      </div>
    </div>
    <button type="button" class="assinatura-btn-secondary shrink-0" @click="emit('suporte')">
      <Headphones :size="16" :stroke-width="1.75" />
      Fale com o suporte
    </button>
  </aside>
</template>

<style scoped>
.faturas-support {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-radius: 16px;
  border: 1px solid var(--glow-border-soft);
  background: color-mix(in srgb, var(--glow-gold-cta) 6%, var(--glow-surface));
  padding: 1rem 1.15rem;
  animation: faturas-fade-up 0.5s ease 0.1s both;
}
@keyframes faturas-fade-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

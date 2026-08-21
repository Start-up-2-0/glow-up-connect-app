<script setup lang="ts">
import { ExternalLink, ShieldCheck } from 'lucide-vue-next'

const emit = defineEmits<{ 'saiba-mais': [] }>()
</script>

<template>
  <aside class="assinatura-secure">
    <div class="flex min-w-0 items-start gap-3">
      <span
        class="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-glow-gold-cta/15 text-glow-gold-cta"
      >
        <ShieldCheck :size="18" :stroke-width="1.75" />
      </span>
      <div class="min-w-0">
        <p class="font-urbanist text-[14px] font-semibold text-glow-text">
          Você está protegido!
        </p>
        <p class="mt-0.5 font-urbanist text-[12px] leading-relaxed text-glow-text-subtle">
          Seus dados e pagamentos são processados com segurança via Mercado Pago.
          Cancele quando quiser — o acesso segue até o fim do ciclo já pago.
        </p>
      </div>
    </div>
    <button type="button" class="assinatura-btn-secondary shrink-0" @click="emit('saiba-mais')">
      Saiba mais
      <ExternalLink :size="14" :stroke-width="1.75" />
    </button>
  </aside>
</template>

<style scoped>
.assinatura-secure {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-radius: 16px;
  border: 1px solid var(--glow-border-soft);
  background: color-mix(in srgb, var(--glow-gold-cta) 6%, var(--glow-surface));
  padding: 1rem 1.15rem;
  animation: assinatura-fade-up 0.55s ease 0.16s both;
}
@keyframes assinatura-fade-up {
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

<script setup lang="ts">
import { computed, type Component } from 'vue'
import {
  CalendarCheck,
  Check,
  ChevronRight,
  Headphones,
  Network,
  PieChart,
  Sparkles,
  Users,
  Zap,
} from 'lucide-vue-next'
import { getPlanoFeatures } from '@/utils/planoDisplay'
import type { Plano } from '@/types/plano.types'

const props = defineProps<{
  plano: Plano | null
  planoNome?: string | null
}>()

const emit = defineEmits<{ 'ver-beneficios': [] }>()

const ICON_CYCLE: Component[] = [
  CalendarCheck,
  Users,
  Zap,
  PieChart,
  Network,
  Headphones,
  Sparkles,
]

const beneficios = computed(() => {
  const features = props.plano ? getPlanoFeatures(props.plano) : []
  const fallback = [
    'Agenda ilimitada',
    'Clientes ilimitados',
    'Profissionais ilimitados',
    'Serviços ilimitados',
    'Relatórios avançados',
    'Integrações exclusivas',
    'Suporte prioritário',
  ]
  const list = features.length ? features : fallback
  return list.slice(0, 7).map((titulo, i) => ({
    id: `${i}-${titulo}`,
    titulo,
    icon: ICON_CYCLE[i % ICON_CYCLE.length],
  }))
})
</script>

<template>
  <section class="assinatura-panel flex h-full flex-col">
    <h2 class="font-urbanist text-[16px] font-semibold text-glow-text">
      Benefícios do plano
    </h2>
    <p class="mt-1 font-urbanist text-[12px] text-glow-text-subtle">
      O que {{ planoNome ?? 'seu plano' }} libera para a loja
    </p>

    <ul class="mt-4 flex-1 space-y-1">
      <li
        v-for="item in beneficios"
        :key="item.id"
        class="flex items-center gap-3 rounded-xl px-1 py-2.5 transition-colors hover:bg-glow-hover-surface"
      >
        <span class="assinatura-benefit-icon">
          <component :is="item.icon" :size="15" :stroke-width="1.75" />
        </span>
        <span class="min-w-0 flex-1 font-urbanist text-[13px] font-medium text-glow-text">
          {{ item.titulo }}
        </span>
        <Check :size="16" class="shrink-0 text-glow-success" :stroke-width="2.25" />
      </li>
    </ul>

    <button
      type="button"
      class="assinatura-btn-secondary mt-4 w-full justify-center"
      @click="emit('ver-beneficios')"
    >
      Ver todos os benefícios
      <ChevronRight :size="16" :stroke-width="1.75" />
    </button>
  </section>
</template>

<style scoped>
.assinatura-panel {
  border-radius: 20px;
  border: 1px solid var(--glow-border-soft);
  background: var(--glow-surface);
  padding: 1.25rem 1.35rem 1.35rem;
  box-shadow: var(--glow-shadow-sm);
  animation: assinatura-fade-up 0.5s ease 0.1s both;
}
.assinatura-benefit-icon {
  display: inline-flex;
  height: 30px;
  width: 30px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: color-mix(in srgb, var(--glow-gold-cta) 12%, transparent);
  color: var(--glow-gold-cta);
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

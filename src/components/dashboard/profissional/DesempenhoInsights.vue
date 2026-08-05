<script setup lang="ts">
import { computed, type Component } from 'vue'
import { CalendarCheck, Copy, Link2, Star, ThumbsUp } from 'lucide-vue-next'

const props = defineProps<{
  atendimentosMes: number
  atendimentosHoje: number
  notaMedia: number | null
  totalAvaliacoes: number
  temLink: boolean
  loading?: boolean
}>()

const emit = defineEmits<{ 'copiar-link': [] }>()

interface InsightItem {
  id: string
  icon: Component
  label: string
  value: string
  detail: string
  clickable?: boolean
}

const insights = computed<InsightItem[]>(() => [
  {
    id: 'mes',
    icon: CalendarCheck,
    label: 'Atendimentos no mês',
    value: String(props.atendimentosMes),
    detail: 'Total com você neste período',
  },
  {
    id: 'hoje',
    icon: ThumbsUp,
    label: 'Atendimentos hoje',
    value: String(props.atendimentosHoje),
    detail: props.atendimentosHoje === 0 ? 'Agenda livre por enquanto' : 'Na sua fila de hoje',
  },
  {
    id: 'nota',
    icon: Star,
    label: 'Nota média',
    value: props.notaMedia != null ? props.notaMedia.toFixed(1) : '—',
    detail: props.totalAvaliacoes
      ? `${props.totalAvaliacoes} avaliações recebidas`
      : 'Ainda sem avaliações',
  },
  {
    id: 'link',
    icon: props.temLink ? Link2 : Copy,
    label: 'Link de agendamento',
    value: props.temLink ? 'Disponível' : 'Indisponível',
    detail: props.temLink ? 'Toque para copiar e compartilhar' : 'Configure seu perfil público',
    clickable: props.temLink,
  },
])
</script>

<template>
  <section
    class="flex h-full flex-col rounded-2xl border border-glow-border-soft bg-glow-surface p-5 shadow-glow-sm"
  >
    <div class="mb-4">
      <h2 class="font-urbanist text-[15px] font-semibold text-glow-text">
        Seu desempenho
      </h2>
      <p class="mt-0.5 font-urbanist text-[13px] text-glow-text-subtle">
        Resumo da sua rotina e reputação na loja
      </p>
    </div>

    <div v-if="loading" class="grid flex-1 gap-3 sm:grid-cols-2">
      <span
        v-for="i in 4"
        :key="i"
        class="h-[88px] animate-pulse rounded-xl bg-glow-canvas"
      />
    </div>

    <div v-else class="grid flex-1 content-start gap-3 sm:grid-cols-2">
      <component
        :is="item.clickable ? 'button' : 'div'"
        v-for="item in insights"
        :key="item.id"
        type="button"
        class="perf-card"
        :class="item.clickable ? 'perf-card--clickable' : ''"
        @click="item.clickable && emit('copiar-link')"
      >
        <span class="perf-card__icon">
          <component :is="item.icon" class="size-4" :stroke-width="1.75" />
        </span>
        <div class="min-w-0 flex-1 text-left">
          <p class="font-urbanist text-[11px] font-medium text-glow-text-muted">
            {{ item.label }}
          </p>
          <p class="mt-0.5 truncate font-urbanist text-[14px] font-semibold text-glow-text">
            {{ item.value }}
          </p>
          <p class="mt-0.5 truncate font-urbanist text-[11px] text-glow-text-subtle">
            {{ item.detail }}
          </p>
        </div>
      </component>
    </div>
  </section>
</template>

<style scoped>
.perf-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  border-radius: 14px;
  border: 1px solid var(--glow-border-soft);
  background: var(--glow-canvas);
  padding: 12px;
}
.perf-card--clickable {
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}
.perf-card--clickable:hover {
  border-color: color-mix(in srgb, var(--glow-gold-cta) 40%, transparent);
  background: var(--glow-hover-surface);
}
.perf-card__icon {
  display: inline-flex;
  height: 32px;
  width: 32px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: color-mix(in srgb, var(--glow-gold-cta) 12%, transparent);
  color: var(--glow-gold-cta);
}
</style>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Bell,
  CalendarDays,
  Clock3,
  Crown,
  Receipt,
} from 'lucide-vue-next'
import AssinaturaStatusBadge from '@/components/assinatura/AssinaturaStatusBadge.vue'
import { formatDate } from '@/utils/formatters'
import type { Assinatura } from '@/types/assinatura.types'
import type { Plano } from '@/types/plano.types'

const props = defineProps<{
  planoNome: string | null
  plano: Plano | null
  assinatura: Assinatura
}>()

const descricaoPlano = computed(
  () =>
    props.plano?.descricao ??
    `Aproveite os recursos e benefícios do plano ${props.planoNome ?? 'atual'}.`,
)

const datas = computed(() => [
  {
    id: 'ref',
    icon: CalendarDays,
    label: 'Data de referência',
    value: formatDate(props.assinatura.dataReferenciaCiclo),
  },
  {
    id: 'venc',
    icon: Clock3,
    label: 'Próximo vencimento',
    value: formatDate(props.assinatura.proximaDataVencimento),
  },
  {
    id: 'cob',
    icon: Receipt,
    label: 'Geração da cobrança',
    value: formatDate(props.assinatura.proximaDataGeracaoCobranca),
  },
  {
    id: 'alerta',
    icon: Bell,
    label: 'Alerta por e-mail',
    value: formatDate(props.assinatura.proximaDataAlerta),
  },
])

const statusAtivo = computed(
  () =>
    props.assinatura.status === 'Ativa' ||
    props.assinatura.status === 'Trial' ||
    props.assinatura.status === 'CancelamentoAgendado',
)
</script>

<template>
  <section class="assinatura-hero">
    <div class="assinatura-hero__body">
      <div class="min-w-0 space-y-4">
        <p
          class="font-urbanist text-[11px] font-semibold uppercase tracking-[0.12em] text-glow-gold-cta"
        >
          Plano atual
        </p>
        <div class="flex flex-wrap items-center gap-2.5">
          <h2 class="font-urbanist text-3xl font-bold tracking-tight text-glow-text">
            {{ planoNome ?? `Plano #${assinatura.planoId}` }}
          </h2>
          <AssinaturaStatusBadge :status="assinatura.status" />
        </div>
        <p class="max-w-md font-urbanist text-sm leading-relaxed text-glow-text-subtle">
          {{ descricaoPlano }}
        </p>
        <div
          v-if="statusAtivo"
          class="inline-flex items-start gap-3 rounded-2xl border border-glow-border-soft bg-glow-canvas px-3.5 py-3"
        >
          <span
            class="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-glow-gold-cta/15 text-glow-gold-cta"
          >
            <Crown :size="18" :stroke-width="1.75" />
          </span>
          <div>
            <p class="font-urbanist text-[13px] font-semibold text-glow-text">
              Sua assinatura está ativa
            </p>
            <p class="mt-0.5 flex items-center gap-1.5 font-urbanist text-[12px] text-glow-text-subtle">
              <span class="size-1.5 rounded-full bg-glow-success" aria-hidden="true" />
              Renovação automática habilitada
            </p>
          </div>
        </div>
      </div>

      <div class="grid gap-3 sm:grid-cols-2">
        <div v-for="item in datas" :key="item.id" class="assinatura-hero__meta">
          <span class="assinatura-hero__meta-icon">
            <component :is="item.icon" :size="15" :stroke-width="1.75" />
          </span>
          <div class="min-w-0">
            <p class="font-urbanist text-[11px] text-glow-text-muted">{{ item.label }}</p>
            <p class="mt-0.5 truncate font-urbanist text-[13px] font-semibold text-glow-text">
              {{ item.value }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.assinatura-hero {
  padding: 1.5rem;
  border-radius: 20px;
  border: 1px solid var(--glow-border-soft);
  background:
    radial-gradient(
      120% 80% at 100% 0%,
      color-mix(in srgb, var(--glow-gold-cta) 8%, transparent),
      transparent 55%
    ),
    var(--glow-surface);
  box-shadow: var(--glow-shadow-sm);
  animation: assinatura-fade-up 0.45s ease both;
}
@media (min-width: 1024px) {
  .assinatura-hero {
    padding: 1.75rem;
  }
}
.assinatura-hero__body {
  display: grid;
  gap: 1.5rem;
}
@media (min-width: 768px) {
  .assinatura-hero__body {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
    align-items: start;
  }
}
.assinatura-hero__meta {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  border-radius: 14px;
  border: 1px solid var(--glow-border-soft);
  background: var(--glow-canvas);
  padding: 0.75rem 0.875rem;
}
.assinatura-hero__meta-icon {
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

<script setup lang="ts">
import { History } from 'lucide-vue-next'
import type { TimelineGroup } from '@/utils/dashboardClienteUtils'
import {
  agendamentoStatusLabel,
  formatCurrency,
  formatTime,
  initialsFromName,
} from '@/utils/formatters'
import DashboardEmptyState from './DashboardEmptyState.vue'

defineProps<{
  groups: TimelineGroup[]
  loading?: boolean
}>()

const emit = defineEmits<{ 'ver-todos': []; explorar: [] }>()
</script>

<template>
  <section
    class="flex h-full w-full flex-col rounded-2xl border border-glow-border-soft bg-glow-surface p-5 shadow-glow-sm"
  >
    <div class="mb-3 flex items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <History :size="16" class="text-glow-gold-cta" :stroke-width="1.75" />
        <div>
          <h2 class="font-urbanist text-[15px] font-semibold text-glow-text">
            Histórico recente
          </h2>
          <p class="font-urbanist text-[12px] text-glow-text-subtle">
            Últimos acontecimentos da sua conta
          </p>
        </div>
      </div>
      <button
        v-if="groups.length"
        type="button"
        class="shrink-0 font-urbanist text-[12px] font-semibold text-glow-gold-cta hover:underline"
        @click="emit('ver-todos')"
      >
        Ver todos
      </button>
    </div>

    <div v-if="loading" class="flex flex-col gap-2">
      <span v-for="i in 4" :key="i" class="h-11 animate-pulse rounded-xl bg-glow-canvas" />
    </div>

    <DashboardEmptyState
      v-else-if="groups.length === 0"
      title="Histórico em branco"
      description="Confirmações e atendimentos concluídos aparecem aqui."
    >
      <button type="button" class="cliente-btn-cta" @click="emit('explorar')">
        Fazer primeiro agendamento
      </button>
    </DashboardEmptyState>

    <div v-else class="flex flex-col gap-2.5">
      <div v-for="group in groups" :key="group.id" class="flex flex-col gap-1">
        <p
          class="font-urbanist text-[10px] font-semibold uppercase tracking-[0.08em] text-glow-text-muted"
        >
          {{ group.label }}
        </p>
        <div v-for="ag in group.items" :key="ag.id" class="history-row">
          <span
            class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-glow-surface-tint font-urbanist text-xs font-bold text-glow-text-subtle"
          >
            {{ initialsFromName(ag.itens[0]?.profissionalNome ?? ag.estabelecimentoNome) }}
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate font-urbanist text-[13px] font-medium text-glow-text">
              {{ ag.itens[0]?.servicoNome ?? 'Atendimento' }}
              ·
              {{ ag.estabelecimentoNome }}
            </p>
            <p class="font-urbanist text-[11px] text-glow-text-muted">
              {{ formatTime(ag.inicio) }} · {{ agendamentoStatusLabel(ag.status) }}
            </p>
          </div>
          <span class="shrink-0 font-urbanist text-[12px] font-semibold text-glow-text">
            {{ formatCurrency(ag.valorTotal) }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.history-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border-radius: 12px;
  transition: background 0.15s ease;
}
.history-row:hover {
  background: color-mix(in srgb, var(--glow-text) 5%, transparent);
}
</style>

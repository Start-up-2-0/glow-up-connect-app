<script setup lang="ts">
import { History } from 'lucide-vue-next'
import type { TimelineGroup } from '@/utils/dashboardClienteUtils'
import { formatCurrency, formatTime, initialsFromName } from '@/utils/formatters'
import DashboardEmptyState from './DashboardEmptyState.vue'

defineProps<{
  groups: TimelineGroup[]
  loading?: boolean
}>()

const emit = defineEmits<{ 'ver-todos': []; explorar: [] }>()
</script>

<template>
  <section class="flex h-full w-full flex-col rounded-2xl border border-glow-border-soft bg-glow-surface p-5 shadow-glow-sm">
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <History :size="18" class="text-glow-gold-cta" :stroke-width="1.75" />
        <h2 class="font-urbanist text-[16px] font-bold text-glow-text">Histórico</h2>
      </div>
      <button v-if="groups.length" type="button" class="font-urbanist text-[13px] font-semibold text-glow-gold-cta hover:underline" @click="emit('ver-todos')">
        Ver todos
      </button>
    </div>

    <div v-if="loading" class="flex flex-col gap-3">
      <span v-for="i in 3" :key="i" class="h-14 animate-pulse rounded-xl bg-glow-canvas" />
    </div>

    <DashboardEmptyState
      v-else-if="groups.length === 0"
      title="Seu histórico ainda está vazio"
      description="Seus atendimentos concluídos aparecerão aqui."
    >
      <button type="button" class="cliente-btn-cta" @click="emit('explorar')">Agendar agora</button>
    </DashboardEmptyState>

    <div v-else class="flex flex-col gap-3">
      <div v-for="group in groups" :key="group.id" class="flex flex-col gap-1.5">
        <p class="font-urbanist text-[11px] font-semibold uppercase tracking-wider text-glow-text-soft">
          {{ group.label }}
        </p>
        <div v-for="ag in group.items" :key="ag.id" class="history-row">
          <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-glow-surface-tint font-urbanist text-sm font-bold text-glow-text-subtle">
            {{ initialsFromName(ag.itens[0]?.profissionalNome ?? ag.estabelecimentoNome) }}
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate font-urbanist text-[13px] font-semibold text-glow-text">
              {{ ag.itens[0]?.servicoNome ?? 'Atendimento' }} · {{ ag.itens[0]?.profissionalNome ?? ag.estabelecimentoNome }}
            </p>
            <p class="font-urbanist text-[11px] text-glow-text-subtle">{{ formatTime(ag.inicio) }}</p>
          </div>
          <span class="font-urbanist text-[13px] font-semibold text-glow-text">{{ formatCurrency(ag.valorTotal) }}</span>
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
  padding: 8px;
  border-radius: 14px;
  transition: background 0.2s ease;
}
.history-row:hover {
  background: color-mix(in srgb, var(--glow-text) 5%, transparent);
}
</style>
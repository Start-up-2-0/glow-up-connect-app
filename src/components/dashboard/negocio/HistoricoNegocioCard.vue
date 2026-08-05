<script setup lang="ts">
import { History } from 'lucide-vue-next'
import type { AgendaGeral } from '@/types/negocio/agenda.types'
import {
  agendamentoStatusLabel,
  formatDate,
  formatTime,
  initialsFromName,
} from '@/utils/formatters'
import DashboardEmptyState from '@/components/dashboard/cliente/DashboardEmptyState.vue'

defineProps<{
  itens: AgendaGeral[]
  loading?: boolean
}>()

const emit = defineEmits<{ 'ver-todos': [] }>()
</script>

<template>
  <section
    class="flex h-full flex-col rounded-2xl border border-glow-border-soft bg-glow-surface p-5 shadow-glow-sm"
  >
    <div class="mb-3 flex items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <History :size="16" class="text-glow-gold-cta" :stroke-width="1.75" />
        <div>
          <h2 class="font-urbanist text-[15px] font-semibold text-glow-text">
            Histórico recente
          </h2>
          <p class="font-urbanist text-[12px] text-glow-text-subtle">
            Últimos atendimentos da loja
          </p>
        </div>
      </div>
      <button
        v-if="itens.length"
        type="button"
        class="shrink-0 font-urbanist text-[12px] font-semibold text-glow-gold-cta hover:underline"
        @click="emit('ver-todos')"
      >
        Ver agenda
      </button>
    </div>

    <div v-if="loading" class="flex flex-col gap-2">
      <span v-for="i in 4" :key="i" class="h-11 animate-pulse rounded-xl bg-glow-canvas" />
    </div>

    <DashboardEmptyState
      v-else-if="itens.length === 0"
      title="Histórico em branco"
      description="Os atendimentos concluídos e recentes aparecem aqui."
    >
      <button type="button" class="cliente-btn-cta" @click="emit('ver-todos')">
        Abrir agenda
      </button>
    </DashboardEmptyState>

    <ul v-else class="flex flex-col gap-1">
      <li v-for="ag in itens" :key="ag.id" class="hist-row">
        <span class="hist-row__avatar">
          {{ initialsFromName(ag.clienteNome) }}
        </span>
        <div class="min-w-0 flex-1">
          <p class="truncate font-urbanist text-[13px] font-medium text-glow-text">
            {{ ag.itens[0]?.servicoNome ?? 'Atendimento' }} · {{ ag.clienteNome }}
          </p>
          <p class="font-urbanist text-[11px] text-glow-text-muted">
            {{ formatDate(ag.inicio) }} · {{ formatTime(ag.inicio) }}
            ·
            {{ agendamentoStatusLabel(ag.status) }}
          </p>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.hist-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 14px;
  transition: background 0.15s ease;
}
.hist-row:hover {
  background: color-mix(in srgb, var(--glow-text) 5%, transparent);
}
.hist-row__avatar {
  display: inline-flex;
  height: 32px;
  width: 32px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--glow-surface-tint);
  font-family: 'Urbanist', ui-sans-serif, system-ui, sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: var(--glow-text-subtle);
}
</style>

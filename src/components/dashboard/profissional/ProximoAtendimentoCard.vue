<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, Calendar, Clock, Scissors, UserRound } from 'lucide-vue-next'
import type { AgendaProfissional } from '@/types/negocio/agenda.types'
import {
  agendamentoStatusLabel,
  formatDate,
  formatTime,
  initialsFromName,
} from '@/utils/formatters'
import DashboardEmptyState from '@/components/dashboard/cliente/DashboardEmptyState.vue'

const props = defineProps<{
  agendamento: AgendaProfissional | null
  loading?: boolean
}>()

const emit = defineEmits<{ 'ver-agenda': []; 'ver-item': [id: number] }>()

function tempoRestante(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now()
  if (ms < 0) return 'Em andamento'
  const horas = Math.floor(ms / 3_600_000)
  if (horas < 1) return 'Em breve'
  if (horas < 24) return `Em ${horas}h`
  return `Em ${Math.floor(horas / 24)} dias`
}

const chip = computed(() => {
  if (!props.agendamento) return null
  return tempoRestante(props.agendamento.inicio)
})
</script>

<template>
  <section
    class="flex h-full flex-col overflow-hidden rounded-2xl border border-glow-border-soft bg-glow-surface shadow-glow-sm"
  >
    <div
      class="flex items-center justify-between gap-3 border-b border-glow-border-soft px-5 py-3.5"
    >
      <div>
        <h2 class="font-urbanist text-[15px] font-semibold text-glow-text">
          Próximo atendimento
        </h2>
        <p class="font-urbanist text-[12px] text-glow-text-subtle">
          Seu próximo horário com o cliente
        </p>
      </div>
      <span
        v-if="chip && !loading"
        class="shrink-0 rounded-full bg-glow-gold-selected px-2.5 py-0.5 font-urbanist text-[11px] font-semibold text-glow-gold-cta"
      >
        {{ chip }}
      </span>
    </div>

    <div class="flex flex-1 flex-col p-5">
      <div v-if="loading" class="flex gap-4">
        <span class="h-14 w-14 shrink-0 animate-pulse rounded-2xl bg-glow-canvas" />
        <div class="flex-1 space-y-3 pt-1">
          <span class="block h-4 w-1/2 animate-pulse rounded bg-glow-canvas" />
          <span class="block h-4 w-2/3 animate-pulse rounded bg-glow-canvas" />
        </div>
      </div>

      <DashboardEmptyState
        v-else-if="!agendamento"
        title="Nenhum horário marcado"
        description="Quando agendarem com você, o próximo atendimento aparece aqui."
      >
        <button type="button" class="cliente-btn-cta" @click="emit('ver-agenda')">
          Ver minha agenda
          <ArrowRight :size="16" :stroke-width="2" />
        </button>
      </DashboardEmptyState>

      <div v-else class="flex flex-1 flex-col gap-5">
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <span
              class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-glow-gold-cta/15 font-urbanist text-lg font-bold text-glow-gold-cta"
            >
              {{ initialsFromName(agendamento.clienteNome) }}
            </span>
            <div class="min-w-0">
              <p class="truncate font-urbanist text-lg font-semibold text-glow-text">
                {{ agendamento.servicoNome }}
              </p>
              <p class="truncate font-urbanist text-[13px] text-glow-text-subtle">
                com {{ agendamento.clienteNome }}
              </p>
            </div>
          </div>

          <div class="grid gap-2 sm:grid-cols-2">
            <div class="meta">
              <Calendar :size="14" :stroke-width="1.75" />
              <span
                >{{ formatDate(agendamento.inicio) }} · {{ formatTime(agendamento.inicio) }}–{{
                  formatTime(agendamento.fim)
                }}</span
              >
            </div>
            <div class="meta">
              <Clock :size="14" :stroke-width="1.75" />
              <span>{{ agendamentoStatusLabel(agendamento.status) }}</span>
            </div>
            <div class="meta">
              <UserRound :size="14" :stroke-width="1.75" />
              <span>{{ agendamento.clienteNome }}</span>
            </div>
            <div class="meta">
              <Scissors :size="14" :stroke-width="1.75" />
              <span>{{ agendamento.servicoNome }}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="cliente-btn-cta mt-auto w-full justify-center self-start sm:w-auto"
          @click="emit('ver-item', agendamento.agendamentoId)"
        >
          Ver detalhe
          <ArrowRight :size="16" :stroke-width="2" />
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.meta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 11px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--glow-text) 5%, transparent);
  font-family: 'Urbanist', ui-sans-serif, system-ui, sans-serif;
  font-size: 12.5px;
  color: var(--glow-text-subtle);
}
</style>

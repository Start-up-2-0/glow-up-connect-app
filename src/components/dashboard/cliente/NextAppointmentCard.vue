<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, Calendar, Clock, MapPin, Scissors, Store, Wallet } from 'lucide-vue-next'
import type { AgendamentoCliente } from '@/types/agendamento.types'
import { labelDiaAgendamento } from '@/utils/dashboardClienteUtils'
import {
  agendamentoStatusLabel,
  formatCurrency,
  formatDate,
  formatEnderecoResumo,
  formatTime,
  initialsFromName,
} from '@/utils/formatters'
import DashboardEmptyState from './DashboardEmptyState.vue'

const props = defineProps<{
  agendamento: AgendamentoCliente | null
  loading?: boolean
}>()

const emit = defineEmits<{ 'ver-detalhe': [id: number]; explorar: [] }>()

const primeiroItem = computed(() => props.agendamento?.itens?.[0] ?? null)
const profissional = computed(() => primeiroItem.value?.profissionalNome ?? 'Profissional')
const servico = computed(() => primeiroItem.value?.servicoNome ?? 'Atendimento')
const inicial = computed(() => initialsFromName(profissional.value))

function tempoRestante(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now()
  if (ms < 0) return 'Em breve'
  const horas = Math.floor(ms / 3_600_000)
  if (horas < 1) return 'Hoje'
  if (horas < 24) return `Em ${horas}h`
  return `Em ${Math.floor(horas / 24)} dias`
}
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
          Próximo compromisso
        </h2>
        <p class="font-urbanist text-[12px] text-glow-text-subtle">
          Tudo o que você precisa saber sobre o seu próximo horário
        </p>
      </div>
      <span
        v-if="agendamento && !loading"
        class="shrink-0 rounded-full bg-glow-gold-selected px-2.5 py-0.5 font-urbanist text-[11px] font-semibold text-glow-gold-cta"
      >
        {{ labelDiaAgendamento(agendamento.inicio) }} ·
        {{ tempoRestante(agendamento.inicio) }}
      </span>
    </div>

    <div class="flex flex-1 flex-col p-5">
      <div v-if="loading" class="flex gap-4">
        <span class="cliente-skeleton h-14 w-14 shrink-0 rounded-2xl" />
        <div class="flex-1 space-y-3 pt-1">
          <span class="cliente-skeleton h-4 w-1/2" />
          <span class="cliente-skeleton h-4 w-2/3" />
          <span class="cliente-skeleton h-4 w-2/5" />
        </div>
      </div>

      <DashboardEmptyState
        v-else-if="!agendamento"
        title="Nenhum horário marcado"
        description="Quando você agendar, data, serviço, profissional e status aparecem aqui."
      >
        <button type="button" class="cliente-btn-cta" @click="emit('explorar')">
          Agendar agora
          <ArrowRight :size="16" :stroke-width="2" />
        </button>
      </DashboardEmptyState>

      <div v-else class="flex flex-1 flex-col gap-5">
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <span
              class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-glow-gold-cta/15 font-urbanist text-lg font-bold text-glow-gold-cta"
            >
              {{ inicial }}
            </span>
            <div class="min-w-0">
              <p class="truncate font-urbanist text-lg font-semibold text-glow-text">
                {{ servico }}
              </p>
              <p class="truncate font-urbanist text-[13px] text-glow-text-subtle">
                com {{ profissional }}
              </p>
            </div>
          </div>

          <div class="grid gap-2 sm:grid-cols-2">
            <div class="cliente-meta">
              <Calendar :size="14" :stroke-width="1.75" />
              <span
                >{{ formatDate(agendamento.inicio) }} · {{ formatTime(agendamento.inicio) }}–{{
                  formatTime(agendamento.fim)
                }}</span
              >
            </div>
            <div class="cliente-meta">
              <Clock :size="14" :stroke-width="1.75" />
              <span>{{ agendamentoStatusLabel(agendamento.status) }}</span>
            </div>
            <div class="cliente-meta">
              <Store :size="14" :stroke-width="1.75" />
              <span>{{ agendamento.estabelecimentoNome }}</span>
            </div>
            <div class="cliente-meta">
              <Scissors :size="14" :stroke-width="1.75" />
              <span>{{ profissional }}</span>
            </div>
            <div class="cliente-meta sm:col-span-2">
              <MapPin :size="14" :stroke-width="1.75" />
              <span>{{
                formatEnderecoResumo(agendamento.endereco) || agendamento.estabelecimentoNome
              }}</span>
            </div>
            <div class="cliente-meta">
              <Wallet :size="14" :stroke-width="1.75" />
              <span>{{ formatCurrency(agendamento.valorTotal) }}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="cliente-btn-cta mt-auto w-full justify-center sm:w-auto sm:self-start"
          @click="emit('ver-detalhe', agendamento.id)"
        >
          Ver detalhe
          <ArrowRight :size="16" :stroke-width="2" />
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cliente-meta {
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
.cliente-skeleton {
  display: block;
  border-radius: 8px;
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--glow-text) 6%, transparent),
    color-mix(in srgb, var(--glow-text) 14%, transparent),
    color-mix(in srgb, var(--glow-text) 6%, transparent)
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>

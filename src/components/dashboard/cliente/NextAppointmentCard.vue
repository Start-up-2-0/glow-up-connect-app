<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, Calendar, Clock, MapPin, Scissors, Wallet } from 'lucide-vue-next'
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
  if (ms < 0) return 'Agora em breve'
  const horas = Math.floor(ms / 3_600_000)
  if (horas < 1) return 'Hoje'
  if (horas < 24) return `Hoje · em ${horas}h`
  return `Em ${Math.floor(horas / 24)} dias`
}
</script>

<template>
  <section class="w-full rounded-2xl border border-glow-border-soft bg-glow-surface p-5 shadow-glow-sm">
    <!-- Loading skeleton -->
    <div v-if="loading" class="flex gap-4">
      <span class="cliente-skeleton h-14 w-14 rounded-2xl" />
      <div class="flex-1 space-y-3">
        <span class="cliente-skeleton h-4 w-1/2" />
        <span class="cliente-skeleton h-4 w-2/3" />
      </div>
    </div>

    <!-- Empty state -->
    <DashboardEmptyState
      v-else-if="!agendamento"
      title="Nenhum agendamento confirmado"
      description="Quando você confirmar um horário, ele aparecerá aqui com todos os detalhes."
    >
      <button type="button" class="cliente-btn-cta" @click="emit('explorar')">
        Encontrar profissionais
      </button>
    </DashboardEmptyState>

    <!-- Card -->
    <div v-else class="flex flex-col gap-5">
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-center gap-3">
          <span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-glow-gold-cta/15 font-urbanist text-lg font-bold text-glow-gold-cta">
            {{ inicial }}
          </span>
          <div>
            <p class="font-urbanist text-[15px] font-semibold text-glow-text">{{ profissional }}</p>
            <p class="flex items-center gap-1.5 font-urbanist text-[13px] text-glow-text-subtle">
              <Scissors :size="14" :stroke-width="1.75" />
              {{ servico }}
            </p>
          </div>
        </div>
        <span class="rounded-full px-3 py-1 font-urbanist text-[11px] font-semibold text-glow-gold-cta bg-glow-gold-cta/10">
          {{ labelDiaAgendamento(agendamento.inicio) }}
        </span>
      </div>

      <div class="grid gap-2 sm:grid-cols-2">
        <div class="cliente-meta">
          <Clock :size="15" :stroke-width="1.75" />
          <span>
            {{ formatDate(agendamento.inicio) }} · {{ formatTime(agendamento.inicio) }}–{{ formatTime(agendamento.fim) }}
          </span>
        </div>
        <div class="cliente-meta">
          <MapPin :size="15" :stroke-width="1.75" />
          <span>{{ formatEnderecoResumo(agendamento.endereco) || agendamento.estabelecimentoNome }}</span>
        </div>
        <div class="cliente-meta">
          <Wallet :size="15" :stroke-width="1.75" />
          <span>{{ formatCurrency(agendamento.valorTotal) }}</span>
        </div>
        <div class="cliente-meta">
          <Calendar :size="15" :stroke-width="1.75" />
          <span>{{ agendamentoStatusLabel(agendamento.status) }} · {{ tempoRestante(agendamento.inicio) }}</span>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button type="button" class="cliente-btn-cta" @click="emit('ver-detalhe', agendamento.id)">
          Ver detalhe
          <ArrowRight :size="16" :stroke-width="2" />
        </button>
        <button type="button" class="cliente-btn-outline" @click="emit('explorar')">
          Explorar
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
  padding: 8px 10px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--glow-text) 5%, transparent);
  font-family: 'Urbanist', ui-sans-serif, system-ui, sans-serif;
  font-size: 13px;
  color: var(--glow-text-subtle);
}
.cliente-skeleton {
  display: block;
  border-radius: 8px;
  background: linear-gradient(90deg, color-mix(in srgb, var(--glow-text) 6%, transparent), color-mix(in srgb, var(--glow-text) 14%, transparent), color-mix(in srgb, var(--glow-text) 6%, transparent));
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
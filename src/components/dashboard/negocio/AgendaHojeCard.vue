<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, CalendarClock } from 'lucide-vue-next'
import type { AgendaGeral } from '@/types/negocio/agenda.types'
import {
  agendamentoStatusLabel,
  formatCurrency,
  formatTime,
  initialsFromName,
} from '@/utils/formatters'
import DashboardEmptyState from '@/components/dashboard/cliente/DashboardEmptyState.vue'

const props = defineProps<{
  itens: AgendaGeral[]
  loading?: boolean
}>()

const emit = defineEmits<{ 'ver-agenda': []; 'ver-item': [id: number] }>()

const proximos = computed(() => {
  const agora = Date.now()
  return [...props.itens]
    .filter((a) => a.status !== 'Cancelado')
    .sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime())
    .filter((a) => new Date(a.fim).getTime() >= agora || new Date(a.inicio).getTime() >= agora - 3_600_000)
    .slice(0, 5)
})

const destaque = computed(() => proximos.value[0] ?? null)
const resto = computed(() => proximos.value.slice(1))
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
          Agenda de hoje
        </h2>
        <p class="font-urbanist text-[12px] text-glow-text-subtle">
          Próximos horários da loja
        </p>
      </div>
      <span
        v-if="!loading"
        class="shrink-0 rounded-full bg-glow-gold-selected px-2.5 py-0.5 font-urbanist text-[11px] font-semibold text-glow-gold-cta"
      >
        {{ proximos.length }} na fila
      </span>
    </div>

    <div class="flex flex-1 flex-col p-5">
      <div v-if="loading" class="flex flex-col gap-3">
        <span class="h-20 animate-pulse rounded-xl bg-glow-canvas" />
        <span v-for="i in 3" :key="i" class="h-12 animate-pulse rounded-xl bg-glow-canvas" />
      </div>

      <DashboardEmptyState
        v-else-if="!destaque"
        title="Nenhum horário hoje"
        description="Quando houver agendamentos, eles aparecem aqui em ordem."
        :icon="CalendarClock"
      >
        <button type="button" class="cliente-btn-cta" @click="emit('ver-agenda')">
          Abrir agenda
          <ArrowRight :size="16" :stroke-width="2" />
        </button>
      </DashboardEmptyState>

      <template v-else>
        <button
          type="button"
          class="destaque"
          @click="emit('ver-item', destaque.id)"
        >
          <span class="destaque__avatar">
            {{ initialsFromName(destaque.clienteNome) }}
          </span>
          <div class="min-w-0 flex-1 text-left">
            <p class="truncate font-urbanist text-[15px] font-semibold text-glow-text">
              {{ destaque.itens[0]?.servicoNome ?? 'Atendimento' }}
            </p>
            <p class="truncate font-urbanist text-[12px] text-glow-text-subtle">
              {{ destaque.clienteNome }}
              ·
              {{ destaque.itens[0]?.profissionalNome ?? '—' }}
            </p>
            <p class="mt-1 font-urbanist text-[12px] text-glow-text-muted">
              {{ formatTime(destaque.inicio) }}–{{ formatTime(destaque.fim) }}
              ·
              {{ agendamentoStatusLabel(destaque.status) }}
              ·
              {{ formatCurrency(destaque.valorTotal) }}
            </p>
          </div>
        </button>

        <ul v-if="resto.length" class="mt-3 flex flex-col gap-1">
          <li v-for="item in resto" :key="item.id">
            <button type="button" class="fila-row" @click="emit('ver-item', item.id)">
              <span class="fila-row__time">{{ formatTime(item.inicio) }}</span>
              <div class="min-w-0 flex-1 text-left">
                <p class="truncate font-urbanist text-[13px] font-medium text-glow-text">
                  {{ item.clienteNome }}
                </p>
                <p class="truncate font-urbanist text-[11px] text-glow-text-subtle">
                  {{ item.itens[0]?.servicoNome ?? 'Atendimento' }}
                  ·
                  {{ item.itens[0]?.profissionalNome ?? '—' }}
                </p>
              </div>
              <span class="fila-row__status">{{ agendamentoStatusLabel(item.status) }}</span>
            </button>
          </li>
        </ul>

        <button
          type="button"
          class="cliente-btn-cta mt-auto w-full justify-center self-start sm:w-auto"
          @click="emit('ver-agenda')"
        >
          Ver agenda
          <ArrowRight :size="16" :stroke-width="2" />
        </button>
      </template>
    </div>
  </section>
</template>

<style scoped>
.destaque {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 12px;
  border-radius: 14px;
  border: 1px solid var(--glow-border-soft);
  background: var(--glow-canvas);
  padding: 14px;
  text-align: left;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}
.destaque:hover {
  border-color: color-mix(in srgb, var(--glow-gold-cta) 40%, transparent);
  background: var(--glow-hover-surface);
}
.destaque__avatar {
  display: inline-flex;
  height: 48px;
  width: 48px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: color-mix(in srgb, var(--glow-gold-cta) 15%, transparent);
  font-family: 'Urbanist', ui-sans-serif, system-ui, sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: var(--glow-gold-cta);
}
.fila-row {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
  border-radius: 12px;
  padding: 8px 10px;
  transition: background 0.15s ease;
}
.fila-row:hover {
  background: color-mix(in srgb, var(--glow-text) 5%, transparent);
}
.fila-row__time {
  width: 42px;
  flex-shrink: 0;
  font-family: 'Urbanist', ui-sans-serif, system-ui, sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: var(--glow-text-subtle);
}
.fila-row__status {
  flex-shrink: 0;
  font-family: 'Urbanist', ui-sans-serif, system-ui, sans-serif;
  font-size: 11px;
  color: var(--glow-text-muted);
}
</style>

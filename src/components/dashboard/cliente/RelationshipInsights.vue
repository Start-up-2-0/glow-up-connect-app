<script setup lang="ts">
import { computed } from 'vue'
import {
  CalendarDays,
  Clock3,
  MapPin,
  Scissors,
  Store,
  UserRound,
} from 'lucide-vue-next'
import type { ClienteRelacionamento } from '@/utils/dashboardClienteUtils'
import { formatDate } from '@/utils/formatters'

const props = defineProps<{
  data: ClienteRelacionamento
  loading?: boolean
}>()

const emit = defineEmits<{ 'abrir-loja': [publicGuid: string] }>()

const tempoCliente = computed(() => {
  if (!props.data.clienteDesde) return null
  const inicio = new Date(props.data.clienteDesde)
  const meses = Math.max(
    0,
    (Date.now() - inicio.getTime()) / (1000 * 60 * 60 * 24 * 30.44),
  )
  if (meses < 1) return 'Menos de 1 mês'
  if (meses < 12) return `${Math.floor(meses)} ${Math.floor(meses) === 1 ? 'mês' : 'meses'}`
  const anos = Math.floor(meses / 12)
  const resto = Math.floor(meses % 12)
  if (resto === 0) return `${anos} ${anos === 1 ? 'ano' : 'anos'}`
  return `${anos}a ${resto}m`
})

const insights = computed(() => {
  const d = props.data
  return [
    {
      id: 'loja',
      icon: Store,
      label: 'Estabelecimento mais frequentado',
      value: d.lojaMaisFrequente?.nome ?? '—',
      detail: d.lojaMaisFrequente
        ? `${d.lojaMaisFrequente.visitas} visita${d.lojaMaisFrequente.visitas > 1 ? 's' : ''}`
        : 'Ainda sem histórico',
      actionGuid: d.lojaMaisFrequente?.publicGuid ?? null,
    },
    {
      id: 'profissional',
      icon: UserRound,
      label: 'Profissional preferido',
      value: d.profissionalMaisFrequente?.nome ?? '—',
      detail: d.profissionalMaisFrequente
        ? `${d.profissionalMaisFrequente.visitas}× · ${d.profissionalMaisFrequente.estabelecimentoNome}`
        : 'Ainda sem histórico',
      actionGuid: null as string | null,
    },
    {
      id: 'servico',
      icon: Scissors,
      label: 'Serviço mais contratado',
      value: d.servicoMaisContratado?.nome ?? '—',
      detail: d.servicoMaisContratado
        ? `${d.servicoMaisContratado.vezes} vez${d.servicoMaisContratado.vezes > 1 ? 'es' : ''}`
        : 'Ainda sem histórico',
      actionGuid: null,
    },
    {
      id: 'ultima',
      icon: CalendarDays,
      label: 'Última visita',
      value: d.ultimaVisita ? formatDate(d.ultimaVisita.data) : '—',
      detail: d.ultimaVisita
        ? `${d.ultimaVisita.servico} · ${d.ultimaVisita.estabelecimento}`
        : 'Nenhuma visita concluída',
      actionGuid: null,
    },
    {
      id: 'tempo',
      icon: Clock3,
      label: 'Tempo como cliente',
      value: tempoCliente.value ?? '—',
      detail: d.clienteDesde
        ? `Desde ${formatDate(d.clienteDesde)}`
        : 'Comece agendando seu primeiro horário',
      actionGuid: null,
    },
    {
      id: 'total',
      icon: MapPin,
      label: 'Atendimentos totais',
      value: String(d.totalAtendimentos),
      detail:
        d.frequenciaMediaDias != null
          ? `Média de 1 visita a cada ${d.frequenciaMediaDias} dia${d.frequenciaMediaDias > 1 ? 's' : ''}`
          : 'Frequência ainda em formação',
      actionGuid: null,
    },
  ]
})
</script>

<template>
  <section
    class="flex h-full flex-col rounded-2xl border border-glow-border-soft bg-glow-surface p-5 shadow-glow-sm"
  >
    <div class="mb-4">
      <h2 class="font-urbanist text-[15px] font-semibold text-glow-text">
        Seu relacionamento
      </h2>
      <p class="mt-0.5 font-urbanist text-[13px] text-glow-text-subtle">
        Padrões com base no seu histórico de atendimentos
      </p>
    </div>

    <div v-if="loading" class="grid flex-1 gap-3 sm:grid-cols-2">
      <span
        v-for="i in 6"
        :key="i"
        class="h-[88px] animate-pulse rounded-xl bg-glow-canvas"
      />
    </div>

    <div v-else class="grid flex-1 content-start gap-3 sm:grid-cols-2">
      <component
        :is="item.actionGuid ? 'button' : 'div'"
        v-for="item in insights"
        :key="item.id"
        type="button"
        class="rel-card"
        :class="item.actionGuid ? 'rel-card--clickable' : ''"
        @click="item.actionGuid && emit('abrir-loja', item.actionGuid)"
      >
        <span class="rel-card__icon">
          <component :is="item.icon" class="size-4" :stroke-width="1.75" />
        </span>
        <div class="min-w-0 flex-1">
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
.rel-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  text-align: left;
  border-radius: 14px;
  border: 1px solid var(--glow-border-soft);
  background: var(--glow-canvas);
  padding: 12px;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}
.rel-card--clickable {
  cursor: pointer;
}
.rel-card--clickable:hover {
  border-color: color-mix(in srgb, var(--glow-gold-cta) 40%, transparent);
  background: var(--glow-hover-surface);
}
.rel-card__icon {
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

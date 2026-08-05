<script setup lang="ts">
import { computed } from 'vue'
import { formatCurrency, initialsFromName } from '@/utils/formatters'
import type { MetaProgressoProfissional } from '@/types/negocio/caixa.types'

const props = defineProps<{
  item: MetaProgressoProfissional
}>()

const emit = defineEmits<{ click: [] }>()

const tipoLabel = computed(() => {
  const map: Record<string, string> = {
    Atendimentos: 'Qtd. atendimentos',
    Faturamento: 'Valor faturado',
    Mista: 'Meta mista',
  }
  return map[props.item.tipoMeta] ?? props.item.tipoMeta
})

const realizado = computed(() => {
  if (props.item.tipoMeta === 'Atendimentos') return String(props.item.quantidadeRealizada ?? 0)
  return formatCurrency(props.item.valorRealizado ?? 0)
})

const alvo = computed(() => {
  if (props.item.tipoMeta === 'Atendimentos') return String(props.item.valorMeta)
  return formatCurrency(props.item.valorMeta)
})

const restante = computed(() => {
  if (props.item.atingida) return 'Meta concluída'
  if (props.item.tipoMeta === 'Atendimentos') {
    const resto = Math.max(0, props.item.valorMeta - (props.item.quantidadeRealizada ?? 0))
    return `Faltam ${resto} atendimento${resto !== 1 ? 's' : ''}`
  }
  const resto = Math.max(0, props.item.valorMeta - (props.item.valorRealizado ?? 0))
  return `Faltam ${formatCurrency(resto)}`
})

const previsto = computed(() => {
  const base = props.item.valorRealizado
  if (base == null || base <= 0) return null
  return (base * props.item.percentualComissao) / 100
})

const pct = computed(() => Math.min(Math.max(props.item.percentualProgresso, 0), 100))
</script>

<template>
  <button type="button" class="comiss-card" @click="emit('click')">
    <div class="flex items-start gap-3">
      <span class="comiss-card__avatar">
        {{ initialsFromName(item.nomePublico) }}
      </span>
      <div class="min-w-0 flex-1 text-left">
        <div class="flex flex-wrap items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="truncate font-urbanist text-[14px] font-semibold text-glow-text">
              {{ item.nomePublico }}
            </p>
            <p class="mt-0.5 font-urbanist text-[12px] text-glow-text-subtle">
              {{ tipoLabel }}
            </p>
          </div>
          <span
            class="comiss-card__status"
            :class="item.atingida ? 'comiss-card__status--ok' : 'comiss-card__status--run'"
          >
            {{ item.atingida ? 'Concluída' : 'Em andamento' }}
          </span>
        </div>
      </div>
    </div>

    <div class="mt-4">
      <div class="flex items-end justify-between gap-2">
        <div>
          <p class="font-urbanist text-[13px] font-semibold text-glow-text">
            {{ realizado }}
            <span class="font-normal text-glow-text-muted">/ {{ alvo }}</span>
          </p>
          <p
            class="mt-0.5 font-urbanist text-[11px] font-medium"
            :class="item.atingida ? 'text-glow-success-dark' : 'text-glow-gold-cta'"
          >
            {{ item.percentualProgresso }}% da meta
          </p>
        </div>
        <p class="text-right font-urbanist text-[11px] text-glow-text-subtle">
          {{ restante }}
        </p>
      </div>
      <div class="mt-2 h-2 overflow-hidden rounded-full bg-glow-canvas">
        <div
          class="h-full rounded-full transition-all duration-500"
          :class="item.atingida ? 'bg-glow-success' : 'bg-glow-gold-cta'"
          :style="{ width: `${pct}%` }"
        />
      </div>
    </div>

    <div class="comiss-card__footer">
      <div>
        <p class="font-urbanist text-[10px] uppercase tracking-wide text-glow-text-muted">
          Comissão
        </p>
        <p class="mt-0.5 font-urbanist text-[13px] font-semibold text-glow-text">
          {{ item.percentualComissao }}%
        </p>
      </div>
      <div class="text-right">
        <p class="font-urbanist text-[10px] uppercase tracking-wide text-glow-text-muted">
          Previsto a receber
        </p>
        <p class="mt-0.5 font-urbanist text-[13px] font-semibold text-glow-text">
          {{ previsto != null ? formatCurrency(previsto) : '—' }}
        </p>
      </div>
    </div>
  </button>
</template>

<style scoped>
.comiss-card {
  display: flex;
  width: 100%;
  flex-direction: column;
  border-radius: 18px;
  border: 1px solid var(--glow-border-soft);
  background: var(--glow-surface);
  padding: 1.1rem 1.15rem 0;
  text-align: left;
  box-shadow: var(--glow-shadow-sm);
  transition:
    border-color 0.15s ease,
    transform 0.15s ease;
}
.comiss-card:hover {
  border-color: color-mix(in srgb, var(--glow-gold-cta) 35%, transparent);
  transform: translateY(-1px);
}
.comiss-card__avatar {
  display: inline-flex;
  height: 40px;
  width: 40px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--glow-gold-cta) 14%, transparent);
  font-family: 'Urbanist', ui-sans-serif, system-ui, sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: var(--glow-gold-cta);
}
.comiss-card__status {
  display: inline-flex;
  shrink: 0;
  border-radius: 9999px;
  padding: 0.2rem 0.55rem;
  font-family: 'Urbanist', ui-sans-serif, system-ui, sans-serif;
  font-size: 11px;
  font-weight: 600;
}
.comiss-card__status--ok {
  background: var(--glow-success-bg);
  color: var(--glow-success-dark);
}
.comiss-card__status--run {
  background: color-mix(in srgb, var(--glow-gold-cta) 14%, transparent);
  color: var(--glow-gold-cta);
}
.comiss-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 1rem;
  border-top: 1px solid var(--glow-border-soft);
  background: var(--glow-canvas);
  margin-left: -1.15rem;
  margin-right: -1.15rem;
  border-bottom-left-radius: 18px;
  border-bottom-right-radius: 18px;
  padding: 0.85rem 1.15rem;
}
</style>

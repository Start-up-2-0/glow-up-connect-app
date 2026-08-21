<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUpRight, Check, Minus, Sparkles } from 'lucide-vue-next'
import { FEATURE_FLAGS } from '@/config/features'
import { formatBRL, formatLimite } from '@/utils/formatters'
import { getPlanoFeatures } from '@/utils/planoDisplay'
import type { Plano } from '@/types/plano.types'

const props = defineProps<{
  planos: Plano[]
  planoAtualId: number | null
}>()

const emit = defineEmits<{
  upgrade: [planoId: number]
  'ver-planos': []
}>()

const mostrarTrocaPlano = FEATURE_FLAGS.trocaPlanoHabilitada

const ordenados = computed(() =>
  [...props.planos].sort((a, b) => a.preco - b.preco),
)

const planoAtual = computed(() =>
  ordenados.value.find((p) => p.id === props.planoAtualId) ?? null,
)

const proximoUpgrade = computed(() => {
  if (!planoAtual.value) return ordenados.value[ordenados.value.length - 1] ?? null
  return (
    ordenados.value.find((p) => p.preco > planoAtual.value!.preco) ?? null
  )
})

const featuresComparacao = computed(() => {
  const set = new Set<string>()
  for (const p of ordenados.value) {
    for (const f of getPlanoFeatures(p).slice(0, 4)) set.add(f)
  }
  // limites como linhas objetivas
  return [
    'Profissionais',
    'Estabelecimentos',
    'Destaque no marketplace',
    ...Array.from(set).slice(0, 4),
  ]
})

function valorFeature(plano: Plano, feature: string): string | boolean {
  if (feature === 'Profissionais') return formatLimite(plano.limiteProfissionais)
  if (feature === 'Estabelecimentos') return formatLimite(plano.limiteEstabelecimentos)
  if (feature === 'Destaque no marketplace') return plano.prioridadeListagemPublica
  return getPlanoFeatures(plano).includes(feature)
}

const ctaTitulo = computed(() => {
  if (proximoUpgrade.value) {
    return `Evolua para ${proximoUpgrade.value.nome}`
  }
  return 'Você está no melhor plano'
})

const ctaDesc = computed(() => {
  if (proximoUpgrade.value) {
    return `Desbloqueie mais capacidade e recursos exclusivos a partir de ${formatBRL(proximoUpgrade.value.preco)}/mês.`
  }
  return 'Aproveite todos os recursos Premium disponíveis para a sua operação.'
})
</script>

<template>
  <section class="assinatura-comparacao">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="font-urbanist text-[16px] font-semibold text-glow-text">
          Compare os planos
        </h2>
        <p class="mt-1 font-urbanist text-[13px] text-glow-text-subtle">
          Veja o que muda entre o seu plano e as opções superiores
        </p>
      </div>
    </div>

    <div class="mt-5 overflow-x-auto">
      <table class="assinatura-comparacao__table min-w-[520px] w-full border-collapse">
        <thead>
          <tr>
            <th class="text-left font-urbanist text-[12px] font-medium text-glow-text-muted">
              Recurso
            </th>
            <th
              v-for="plano in ordenados"
              :key="plano.id"
              class="px-2 text-center font-urbanist text-[13px] font-semibold text-glow-text"
              :class="plano.id === planoAtualId ? 'text-glow-gold-cta' : ''"
            >
              {{ plano.nome }}
              <span
                v-if="plano.id === planoAtualId"
                class="mt-1 block text-[10px] font-medium uppercase tracking-wide text-glow-gold-cta"
              >
                Atual
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="font-urbanist text-[13px] text-glow-text-subtle">Valor mensal</td>
            <td
              v-for="plano in ordenados"
              :key="`preco-${plano.id}`"
              class="px-2 text-center font-urbanist text-[13px] font-semibold text-glow-text"
            >
              {{ plano.preco <= 0 ? 'Grátis' : formatBRL(plano.preco) }}
            </td>
          </tr>
          <tr v-for="feature in featuresComparacao" :key="feature">
            <td class="font-urbanist text-[13px] text-glow-text-subtle">{{ feature }}</td>
            <td
              v-for="plano in ordenados"
              :key="`${plano.id}-${feature}`"
              class="px-2 text-center"
            >
              <template v-if="typeof valorFeature(plano, feature) === 'boolean'">
                <Check
                  v-if="valorFeature(plano, feature)"
                  :size="16"
                  class="mx-auto text-glow-success"
                  :stroke-width="2.25"
                />
                <Minus
                  v-else
                  :size="16"
                  class="mx-auto text-glow-text-muted"
                  :stroke-width="2"
                />
              </template>
              <span
                v-else
                class="font-urbanist text-[13px] font-medium text-glow-text"
              >
                {{ valorFeature(plano, feature) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="mostrarTrocaPlano" class="assinatura-cta mt-6">
      <div class="flex min-w-0 items-start gap-3">
        <span
          class="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-glow-gold-cta/15 text-glow-gold-cta"
        >
          <Sparkles :size="20" :stroke-width="1.75" />
        </span>
        <div class="min-w-0">
          <h3 class="font-urbanist text-[17px] font-bold text-glow-text">
            {{ ctaTitulo }}
          </h3>
          <p class="mt-1 font-urbanist text-[13px] leading-relaxed text-glow-text-subtle">
            {{ ctaDesc }}
          </p>
        </div>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          v-if="proximoUpgrade"
          type="button"
          class="assinatura-btn-cta"
          @click="emit('upgrade', proximoUpgrade.id)"
        >
          Fazer upgrade
          <ArrowUpRight :size="16" :stroke-width="2" />
        </button>
        <button type="button" class="assinatura-btn-secondary" @click="emit('ver-planos')">
          Ver todos os planos
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.assinatura-comparacao {
  border-radius: 20px;
  border: 1px solid var(--glow-border-soft);
  background: var(--glow-surface);
  padding: 1.35rem 1.35rem 1.5rem;
  box-shadow: var(--glow-shadow-sm);
  animation: assinatura-fade-up 0.55s ease 0.12s both;
}
.assinatura-comparacao__table th,
.assinatura-comparacao__table td {
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid var(--glow-border-soft);
  vertical-align: middle;
}
.assinatura-comparacao__table tbody tr:last-child td {
  border-bottom: 0;
}
.assinatura-cta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-radius: 16px;
  border: 1px solid color-mix(in srgb, var(--glow-gold-cta) 28%, transparent);
  background:
    linear-gradient(
      120deg,
      color-mix(in srgb, var(--glow-gold-cta) 12%, transparent),
      color-mix(in srgb, var(--glow-gold-cta) 4%, transparent)
    );
  padding: 1.1rem 1.2rem;
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

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { ROUTE_PATHS } from '@/constants/routes'
import { aplicarDescontoPercentual, formatBRL, formatLimite } from '@/utils/formatters'
import type { Plano } from '@/types/plano.types'

const props = withDefaults(
  defineProps<{
    plano: Plano
    destacado?: boolean
    desabilitado?: boolean
    modoLogado?: boolean
    percentualDesconto?: number | null
  }>(),
  {
    modoLogado: false,
  },
)

const checkoutLink = computed(() => ({
  path: props.modoLogado ? ROUTE_PATHS.ONBOARDING_CONTRATAR : ROUTE_PATHS.ONBOARDING_ASSINATURA,
  query: { planoId: String(props.plano.id) },
}))

const temDesconto = computed(() => (props.percentualDesconto ?? 0) > 0)

const precoComDesconto = computed(() =>
  temDesconto.value
    ? aplicarDescontoPercentual(props.plano.preco, props.percentualDesconto!)
    : props.plano.preco,
)
</script>

<template>
  <BaseCard
    :class="[
      'flex h-full flex-col',
      destacado ? 'ring-2 ring-glow-gold' : '',
    ]"
  >
    <div class="mb-4 flex items-start justify-between gap-2">
      <div>
        <h3 class="font-urbanist text-lg font-semibold text-glow-text">{{ plano.nome }}</h3>
        <p v-if="destacado" class="text-xs font-medium text-glow-gold">Mais popular</p>
      </div>
      <span
        v-if="plano.prioridadeListagemPublica"
        class="rounded-full bg-glow-gold/15 px-2 py-0.5 text-xs font-medium text-glow-gold"
      >
        Destaque no marketplace
      </span>
    </div>

    <p class="mb-4 text-sm text-glow-text-subtle">{{ plano.descricao }}</p>

    <div class="mb-4">
      <template v-if="temDesconto">
        <p class="text-sm font-medium text-glow-text-muted line-through">
          {{ formatBRL(plano.preco) }}/mês
        </p>
        <p class="font-satoshi text-2xl font-bold text-glow-text">
          {{ formatBRL(precoComDesconto) }}
          <span class="text-sm font-normal text-glow-text-subtle">/mês</span>
        </p>
        <p class="mt-1 text-xs font-semibold text-glow-gold">
          {{ percentualDesconto }}% off para sempre
        </p>
      </template>
      <p v-else class="font-satoshi text-2xl font-bold text-glow-text">
        {{ formatBRL(plano.preco) }}
        <span class="text-sm font-normal text-glow-text-subtle">/mês</span>
      </p>
    </div>

    <ul class="mb-4 space-y-1 text-sm text-glow-text-subtle">
      <li>Usuários: {{ formatLimite(plano.limiteUsuarios) }}</li>
      <li>Profissionais: {{ formatLimite(plano.limiteProfissionais) }}</li>
      <li>Serviços: {{ formatLimite(plano.limiteServicos) }}</li>
      <li>Agendamentos: {{ formatLimite(plano.limiteAgendamentos) }}</li>
    </ul>

    <ul class="mb-6 flex-1 space-y-1">
      <li
        v-for="modulo in plano.modulos"
        :key="modulo"
        class="flex items-center gap-2 text-sm text-glow-text"
      >
        <span class="text-green-600" aria-hidden="true">✓</span>
        {{ modulo }}
      </li>
    </ul>

    <RouterLink :to="checkoutLink" class="mt-auto">
      <BaseButton variant="primary" block :disabled="desabilitado">
        Começar
      </BaseButton>
    </RouterLink>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import LandingCtaButton from '@/components/landing/LandingCtaButton.vue'
import { LANDING_SECTIONS } from '@/constants/landing'
import { ROUTE_PATHS } from '@/constants/routes'
import { usePlanosStore } from '@/stores/planos.store'
import { useApiError } from '@/composables/useApiError'
import { formatBRL } from '@/utils/formatters'
import type { Plano } from '@/types/plano.types'

const planosStore = usePlanosStore()
const { planos, promocao, loading } = storeToRefs(planosStore)
const { resolveError } = useApiError()
const erro = ref<string | null>(null)

interface PricingCard {
  plano: Plano | null
  nomeExibicao: string
  precoLabel: string
  subtitulo: string
  features: string[]
  popular?: boolean
  gratis?: boolean
}

const FALLBACK_CARDS: Omit<PricingCard, 'plano'>[] = [
  {
    nomeExibicao: 'Básico',
    precoLabel: 'GRÁTIS',
    subtitulo: 'Para começar com o essencial',
    features: ['Agenda básica', 'Cadastro de serviços', 'Até 1 profissional', 'Suporte por e-mail'],
  },
  {
    nomeExibicao: 'Profissional',
    precoLabel: 'R$ 69,90',
    subtitulo: 'Para negócios em crescimento',
    features: ['Módulos avançados', 'Mais profissionais', 'Relatórios', 'Suporte prioritário'],
    popular: true,
  },
  {
    nomeExibicao: 'Empresa',
    precoLabel: 'R$ 145',
    subtitulo: 'Para operações completas',
    features: ['Todos os módulos', 'Equipe ampliada', 'Financeiro completo', 'Destaque no marketplace'],
  },
]

function mapPlanoToCard(plano: Plano, index: number): PricingCard {
  const fallback = FALLBACK_CARDS[index] ?? FALLBACK_CARDS[0]
  const isFirst = index === 0
  const trialGratis = isFirst && promocao.value?.disponivel

  return {
    plano,
    nomeExibicao: fallback.nomeExibicao,
    precoLabel: trialGratis
      ? 'GRÁTIS'
      : `${formatBRL(plano.preco)}`,
    subtitulo: plano.descricao || fallback.subtitulo,
    features:
      plano.funcionalidades.length > 0
        ? plano.funcionalidades.slice(0, 4)
        : fallback.features,
    popular: index === 1,
    gratis: trialGratis,
  }
}

const cards = computed((): PricingCard[] => {
  if (planos.value.length === 0) {
    return FALLBACK_CARDS.map((card) => ({ ...card, plano: null }))
  }

  const sorted = [...planos.value].sort((a, b) => a.preco - b.preco)
  return sorted.slice(0, 3).map((plano, index) => mapPlanoToCard(plano, index))
})

function checkoutTo(planoId: number | undefined) {
  if (!planoId) {
    return { path: ROUTE_PATHS.REGISTER }
  }
  return {
    path: ROUTE_PATHS.ONBOARDING_CHECKOUT,
    query: { planoId: String(planoId) },
  }
}

onMounted(async () => {
  try {
    await planosStore.fetchPlanos()
  } catch (err) {
    erro.value = resolveError(err)
  }
})
</script>

<template>
  <section :id="LANDING_SECTIONS.planos" class="bg-[#f3f3f3] py-20 lg:py-28">
    <div class="mx-auto max-w-7xl px-4 lg:px-8">
      <div class="mx-auto max-w-2xl text-center">
        <p class="font-montserrat text-sm font-semibold uppercase tracking-wider text-glow-purple">
          Planos
        </p>
        <h2 class="mt-3 font-montserrat text-3xl font-bold text-[#282828] lg:text-4xl">
          Escolha o plano ideal para você
        </h2>
        <p class="mt-4 font-poppins text-base text-[#282828]/70">
          Comece grátis na promoção de lançamento ou evolua conforme sua operação cresce.
        </p>
      </div>

      <LoadingSpinner v-if="loading" class="mt-12" />
      <p v-else-if="erro" class="mt-12 text-center text-sm text-red-600">{{ erro }}</p>

      <div v-else class="mt-12 grid gap-6 lg:grid-cols-3">
        <article
          v-for="(card, index) in cards"
          :key="card.nomeExibicao"
          class="relative flex flex-col rounded-2xl bg-white p-8 shadow-sm transition hover:shadow-lg"
          :class="card.popular ? 'ring-2 ring-glow-purple lg:scale-[1.02]' : ''"
        >
          <span
            v-if="card.popular"
            class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-glow-purple px-4 py-1 font-montserrat text-xs font-bold uppercase tracking-wide text-white"
          >
            Popular
          </span>

          <h3 class="font-montserrat text-xl font-bold text-[#282828]">
            {{ card.nomeExibicao }}
          </h3>
          <p class="mt-1 font-poppins text-sm text-[#282828]/60">
            {{ card.subtitulo }}
          </p>

          <div class="mt-6">
            <p class="font-montserrat text-4xl font-black text-[#282828]">
              {{ card.precoLabel }}
            </p>
            <p v-if="!card.gratis && card.plano" class="font-poppins text-sm text-[#282828]/50">
              /mês
            </p>
            <p
              v-if="card.gratis && promocao"
              class="mt-1 font-poppins text-xs text-glow-purple"
            >
              {{ promocao.diasTrial }} dias de trial na promoção de lançamento
            </p>
          </div>

          <ul class="mt-8 flex-1 space-y-3">
            <li
              v-for="feature in card.features"
              :key="feature"
              class="flex items-start gap-3 font-poppins text-sm text-[#282828]/80"
            >
              <span class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-glow-gold/20 text-glow-gold">
                <svg class="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              {{ feature }}
            </li>
          </ul>

          <LandingCtaButton
            class="mt-8 w-full justify-center"
            :to="checkoutTo(card.plano?.id)"
            :label="index === 0 && card.gratis ? 'Começar grátis' : 'Assinar agora'"
            :variant="card.popular ? 'purple' : 'gold'"
          />
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import LandingCtaButton from '@/components/landing/LandingCtaButton.vue'
import LandingSectionTitle from '@/components/landing/LandingSectionTitle.vue'
import { LANDING_SECTIONS } from '@/constants/landing'
import { ROUTE_PATHS } from '@/constants/routes'
import { usePlanosStore } from '@/stores/planos.store'
import { useApiError } from '@/composables/useApiError'
import { formatBRL } from '@/utils/formatters'
import type { Plano } from '@/types/plano.types'

type CardVariant = 'basic' | 'professional' | 'enterprise'

interface LandingPlanoCard {
  plano: Plano
  variant: CardVariant
  popular?: boolean
}

const planosStore = usePlanosStore()
const { planos, promocao, loading } = storeToRefs(planosStore)
const { resolveError } = useApiError()
const erro = ref<string | null>(null)

const planoPlus = computed(() => planos.value.find((p) => p.nome === 'Plus'))

const cards = computed((): LandingPlanoCard[] => {
  const sorted = [...planos.value].sort((a, b) => a.preco - b.preco).slice(0, 3)
  const variants: CardVariant[] = ['basic', 'professional', 'enterprise']

  return sorted.map((plano, index) => ({
    plano,
    variant: variants[index] ?? 'basic',
    popular: plano.id === planoPlus.value?.id || index === 1,
  }))
})

function checkoutTo(planoId: number) {
  return {
    path: ROUTE_PATHS.ONBOARDING_CHECKOUT,
    query: { planoId: String(planoId) },
  }
}

function precoLabel(card: LandingPlanoCard): string {
  const isTrial = card.variant === 'basic' && promocao.value?.disponivel
  if (isTrial) return 'GRÁTIS'
  return formatBRL(card.plano.preco)
}

function features(card: LandingPlanoCard): string[] {
  if (card.plano.funcionalidades.length > 0) {
    return card.plano.funcionalidades
  }
  return card.plano.modulos.length > 0 ? card.plano.modulos : [card.plano.descricao]
}

function ctaLabel(card: LandingPlanoCard): string {
  if (card.variant === 'basic' && promocao.value?.disponivel) {
    return 'Começar grátis'
  }
  return 'Assinar agora'
}

function ctaVariant(card: LandingPlanoCard): 'gold' | 'purple' | 'outline' {
  if (card.popular) return 'purple'
  if (card.variant === 'basic') return 'outline'
  return 'outline'
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
  <section :id="LANDING_SECTIONS.planos" class="bg-[#f3f3f3] px-4 py-20 lg:px-8 lg:py-28">
    <div class="mx-auto max-w-[1280px]">
      <LandingSectionTitle
        before="Invista no seu "
        highlight="estabelecimento"
        size="xl"
        centered
      />

      <p class="mx-auto mt-10 max-w-3xl text-center font-montserrat text-xl leading-[1.09] text-[#282828]">
        <span class="font-light">Escolha o plano ideal para o momento do seu negócio. </span>
        <span class="font-bold">Sem surpresas, sem taxas escondidas</span>
        <span class="font-light">.</span>
      </p>

      <LoadingSpinner v-if="loading" class="mt-16" />
      <p v-else-if="erro" class="mt-16 text-center text-sm text-red-600">{{ erro }}</p>
      <EmptyState
        v-else-if="cards.length === 0"
        class="mt-16"
        title="Nenhum plano disponível"
        description="Tente novamente mais tarde."
      />

      <div v-else class="mt-16 grid gap-6 lg:grid-cols-3">
        <article
          v-for="card in cards"
          :key="card.plano.id"
          class="relative flex min-h-[671px] flex-col rounded-[20px] border border-[#282828]/40 p-10"
          :class="card.popular ? 'border-glow-purple bg-glow-purple/[0.08]' : 'bg-transparent'"
        >
          <div
            v-if="card.popular"
            class="absolute left-1/2 top-5 flex -translate-x-1/2 items-center gap-2"
          >
            <svg class="size-4 text-glow-purple" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2l2.9 6.9H22l-5.5 4.5 2.1 6.6L12 16.9 5.4 20l2.1-6.6L2 8.9h7.1L12 2z" />
            </svg>
            <span class="font-montserrat text-sm font-medium text-glow-purple">POPULAR</span>
          </div>

          <div :class="card.popular ? 'mt-8' : ''">
            <h3
              class="font-montserrat text-2xl font-semibold"
              :class="card.popular ? 'text-glow-purple' : 'text-glow-gold'"
            >
              {{ card.plano.nome }}
            </h3>
            <p
              class="mt-7 font-poppins text-base font-light leading-[1.09]"
              :class="card.popular ? 'text-glow-purple-soft' : 'text-[#282828]'"
            >
              {{ card.plano.descricao }}
            </p>
          </div>

          <div class="mt-8">
            <p
              class="inline font-montserrat text-2xl font-black"
              :class="card.popular ? 'text-glow-purple' : 'text-glow-gold'"
            >
              {{ precoLabel(card) }}
            </p>
            <span
              v-if="precoLabel(card) !== 'GRÁTIS'"
              class="ml-1 font-montserrat text-[10px] font-bold"
              :class="card.popular ? 'text-glow-purple' : 'text-glow-gold'"
            >
              /mês
            </span>
            <p
              v-if="card.variant === 'basic' && promocao?.disponivel"
              class="mt-2 font-poppins text-xs text-glow-purple"
            >
              {{ promocao.diasTrial }} dias de trial na promoção de lançamento
            </p>
          </div>

          <ul class="mt-8 flex-1 space-y-2">
            <li
              v-for="feature in features(card).slice(0, 6)"
              :key="feature"
              class="flex items-start gap-2.5 py-2"
            >
              <svg
                class="mt-0.5 size-5 shrink-0"
                :class="card.popular ? 'text-glow-purple' : 'text-glow-gold'"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
              </svg>
              <span
                class="font-poppins text-base font-light leading-[1.09]"
                :class="card.popular ? 'text-glow-purple-soft' : 'text-[#282828]'"
              >
                {{ feature }}
              </span>
            </li>
          </ul>

          <LandingCtaButton
            class="mt-8 w-full justify-center"
            :to="checkoutTo(card.plano.id)"
            :label="ctaLabel(card)"
            :variant="ctaVariant(card)"
          />
        </article>
      </div>
    </div>
  </section>
</template>

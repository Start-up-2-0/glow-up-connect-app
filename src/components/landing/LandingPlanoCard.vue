<script setup lang="ts">
import { computed } from 'vue'
import LandingCtaButton from '@/components/landing/LandingCtaButton.vue'
import { ROUTE_PATHS } from '@/constants/routes'
import { formatBRL } from '@/utils/formatters'
import type { Plano } from '@/types/plano.types'

const props = defineProps<{
  plano: Plano
  popular?: boolean
}>()

const checkoutLink = computed(() => ({
  path: ROUTE_PATHS.ONBOARDING_ASSINATURA,
  query: { planoId: String(props.plano.id) },
}))

const features = computed(() =>
  props.plano.funcionalidades.length > 0
    ? props.plano.funcionalidades
    : props.plano.modulos,
)

const ctaVariant = computed(() => (props.popular ? 'purple' : 'outline'))
</script>

<template>
  <article
    class="relative flex min-h-[671px] flex-col rounded-[20px] border border-[#282828]/40 p-10"
    :class="popular ? 'border-glow-purple bg-glow-purple/[0.08]' : 'bg-transparent'"
  >
    <div
      v-if="popular"
      class="mb-6 flex items-center justify-center gap-2"
    >
      <svg class="size-4 text-glow-purple" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2l2.9 6.9H22l-5.5 4.5 2.1 6.6L12 16.9 5.4 20l2.1-6.6L2 8.9h7.1L12 2z" />
      </svg>
      <span class="font-montserrat text-sm font-medium text-glow-purple">POPULAR</span>
    </div>

    <div class="flex items-start justify-between gap-3" :class="popular ? '' : 'pr-2'">
      <h3
        class="font-montserrat text-2xl font-semibold leading-[1.09]"
        :class="popular ? 'text-glow-purple' : 'text-glow-gold'"
      >
        {{ plano.nome }}
      </h3>
      <span
        v-if="plano.prioridadeListagemPublica && !popular"
        class="shrink-0 rounded-full bg-glow-gold/15 px-2 py-0.5 font-montserrat text-[10px] font-medium text-glow-gold"
      >
        Destaque no marketplace
      </span>
    </div>

    <p
      class="mt-7 font-poppins text-base font-light leading-[1.09]"
      :class="popular ? 'text-glow-purple-soft' : 'text-[#282828]'"
    >
      {{ plano.descricao }}
    </p>

    <div class="mt-8">
      <p
        class="inline font-montserrat text-2xl font-black leading-[1.09]"
        :class="popular ? 'text-glow-purple' : 'text-glow-gold'"
      >
        {{ formatBRL(plano.preco) }}
      </p>
      <span
        class="ml-1 font-montserrat text-[10px] font-bold"
        :class="popular ? 'text-glow-purple' : 'text-glow-gold'"
      >
        /mês
      </span>
    </div>

    <ul class="mt-8 flex-1 space-y-1">
      <li
        v-for="feature in features"
        :key="feature"
        class="flex items-center gap-2.5 py-2"
      >
        <svg
          class="size-5 shrink-0"
          :class="popular ? 'text-glow-purple' : 'text-glow-gold'"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
        </svg>
        <span
          class="font-poppins text-base font-light leading-[1.09]"
          :class="popular ? 'text-glow-purple-soft' : 'text-[#282828]'"
        >
          {{ feature }}
        </span>
      </li>
    </ul>

    <LandingCtaButton
      class="mx-auto mt-8 w-full max-w-[259px] justify-center"
      :to="checkoutLink"
      label="Assinar agora"
      :variant="ctaVariant"
    />
  </article>
</template>

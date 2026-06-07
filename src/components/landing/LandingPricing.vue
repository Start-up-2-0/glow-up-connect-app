<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import PromocaoLancamentoBanner from '@/components/assinatura/PromocaoLancamentoBanner.vue'
import LandingPlanoCard from '@/components/landing/LandingPlanoCard.vue'
import { LANDING_SECTIONS } from '@/constants/landing'
import { usePlanosStore } from '@/stores/planos.store'
import { useApiError } from '@/composables/useApiError'
import type { Plano } from '@/types/plano.types'

const planosStore = usePlanosStore()
const { planos, promocao, loading } = storeToRefs(planosStore)
const { resolveError } = useApiError()
const erro = ref<string | null>(null)

const planoPlus = computed(() => planos.value.find((p) => p.nome === 'Plus'))

function isPopular(plano: Plano): boolean {
  return plano.id === planoPlus.value?.id
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
      <h2
        class="text-center font-montserrat text-4xl font-light leading-[1.09] text-[#282828] sm:text-5xl lg:text-6xl xl:text-[96px]"
      >
        <span class="block">Invista no seu </span>
        <span class="block font-black text-glow-gold">estabelecimento</span>
      </h2>

      <p class="mx-auto mt-10 max-w-3xl text-center font-montserrat text-xl leading-[1.09] text-[#282828]">
        <span class="font-light">Escolha o plano ideal para o momento do seu negócio. </span>
        <span class="font-bold">Sem surpresas, sem taxas escondidas</span>
        <span class="font-light">.</span>
      </p>

      <PromocaoLancamentoBanner
        v-if="promocao?.disponivel"
        class="mx-auto mt-10 max-w-3xl"
        :promocao="promocao"
      />

      <LoadingSpinner v-if="loading" class="mt-16" />
      <p v-else-if="erro" class="mt-16 text-center text-sm text-red-600">{{ erro }}</p>
      <EmptyState
        v-else-if="planos.length === 0"
        class="mt-16"
        title="Nenhum plano disponível"
        description="Tente novamente mais tarde."
      />

      <div
        v-else
        class="mt-16 grid gap-6 lg:grid-cols-3"
        :class="promocao?.disponivel ? 'mt-10' : ''"
      >
        <LandingPlanoCard
          v-for="plano in planos"
          :key="plano.id"
          :plano="plano"
          :popular="isPopular(plano)"
        />
      </div>
    </div>
  </section>
</template>

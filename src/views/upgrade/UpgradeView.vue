<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import PlanoCard from '@/components/assinatura/PlanoCard.vue'
import { usePlanosStore } from '@/stores/planos.store'
import { useNegocioStore } from '@/stores/negocio.store'
import { getUpgradeInfo } from '@/constants/upgradeMessages'
import { LANDING_PLANOS_URL, ROUTE_PATHS } from '@/constants/routes'

const route = useRoute()
const planosStore = usePlanosStore()
const negocioStore = useNegocioStore()
const { ehProfissionalAutonomo } = storeToRefs(negocioStore)

const modulo = computed(() => {
  const raw = route.query.modulo
  return typeof raw === 'string' ? raw : undefined
})

const info = computed(() =>
  getUpgradeInfo(modulo.value ?? '', ehProfissionalAutonomo.value),
)

const planosUpgrade = computed(() => {
  if (!ehProfissionalAutonomo.value) return planosStore.planos
  return planosStore.planos.map((plano) => ({
    ...plano,
    funcionalidades: plano.funcionalidades.filter(
      (f) =>
        !/equipe|comiss[aã]o|unidades|multiusuario|rede/i.test(f),
    ),
  }))
})

onMounted(() =>
  planosStore.fetchPlanos(
    true,
    negocioStore.tipoAssinatura ?? undefined,
  ),
)
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-6">
    <BaseCard>
      <h1 class="mb-2 font-satoshi text-xl font-bold text-glow-text">
        {{ ehProfissionalAutonomo ? 'Evolua seu plano profissional' : 'Upgrade necessário' }}
      </h1>
      <p class="text-glow-text-subtle">{{ info.mensagem }}</p>
      <p class="mt-2 text-sm text-glow-text-subtle">
        Disponível no plano <strong>{{ info.planoMinimo }}</strong>
        <span v-if="modulo"> — módulo {{ modulo }}</span>
      </p>
      <div class="mt-4 flex flex-wrap gap-3">
        <RouterLink :to="ROUTE_PATHS.ONBOARDING_PLANOS">
          <BaseButton variant="primary">Ver planos</BaseButton>
        </RouterLink>
        <a :href="LANDING_PLANOS_URL" class="inline-block">
          <BaseButton variant="secondary">Saiba mais</BaseButton>
        </a>
      </div>
    </BaseCard>

    <div v-if="!planosStore.loading" class="grid gap-6 md:grid-cols-2">
      <PlanoCard
        v-for="plano in planosUpgrade"
        :key="plano.id"
        :plano="plano"
        :destacado="plano.nome === info.planoMinimo"
        :tipo-assinatura="ehProfissionalAutonomo ? 'ProfissionalAutonomo' : 'Estabelecimento'"
      />
    </div>
  </div>
</template>

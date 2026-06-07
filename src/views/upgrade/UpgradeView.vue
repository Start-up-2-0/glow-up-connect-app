<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import PlanoCard from '@/components/assinatura/PlanoCard.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import { usePlanosStore } from '@/stores/planos.store'
import { getUpgradeInfo } from '@/constants/upgradeMessages'
import { LANDING_PLANOS_HASH, ROUTE_PATHS } from '@/constants/routes'

const route = useRoute()
const planosStore = usePlanosStore()

const modulo = computed(() => {
  const raw = route.query.modulo
  return typeof raw === 'string' ? raw : undefined
})

const info = computed(() => getUpgradeInfo(modulo.value ?? ''))

onMounted(() => planosStore.fetchPlanos())
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-6">
    <BaseCard>
      <h1 class="mb-2 font-satoshi text-xl font-bold text-glow-text">
        Upgrade necessário
      </h1>
      <p class="text-glow-text-subtle">{{ info.mensagem }}</p>
      <p class="mt-2 text-sm text-glow-text-subtle">
        Disponível no plano <strong>{{ info.planoMinimo }}</strong>
        <span v-if="modulo"> — módulo {{ modulo }}</span>
      </p>
      <RouterLink :to="{ path: ROUTE_PATHS.HOME, hash: LANDING_PLANOS_HASH }" class="mt-4 inline-block">
        <BaseButton variant="primary">Ver todos os planos</BaseButton>
      </RouterLink>
    </BaseCard>

    <LoadingSpinner v-if="planosStore.loading" />
    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <PlanoCard
        v-for="plano in planosStore.planos"
        :key="plano.id"
        :plano="plano"
        :destacado="plano.nome === info.planoMinimo"
      />
    </div>
  </div>
</template>

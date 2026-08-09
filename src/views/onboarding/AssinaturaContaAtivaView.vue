<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AssinaturaContaAtivaWizard from '@/views/onboarding/AssinaturaContaAtivaWizard.vue'
import type { TipoAssinatura } from '@/types/assinatura.types'

const route = useRoute()

const planoId = computed(() => Number(route.query.planoId))
const tipoAssinatura = computed<TipoAssinatura>(() =>
  route.query.tipoAssinatura === 'ProfissionalAutonomo'
    ? 'ProfissionalAutonomo'
    : 'Estabelecimento',
)

const wizardKey = computed(() => `${planoId.value}:${tipoAssinatura.value}`)
</script>

<template>
  <AssinaturaContaAtivaWizard
    :key="wizardKey"
    :plano-id="planoId"
    :tipo-assinatura="tipoAssinatura"
  />
</template>

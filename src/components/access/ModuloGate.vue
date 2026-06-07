<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { ROUTE_PATHS } from '@/constants/routes'
import { getUpgradeInfo } from '@/constants/upgradeMessages'

const props = defineProps<{
  modulo: string
  upgradePlano?: string
  mensagem?: string
}>()

const { possuiModulo, assinaturaAtiva } = useNegocioContext()

const liberado = computed(() => assinaturaAtiva.value && possuiModulo(props.modulo))

const upgradeInfo = computed(() => getUpgradeInfo(props.modulo))
const planoSugerido = computed(() => props.upgradePlano ?? upgradeInfo.value.planoMinimo)
const mensagemExibida = computed(() => props.mensagem ?? upgradeInfo.value.mensagem)

const upgradeLink = computed(() => ({
  path: ROUTE_PATHS.UPGRADE,
  query: { modulo: props.modulo },
}))
</script>

<template>
  <slot v-if="liberado" />
  <slot v-else name="fallback">
    <BaseCard class="text-center">
      <p class="mb-1 font-urbanist text-base font-semibold text-glow-text">
        Recurso indisponível
      </p>
      <p class="mb-4 text-sm text-glow-text-subtle">
        {{ mensagemExibida }}
      </p>
      <p class="mb-4 text-xs text-glow-text-subtle">
        Disponível no plano {{ planoSugerido }}
      </p>
      <RouterLink :to="upgradeLink">
        <BaseButton variant="primary">Ver planos</BaseButton>
      </RouterLink>
    </BaseCard>
  </slot>
</template>

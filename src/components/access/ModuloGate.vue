<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useModuloGuard } from '@/composables/useModuloGuard'
import { ROUTE_PATHS } from '@/constants/routes'
import { getUpgradeInfo } from '@/constants/upgradeMessages'

const props = defineProps<{
  modulo: string
  permissao?: string
}>()

const { liberado } = useModuloGuard(props.modulo, props.permissao)
const upgrade = computed(() => getUpgradeInfo(props.modulo))
</script>

<template>
  <slot v-if="liberado" />
  <div v-else class="rounded-lg border border-dashed border-glow-border-soft p-4 text-center text-sm text-glow-text-subtle">
    <p>{{ upgrade.mensagem }}</p>
    <RouterLink
      :to="{ path: ROUTE_PATHS.UPGRADE, query: { modulo: props.modulo } }"
      class="mt-2 inline-block text-glow-gold hover:underline"
    >
      Ver planos
    </RouterLink>
  </div>
</template>

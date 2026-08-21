<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores/app.store'
import BaseButton from '@/components/ui/BaseButton.vue'
import { ROUTE_PATHS } from '@/constants/routes'
import { getUpgradeInfo } from '@/constants/upgradeMessages'

const appStore = useAppStore()
const { upgradeModal } = storeToRefs(appStore)

const info = computed(() => getUpgradeInfo(upgradeModal.value.modulo ?? ''))

const upgradeLink = computed(() => ({
  path: ROUTE_PATHS.UPGRADE,
  query: upgradeModal.value.modulo ? { modulo: upgradeModal.value.modulo } : undefined,
}))

function fechar() {
  appStore.closeUpgradeModal()
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="upgradeModal.open"
      class="fixed inset-0 z-[3000] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
    >
      <div class="absolute inset-0 glow-modal-scrim" @click="fechar" />
      <div
        class="relative z-10 w-full max-w-md rounded-lg border border-glow-border-soft bg-glow-surface p-6 shadow-xl"
      >
        <h2 id="upgrade-modal-title" class="mb-2 font-urbanist text-lg font-semibold text-glow-text">
          Upgrade necessário
        </h2>
        <p class="mb-2 text-sm text-glow-text-subtle">
          {{ upgradeModal.mensagem ?? info.mensagem }}
        </p>
        <p class="mb-6 text-xs text-glow-text-subtle">
          Disponível no plano {{ upgradeModal.planoMinimo ?? info.planoMinimo }}
        </p>
        <div class="flex justify-end gap-2">
          <BaseButton variant="ghost" @click="fechar">Fechar</BaseButton>
          <RouterLink :to="upgradeLink" @click="fechar">
            <BaseButton variant="primary">Ver planos</BaseButton>
          </RouterLink>
        </div>
      </div>
    </div>
  </Teleport>
</template>

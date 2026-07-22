<script setup lang="ts">
import { useAcessoUsuario } from '@/composables/useAcessoUsuario'
import AppUserMenu from './AppUserMenu.vue'
import EstabelecimentoSelector from './EstabelecimentoSelector.vue'

defineProps<{
  collapsed?: boolean
}>()

const { temVinculoNegocio } = useAcessoUsuario()
</script>

<template>
  <footer
    class="shrink-0 border-t border-glow-border-soft"
    :class="collapsed ? 'px-[7px] py-3' : 'px-0 py-3'"
  >
    <div v-if="!collapsed && temVinculoNegocio" class="mb-3">
      <EstabelecimentoSelector block />
    </div>

    <div :class="collapsed ? 'flex justify-center' : ''">
      <AppUserMenu :collapsed="collapsed" variant="sidebar" />
    </div>
  </footer>
</template>

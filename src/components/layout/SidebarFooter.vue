<script setup lang="ts">
import { ref } from 'vue'
import { useDashboardNav } from '@/composables/useDashboardNav'
import { useAcessoUsuario } from '@/composables/useAcessoUsuario'
import AppNotifications from './AppNotifications.vue'
import AppUserMenu from './AppUserMenu.vue'
import EstabelecimentoSelector from './EstabelecimentoSelector.vue'
import NavbarIconButton from './NavbarIconButton.vue'
import NavbarSearchModal from './NavbarSearchModal.vue'
import NavbarThemeToggle from './NavbarThemeToggle.vue'
import IconSearch from './icons/IconSearch.vue'

defineProps<{
  collapsed?: boolean
}>()

const searchOpen = ref(false)
const { searchPlaceholder } = useDashboardNav()
const { temVinculoNegocio } = useAcessoUsuario()
</script>

<template>
  <div class="shrink-0">
    <div v-if="!collapsed && temVinculoNegocio" class="mb-3">
      <EstabelecimentoSelector block />
    </div>

    <div
      class="border-t border-glow-border-soft"
      :class="collapsed ? 'px-0 py-3' : 'py-3'"
    >
      <div
        class="flex items-center"
        :class="collapsed ? 'justify-center' : 'gap-1.5'"
      >
        <div class="min-w-0" :class="collapsed ? '' : 'min-w-0 flex-1'">
          <AppUserMenu :collapsed="collapsed" variant="sidebar" />
        </div>

        <template v-if="!collapsed">
          <NavbarIconButton label="Pesquisar" size="sm" @click="searchOpen = true">
            <IconSearch :size="18" />
          </NavbarIconButton>
          <NavbarThemeToggle size="sm" />
          <AppNotifications size="sm" panel-align="left" />
        </template>
      </div>
    </div>

    <NavbarSearchModal v-model="searchOpen" :placeholder="searchPlaceholder" />
  </div>
</template>

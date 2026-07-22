<script setup lang="ts">
import AppLogo from './AppLogo.vue'
import SidebarSearchField from './SidebarSearchField.vue'
import SidebarThemeSwitch from './SidebarThemeSwitch.vue'
import SidebarToggleButton from './SidebarToggleButton.vue'

defineProps<{
  collapsed?: boolean
  mobile?: boolean
}>()

defineEmits<{
  toggle: []
}>()
</script>

<template>
  <div
    class="flex w-full shrink-0 flex-col"
    :class="collapsed ? 'items-center gap-[65px]' : 'gap-4'"
  >
    <div
      class="flex w-full items-center"
      :class="collapsed ? 'justify-center' : 'justify-between gap-2'"
    >
      <AppLogo v-if="!collapsed" :mobile="mobile" sidebar />
      <SidebarToggleButton
        :collapsed="collapsed"
        class="shrink-0"
        @toggle="$emit('toggle')"
      />
    </div>

    <template v-if="!collapsed">
      <SidebarSearchField />
      <SidebarThemeSwitch />
    </template>
  </div>
</template>

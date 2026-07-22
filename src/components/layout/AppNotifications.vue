<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useNotificationsStore } from '@/stores/notifications.store'
import NavbarIconButton from './NavbarIconButton.vue'
import IconBell from './icons/IconBell.vue'

withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg'
    panelAlign?: 'left' | 'right'
  }>(),
  { size: 'md', panelAlign: 'right' },
)

const notificationsStore = useNotificationsStore()
const { items, unreadCount } = storeToRefs(notificationsStore)

const open = ref(false)
const rootEl = ref<HTMLElement | null>(null)

function toggle() {
  open.value = !open.value
  if (open.value) notificationsStore.markAllRead()
}

function closePanel() {
  open.value = false
}

function onDocumentClick(event: MouseEvent) {
  if (!rootEl.value?.contains(event.target as Node)) {
    closePanel()
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>

<template>
  <div ref="rootEl" class="relative shrink-0">
    <NavbarIconButton label="Notificações" :active="open" :size="size" @click.stop="toggle">
      <IconBell :size="size === 'sm' ? 18 : 20" />
      <span
        v-if="unreadCount > 0"
        class="absolute right-1 top-1 size-1.5 rounded-full bg-red-500 ring-2 ring-glow-surface"
        aria-hidden="true"
      />
    </NavbarIconButton>

    <div
      v-if="open"
      class="absolute top-[calc(100%+8px)] z-50 w-72 overflow-hidden rounded border border-glow-border-soft bg-glow-surface py-1 shadow-lg"
      :class="panelAlign === 'left' ? 'left-0' : 'right-0'"
    >
      <p class="border-b border-glow-border-soft px-4 py-2.5 font-urbanist text-sm font-semibold leading-4 text-glow-text">
        Notificações
      </p>
      <ul class="max-h-64 overflow-y-auto">
        <li
          v-for="item in items"
          :key="item.id"
          class="border-b border-glow-border-soft/60 px-4 py-2.5 font-urbanist text-sm leading-5 text-glow-text last:border-b-0"
        >
          {{ item.message }}
        </li>
        <li
          v-if="items.length === 0"
          class="px-4 py-5 text-center font-urbanist text-xs leading-4 text-glow-text-subtle"
        >
          Nenhuma notificação
        </li>
      </ul>
    </div>
  </div>
</template>

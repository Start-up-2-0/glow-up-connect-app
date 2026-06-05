<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useNotificationsStore } from '@/stores/notifications.store'
import IconBell from './icons/IconBell.vue'

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
  <div ref="rootEl" class="relative">
    <button
      type="button"
      class="relative flex size-[46px] items-center justify-center rounded border border-glow-border-soft bg-glow-surface text-glow-text transition-colors hover:text-glow-text-soft"
      aria-label="Notificações"
      :aria-expanded="open"
      @click.stop="toggle"
    >
      <IconBell />
      <span
        v-if="unreadCount > 0"
        class="absolute right-2 top-2 size-2 rounded-full bg-red-500"
        aria-hidden="true"
      />
    </button>

    <div
      v-if="open"
      class="absolute right-0 top-[calc(100%+8px)] z-50 w-72 overflow-hidden rounded border border-glow-border-soft bg-glow-surface shadow-lg"
    >
      <p class="border-b border-glow-border-soft px-4 py-3 font-urbanist text-sm font-semibold text-glow-text">
        Notificações
      </p>
      <ul class="max-h-64 overflow-y-auto">
        <li
          v-for="item in items"
          :key="item.id"
          class="border-b border-glow-border-soft/60 px-4 py-3 font-urbanist text-sm text-glow-text last:border-b-0"
        >
          {{ item.message }}
        </li>
        <li
          v-if="items.length === 0"
          class="px-4 py-6 text-center font-urbanist text-sm text-glow-text-subtle"
        >
          Nenhuma notificação
        </li>
      </ul>
    </div>
  </div>
</template>

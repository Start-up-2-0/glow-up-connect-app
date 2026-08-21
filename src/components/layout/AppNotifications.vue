<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { Bell } from 'lucide-vue-next'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useShellOverlay } from '@/composables/useShellOverlay'

withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { size: 'md' },
)

const notificationsStore = useNotificationsStore()
const { items, unreadCount } = storeToRefs(notificationsStore)
const { isOpen, toggle, close } = useShellOverlay('notifications')

const triggerEl = ref<HTMLElement | null>(null)
const panelEl = ref<HTMLElement | null>(null)
const panelStyle = ref<Record<string, string>>({})

async function positionPanel() {
  await nextTick()
  if (!triggerEl.value) return
  const r = triggerEl.value.getBoundingClientRect()
  const width = 320
  const left = Math.min(Math.max(8, r.right - width), window.innerWidth - width - 8)
  panelStyle.value = {
    position: 'fixed',
    top: `${r.bottom + 8}px`,
    left: `${left}px`,
    width: `${width}px`,
    zIndex: '60',
  }
}

async function onToggle() {
  toggle()
  if (isOpen.value) {
    notificationsStore.markAllRead()
    await positionPanel()
  }
}

function onDocumentClick(event: MouseEvent) {
  const target = event.target as Node
  if (triggerEl.value?.contains(target)) return
  if (panelEl.value?.contains(target)) return
  close()
}

function onResize() {
  if (isOpen.value) void positionPanel()
}

watch(isOpen, (open) => {
  if (open) void positionPanel()
})

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  window.addEventListener('resize', onResize)
  window.addEventListener('scroll', onResize, true)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('scroll', onResize, true)
})
</script>

<template>
  <div ref="triggerEl" class="relative shrink-0">
    <button
      type="button"
      class="relative rounded-lg p-2 text-glow-text-subtle transition-colors hover:bg-glow-hover-surface hover:text-glow-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow-gold-cta/35"
      aria-label="Notificações"
      :aria-expanded="isOpen"
      @click.stop="onToggle"
    >
      <Bell class="size-5" :stroke-width="1.75" />
      <span
        v-if="unreadCount > 0"
        class="absolute right-1.5 top-1.5 size-2 rounded-full bg-glow-error ring-2 ring-glow-surface"
        aria-hidden="true"
      />
    </button>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-1"
      >
        <div
          v-if="isOpen"
          ref="panelEl"
          class="z-50 overflow-hidden rounded-xl border border-glow-border-soft bg-glow-bg-elevated text-base shadow-glow-md"
          :style="panelStyle"
          role="dialog"
          aria-label="Notificações"
          @click.stop
        >
          <div
            class="border-b border-glow-border-soft bg-glow-surface px-4 py-2.5 text-center text-sm font-medium text-glow-text"
          >
            Notificações
          </div>
          <div>
            <div
              v-for="item in items"
              :key="item.id"
              class="border-b border-glow-border-soft px-4 py-3 transition-colors last:border-b-0 hover:bg-glow-hover-surface"
            >
              <p class="mb-0 text-sm font-normal text-glow-text-subtle">
                {{ item.message }}
              </p>
            </div>
            <div
              v-if="items.length === 0"
              class="px-4 py-5 text-center text-sm text-glow-text-muted"
            >
              Nenhuma notificação
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

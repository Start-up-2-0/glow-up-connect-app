<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useNotificationsStore } from '@/stores/notifications.store'
import BaseAlert from './BaseAlert.vue'

const notificationsStore = useNotificationsStore()
const { items } = storeToRefs(notificationsStore)

function dismiss(id: string) {
  notificationsStore.remove(id)
}
</script>

<template>
  <Teleport to="body">
    <div
      class="toast-stack"
      aria-live="polite"
      aria-relevant="additions removals"
      aria-label="Notificações"
    >
      <TransitionGroup
        tag="div"
        class="flex w-full flex-col gap-2"
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="translate-x-4 opacity-0"
        enter-to-class="translate-x-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="translate-x-0 opacity-100"
        leave-to-class="translate-x-4 opacity-0"
        move-class="transition duration-200"
      >
        <BaseAlert
          v-for="item in items.slice(0, 5)"
          :key="item.id"
          class="toast-item pointer-events-auto shadow-md"
          :variant="item.type === 'info' ? 'info' : item.type"
          dismissible
          @dismiss="dismiss(item.id)"
        >
          {{ item.message }}
        </BaseAlert>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

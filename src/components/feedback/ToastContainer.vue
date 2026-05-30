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
    <div>
      <BaseAlert
        v-for="item in items.slice(0, 5)"
        :key="item.id"
        :variant="item.type === 'info' ? 'info' : item.type"
        dismissible
        @dismiss="dismiss(item.id)"
      >
        {{ item.message }}
      </BaseAlert>
    </div>
  </Teleport>
</template>

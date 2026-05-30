<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useNotificationsStore } from '@/stores/notifications.store'

const notificationsStore = useNotificationsStore()
const { items, unreadCount } = storeToRefs(notificationsStore)
const open = ref(false)

function toggle() {
  open.value = !open.value
  if (open.value) notificationsStore.markAllRead()
}
</script>

<template>
  <div>
    <button type="button" aria-label="Notificações" @click="toggle">
      Notificações ({{ unreadCount }})
    </button>

    <ul v-if="open">
      <li v-for="item in items" :key="item.id">{{ item.message }}</li>
      <li v-if="items.length === 0">Nenhuma notificação</li>
    </ul>
  </div>
</template>

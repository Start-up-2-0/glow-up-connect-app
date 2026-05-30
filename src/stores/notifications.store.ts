import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface AppNotification {
  id: string
  type: NotificationType
  message: string
  read: boolean
  createdAt: number
}

let notificationCounter = 0

export const useNotificationsStore = defineStore('notifications', () => {
  const items = ref<AppNotification[]>([])

  const unreadCount = computed(() => items.value.filter((item) => !item.read).length)

  function push(type: NotificationType, message: string) {
    const notification: AppNotification = {
      id: `n-${++notificationCounter}`,
      type,
      message,
      read: false,
      createdAt: Date.now(),
    }
    items.value.unshift(notification)
    return notification.id
  }

  function markRead(id: string) {
    const item = items.value.find((n) => n.id === id)
    if (item) item.read = true
  }

  function markAllRead() {
    items.value.forEach((item) => {
      item.read = true
    })
  }

  function remove(id: string) {
    items.value = items.value.filter((item) => item.id !== id)
  }

  function clear() {
    items.value = []
  }

  return {
    items,
    unreadCount,
    push,
    markRead,
    markAllRead,
    remove,
    clear,
  }
})

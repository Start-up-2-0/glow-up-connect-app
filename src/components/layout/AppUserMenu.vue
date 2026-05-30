<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user.store'
import { useAuth } from '@/composables/useAuth'

const { profile } = storeToRefs(useUserStore())
const { logout } = useAuth()
const open = ref(false)

async function handleLogout() {
  open.value = false
  await logout()
}
</script>

<template>
  <div>
    <button type="button" @click="open = !open">
      {{ profile?.nome ?? 'Usuário' }}
    </button>

    <div v-if="open">
      <p>{{ profile?.email }}</p>
      <button type="button" @click="handleLogout">Sair</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user.store'
import { useAuth } from '@/composables/useAuth'
import { getUserRoleLabel } from '@/utils/userRoleLabel'
import IconArrowDown from './icons/IconArrowDown.vue'

const { profile } = storeToRefs(useUserStore())
const { logout } = useAuth()

const open = ref(false)
const rootEl = ref<HTMLElement | null>(null)

const roleLabel = computed(() => getUserRoleLabel(profile.value?.role))

function toggleMenu() {
  open.value = !open.value
}

function closeMenu() {
  open.value = false
}

async function handleLogout() {
  closeMenu()
  await logout()
}

function onDocumentClick(event: MouseEvent) {
  if (!rootEl.value?.contains(event.target as Node)) {
    closeMenu()
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
      class="flex h-[46px] min-w-[199px] items-center gap-2.5 rounded border border-glow-border-soft bg-glow-surface px-2.5 text-left transition-colors hover:bg-white"
      :aria-expanded="open"
      aria-haspopup="menu"
      @click.stop="toggleMenu"
    >
      <div
        class="flex size-[29px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-glow-canvas text-xs font-semibold text-glow-text"
      >
        <img
          v-if="profile?.avatarBase64"
          :src="profile.avatarBase64"
          alt=""
          class="size-full object-cover"
        />
        <span v-else>{{ profile?.nome?.charAt(0)?.toUpperCase() ?? 'U' }}</span>
      </div>

      <div class="min-w-0 flex-1">
        <p class="truncate font-urbanist text-sm font-semibold text-glow-text">
          {{ profile?.nome ?? 'Usuário' }}
        </p>
        <p class="truncate font-urbanist text-[13px] font-medium text-glow-text-subtle">
          {{ roleLabel }}
        </p>
      </div>

      <IconArrowDown class="shrink-0 text-glow-text-subtle" />
    </button>

    <div
      v-if="open"
      class="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[220px] overflow-hidden rounded border border-glow-border-soft bg-glow-surface py-1 shadow-lg"
      role="menu"
    >
      <p class="border-b border-glow-border-soft px-4 py-2 font-urbanist text-xs text-glow-text-subtle">
        {{ profile?.email }}
      </p>
      <button
        type="button"
        class="block w-full px-4 py-2.5 text-left font-urbanist text-sm text-glow-text transition-colors hover:bg-black/[0.03]"
        role="menuitem"
        @click="handleLogout"
      >
        Sair
      </button>
    </div>
  </div>
</template>

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

const avatarSrc = computed(() => {
  const raw = profile.value?.avatarBase64
  if (!raw) return null
  if (raw.startsWith('data:')) return raw
  return `data:image/jpeg;base64,${raw}`
})

const userInitial = computed(
  () => profile.value?.nome?.charAt(0)?.toUpperCase() ?? 'U',
)

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
      class="inline-flex h-[46px] max-w-[220px] items-center gap-2 rounded border border-glow-border-soft bg-glow-surface py-1 pl-2 pr-2.5 text-left transition-colors hover:bg-white"
      :aria-expanded="open"
      aria-haspopup="menu"
      @click.stop="toggleMenu"
    >
      <div
        class="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-glow-canvas ring-1 ring-inset ring-glow-border-soft/50"
        aria-hidden="true"
      >
        <img
          v-if="avatarSrc"
          :src="avatarSrc"
          alt=""
          class="block size-full max-h-full max-w-full object-contain object-center"
        />
        <span v-else class="font-urbanist text-xs font-semibold leading-none text-glow-text">
          {{ userInitial }}
        </span>
      </div>

      <div class="flex min-w-0 items-center gap-1.5">
        <div class="min-w-0 max-w-[148px]">
          <p class="truncate font-urbanist text-sm font-semibold leading-4 text-glow-text">
            {{ profile?.nome ?? 'Usuário' }}
          </p>
          <p class="truncate font-urbanist text-xs font-medium leading-4 text-glow-text-subtle">
            {{ roleLabel }}
          </p>
        </div>

        <IconArrowDown
          :size="14"
          class="shrink-0 text-glow-text-subtle transition-transform duration-200"
          :class="open ? 'rotate-180' : ''"
        />
      </div>
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

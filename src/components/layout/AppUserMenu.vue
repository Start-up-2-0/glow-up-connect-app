<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user.store'
import { useAuth } from '@/composables/useAuth'
import { getUserRoleLabel } from '@/utils/userRoleLabel'
import IconArrowDown from './icons/IconArrowDown.vue'
import UserAvatar from './UserAvatar.vue'

const props = withDefaults(
  defineProps<{
    compact?: boolean
  }>(),
  { compact: false },
)

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
      class="inline-flex items-center rounded border border-glow-border-soft bg-glow-surface text-left transition-colors hover:bg-glow-hover-surface"
      :class="
        props.compact
          ? 'size-10 justify-center p-0'
          : 'h-[46px] max-w-[220px] gap-2 py-1 pl-2 pr-2.5'
      "
      :aria-expanded="open"
      :aria-label="props.compact ? `Menu de ${profile?.nome ?? 'usuário'}` : undefined"
      aria-haspopup="menu"
      @click.stop="toggleMenu"
    >
      <UserAvatar
        :src="profile?.avatarBase64"
        :name="profile?.nome"
        size="sm"
        aria-hidden="true"
      />

      <template v-if="!props.compact">
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
      </template>
    </button>

    <div
      v-if="open"
      class="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[220px] overflow-hidden rounded border border-glow-border-soft bg-glow-surface py-1 shadow-lg"
      role="menu"
    >
      <template v-if="props.compact">
        <p class="border-b border-glow-border-soft px-4 py-2 font-urbanist text-sm font-semibold text-glow-text">
          {{ profile?.nome ?? 'Usuário' }}
        </p>
        <p class="border-b border-glow-border-soft px-4 py-2 font-urbanist text-xs text-glow-text-subtle">
          {{ roleLabel }} · {{ profile?.email }}
        </p>
      </template>
      <p
        v-else
        class="border-b border-glow-border-soft px-4 py-2 font-urbanist text-xs text-glow-text-subtle"
      >
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

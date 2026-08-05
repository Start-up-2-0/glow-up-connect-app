<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { LogOut, Moon, Sun } from 'lucide-vue-next'
import { useAppStore } from '@/stores/app.store'
import { useAuth } from '@/composables/useAuth'

const appStore = useAppStore()
const { isDark } = storeToRefs(appStore)
const { logout } = useAuth()

function toggleTheme() {
  appStore.toggleTheme()
}

async function handleLogout() {
  await logout()
}
</script>

<template>
  <div class="mt-3 flex flex-col gap-0.5">
    <button
      type="button"
      class="group flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] font-normal leading-snug text-glow-text-subtle transition-colors hover:bg-glow-hover-surface hover:text-glow-text"
      :aria-label="isDark ? 'Ativar modo claro' : 'Ativar modo escuro'"
      @click="toggleTheme"
    >
      <Sun
        v-if="isDark"
        class="size-4 shrink-0 text-glow-text-muted transition-colors group-hover:text-glow-gold-cta"
        :stroke-width="1.75"
      />
      <Moon
        v-else
        class="size-4 shrink-0 text-glow-text-muted transition-colors group-hover:text-glow-gold-cta"
        :stroke-width="1.75"
      />
      <span class="min-w-0 flex-1 truncate text-left">
        {{ isDark ? 'Modo claro' : 'Modo escuro' }}
      </span>
      <span
        class="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium tracking-wide"
        :class="
          isDark
            ? 'bg-glow-gold-selected text-glow-gold-cta'
            : 'bg-glow-surface-tint text-glow-text-muted'
        "
      >
        {{ isDark ? 'Escuro' : 'Claro' }}
      </span>
    </button>

    <button
      type="button"
      class="group flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] font-normal leading-snug text-glow-text-subtle transition-colors hover:bg-glow-error-bg hover:text-glow-error"
      aria-label="Sair da conta"
      @click="handleLogout"
    >
      <LogOut
        class="size-4 shrink-0 text-glow-text-muted transition-colors group-hover:text-glow-error"
        :stroke-width="1.75"
      />
      <span class="min-w-0 flex-1 truncate text-left">Sair</span>
    </button>
  </div>
</template>

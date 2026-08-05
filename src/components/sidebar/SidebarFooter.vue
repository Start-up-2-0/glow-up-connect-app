<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { LogOut, ChevronUp } from 'lucide-vue-next'
import { useUserStore } from '@/stores/user.store'
import { useNegocioStore } from '@/stores/negocio.store'
import { useAuth } from '@/composables/useAuth'
import { useAcessoUsuario } from '@/composables/useAcessoUsuario'
import UserAvatar from '@/components/layout/UserAvatar.vue'

defineProps<{ collapsed?: boolean }>()

const { logout } = useAuth()
const { profile } = storeToRefs(useUserStore())
const { estabelecimentoAtivo } = storeToRefs(useNegocioStore())
const { roleExibicao } = useAcessoUsuario()

const open = ref(false)
const triggerEl = ref<HTMLElement | null>(null)
const menuEl = ref<HTMLElement | null>(null)
const menuStyle = ref({ left: '0px', bottom: '0px', width: '0px' })

const cargo = computed(() => roleExibicao.value)
const empresa = computed(() => estabelecimentoAtivo.value?.nome ?? '')

function toggle() {
  if (!open.value && triggerEl.value) {
    const r = triggerEl.value.getBoundingClientRect()
    menuStyle.value = {
      left: `${r.left}px`,
      bottom: `${window.innerHeight - r.top + 8}px`,
      width: `${r.width}px`,
    }
  }
  open.value = !open.value
}

async function handleLogout() {
  open.value = false
  await logout()
}

function onDocumentClick(event: MouseEvent) {
  const target = event.target as Node
  if (triggerEl.value?.contains(target)) return
  if (menuEl.value?.contains(target)) return
  open.value = false
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onUnmounted(() => document.removeEventListener('click', onDocumentClick))
</script>

<template>
  <div class="relative">
    <!-- Trigger: card do usuário -->
    <button
      ref="triggerEl"
      type="button"
      class="group flex w-full items-center gap-3 rounded-2xl border border-glow-border-soft bg-glow-surface p-2.5 text-left transition-all duration-200 hover:border-glow-gold-cta/40 hover:shadow-glow-sm"
      :class="collapsed ? 'justify-center p-2' : ''"
      :aria-expanded="open"
      aria-haspopup="menu"
      @click.stop="toggle"
    >
      <span class="relative shrink-0">
        <UserAvatar :src="profile?.avatarBase64" :name="profile?.nome" size="sm" aria-hidden="true" />
        <span class="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-glow-surface bg-glow-success" aria-hidden="true" />
      </span>

      <span v-if="!collapsed" class="min-w-0 flex-1">
        <span class="block truncate font-urbanist text-sm font-semibold leading-tight text-glow-text">
          {{ profile?.nome ?? 'Usuário' }}
        </span>
        <span class="block truncate font-urbanist text-xs font-medium leading-tight text-glow-text-subtle">
          {{ cargo }}{{ empresa ? ` · ${empresa}` : '' }}
        </span>
      </span>

      <ChevronUp
        v-if="!collapsed"
        :size="15"
        class="shrink-0 text-glow-text-subtle transition-transform duration-200"
        :class="open ? 'rotate-180' : ''"
      />
    </button>

    <Teleport to="body">
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-1"
      >
        <div
          v-if="open"
          ref="menuEl"
          class="fixed z-[60] min-w-[220px] overflow-hidden rounded-2xl border border-glow-border-soft bg-glow-surface p-1.5 shadow-glow-sm"
          :style="menuStyle"
          role="menu"
          @click.stop
        >
          <button
            type="button"
            class="mt-0.5 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left font-urbanist text-sm font-medium text-glow-error transition-colors hover:bg-glow-error-bg"
            role="menuitem"
            @click="handleLogout"
          >
            <LogOut :size="16" :stroke-width="1.75" />
            Sair
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
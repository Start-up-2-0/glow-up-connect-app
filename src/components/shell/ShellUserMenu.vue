<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import {
  ChevronDown,
  CreditCard,
  HelpCircle,
  LogOut,
  Moon,
  Settings,
  Sun,
  User,
} from 'lucide-vue-next'
import { useUserStore } from '@/stores/user.store'
import { useNegocioStore } from '@/stores/negocio.store'
import { useAppStore } from '@/stores/app.store'
import { useAuth } from '@/composables/useAuth'
import { useAcessoUsuario } from '@/composables/useAcessoUsuario'
import { useShellOverlay } from '@/composables/useShellOverlay'
import { ROUTE_PATHS } from '@/constants/routes'
import UserAvatar from '@/components/layout/UserAvatar.vue'

withDefaults(
  defineProps<{
    /** Estilo Flowbite: só o avatar (sem nome/plano no trigger). */
    avatarOnly?: boolean
  }>(),
  { avatarOnly: false },
)

const router = useRouter()
const { profile } = storeToRefs(useUserStore())
const negocioStore = useNegocioStore()
const { estabelecimentoAtivo, planoNome, assinaturaAtiva } = storeToRefs(negocioStore)
const appStore = useAppStore()
const { isDark } = storeToRefs(appStore)
const { logout } = useAuth()
const { roleExibicao, temVinculoNegocio } = useAcessoUsuario()
const { isOpen, toggle, close } = useShellOverlay('user-menu')

const triggerEl = ref<HTMLElement | null>(null)
const menuEl = ref<HTMLElement | null>(null)
const menuStyle = ref<Record<string, string>>({})

const planLabel = computed(() => {
  if (!temVinculoNegocio.value) return null
  if (assinaturaAtiva.value && planoNome.value === 'Premium') return 'Premium'
  return planoNome.value || 'Free'
})

const storeLabel = computed(() => estabelecimentoAtivo.value?.nome ?? roleExibicao.value)

async function positionMenu() {
  await nextTick()
  if (!triggerEl.value) return
  const r = triggerEl.value.getBoundingClientRect()
  const width = 280
  const left = Math.min(Math.max(8, r.right - width), window.innerWidth - width - 8)
  menuStyle.value = {
    position: 'fixed',
    top: `${r.bottom + 8}px`,
    left: `${left}px`,
    width: `${width}px`,
    zIndex: '200',
  }
}

async function onToggle() {
  toggle()
  if (isOpen.value) await positionMenu()
}

async function go(path: string) {
  close()
  await router.push(path)
}

function toggleTheme() {
  appStore.toggleTheme()
  close()
}

async function handleLogout() {
  close()
  await logout()
}

function onDocumentClick(event: MouseEvent) {
  const target = event.target as Node
  if (triggerEl.value?.contains(target)) return
  if (menuEl.value?.contains(target)) return
  close()
}

function onResize() {
  if (isOpen.value) void positionMenu()
}

watch(isOpen, (open) => {
  if (open) void positionMenu()
})

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  window.addEventListener('resize', onResize)
  window.addEventListener('scroll', onResize, true)
})
onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('scroll', onResize, true)
})
</script>

<template>
  <div class="relative shrink-0">
    <button
      ref="triggerEl"
      type="button"
      class="shell-user-trigger"
      :class="avatarOnly ? 'shell-user-trigger--avatar' : ''"
      :aria-expanded="isOpen"
      aria-haspopup="menu"
      :aria-label="`Menu de ${profile?.nome ?? 'usuário'}`"
      @click.stop="onToggle"
    >
      <UserAvatar :src="profile?.avatarBase64" :name="profile?.nome" size="sm" aria-hidden="true" />
      <template v-if="!avatarOnly">
        <span class="hidden min-w-0 text-left lg:block">
          <span class="block max-w-[140px] truncate font-urbanist text-sm font-semibold leading-tight text-glow-text">
            {{ profile?.nome ?? 'Usuário' }}
          </span>
          <span class="block max-w-[140px] truncate font-urbanist text-[11px] leading-tight text-glow-text-subtle">
            <template v-if="planLabel">{{ storeLabel }} · {{ planLabel }}</template>
            <template v-else>{{ storeLabel }}</template>
          </span>
        </span>
        <ChevronDown
          :size="14"
          class="hidden text-glow-text-subtle transition-transform duration-200 lg:block"
          :class="isOpen ? 'rotate-180' : ''"
        />
      </template>
    </button>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-1"
      >
        <div
          v-if="isOpen"
          ref="menuEl"
          class="shell-user-menu"
          :style="menuStyle"
          role="menu"
          @click.stop
        >
          <div class="border-b border-glow-border-soft px-3.5 py-3">
            <p class="truncate font-urbanist text-sm font-semibold text-glow-text">
              {{ profile?.nome }}
            </p>
            <p class="truncate font-urbanist text-xs text-glow-text-subtle">
              {{ profile?.email }}
            </p>
          </div>

          <div class="p-1.5">
            <button type="button" class="shell-user-menu__item" role="menuitem" @click="go(ROUTE_PATHS.PERFIL)">
              <User :size="16" /> Perfil
            </button>
            <button
              v-if="temVinculoNegocio"
              type="button"
              class="shell-user-menu__item"
              role="menuitem"
              @click="go(ROUTE_PATHS.CONFIG_PERFIL)"
            >
              <Settings :size="16" /> Configurações
            </button>
            <button
              v-if="temVinculoNegocio"
              type="button"
              class="shell-user-menu__item"
              role="menuitem"
              @click="go(ROUTE_PATHS.CONFIG_ASSINATURA)"
            >
              <CreditCard :size="16" /> Assinatura
            </button>
            <button type="button" class="shell-user-menu__item" role="menuitem" @click="toggleTheme">
              <Sun v-if="isDark" :size="16" />
              <Moon v-else :size="16" />
              {{ isDark ? 'Modo claro' : 'Modo escuro' }}
            </button>
            <a
              href="mailto:suporte@glowupconnect.com"
              class="shell-user-menu__item"
              role="menuitem"
              @click="close"
            >
              <HelpCircle :size="16" /> Central de ajuda
            </a>
          </div>

          <div class="border-t border-glow-border-soft p-1.5">
            <button
              type="button"
              class="shell-user-menu__item shell-user-menu__item--danger"
              role="menuitem"
              @click="handleLogout"
            >
              <LogOut :size="16" /> Sair
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.shell-user-trigger {
  display: inline-flex;
  max-width: 220px;
  align-items: center;
  gap: 0.5rem;
  border-radius: 0.75rem;
  border: 1px solid var(--glow-border-soft);
  background: var(--glow-surface);
  padding: 0.25rem 0.45rem 0.25rem 0.25rem;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}
.shell-user-trigger--avatar {
  max-width: none;
  border: none;
  background: transparent;
  border-radius: 9999px;
  padding: 0;
}
.shell-user-trigger--avatar:hover {
  opacity: 0.9;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--glow-gold-cta) 35%, transparent);
}
.shell-user-trigger:hover {
  border-color: color-mix(in srgb, var(--glow-gold-cta) 35%, var(--glow-border-soft));
}
.shell-user-trigger--avatar:hover {
  border-color: transparent;
}
.shell-user-trigger:focus-visible {
  outline: 2px solid var(--glow-gold-cta);
  outline-offset: 2px;
}
.shell-user-menu {
  overflow: hidden;
  border-radius: 14px;
  border: 1px solid var(--glow-border-soft);
  background: var(--glow-bg-elevated);
  box-shadow: var(--glow-shadow-md);
}
.shell-user-menu__item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.65rem;
  border-radius: 0.55rem;
  padding: 0.55rem 0.7rem;
  font-family: Urbanist, ui-sans-serif, system-ui, sans-serif;
  font-size: 0.875rem;
  color: var(--glow-text);
  transition: background 0.12s ease;
}
.shell-user-menu__item:hover {
  background: var(--glow-hover-surface);
}
.shell-user-menu__item--danger {
  color: var(--glow-error, #dc2626);
}
.shell-user-menu__item--danger:hover {
  background: var(--glow-error-bg, rgba(220, 38, 38, 0.08));
}
</style>

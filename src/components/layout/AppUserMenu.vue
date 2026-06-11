<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user.store'
import { useNegocioStore } from '@/stores/negocio.store'
import { useAppStore } from '@/stores/app.store'
import { useAuth } from '@/composables/useAuth'
import { useAcessoUsuario } from '@/composables/useAcessoUsuario'
import IconArrowDown from './icons/IconArrowDown.vue'
import IconMoon from './icons/IconMoon.vue'
import IconSearch from './icons/IconSearch.vue'
import IconSun from './icons/IconSun.vue'
import UserAvatar from './UserAvatar.vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    compact?: boolean
    collapsed?: boolean
    variant?: 'navbar' | 'sidebar'
  }>(),
  { compact: false, collapsed: false, variant: 'navbar' },
)

const emit = defineEmits<{
  openSearch: []
}>()

const { profile } = storeToRefs(useUserStore())
const negocioStore = useNegocioStore()
const appStore = useAppStore()
const { isDark } = storeToRefs(appStore)
const { logout } = useAuth()
const { roleExibicao, temVinculoNegocio } = useAcessoUsuario()
const { estabelecimentos, estabelecimentoIdSelecionado, loading } = storeToRefs(negocioStore)

const open = ref(false)
const rootEl = ref<HTMLElement | null>(null)

const roleLabel = computed(() => roleExibicao.value)
const isSidebar = computed(() => props.variant === 'sidebar')

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

function onEstabelecimentoChange(event: Event) {
  const value = Number((event.target as HTMLSelectElement).value)
  if (Number.isFinite(value)) {
    negocioStore.selecionarEstabelecimento(value)
  }
}

function openSearch() {
  closeMenu()
  emit('openSearch')
}

onMounted(async () => {
  document.addEventListener('click', onDocumentClick)
  if (temVinculoNegocio.value) {
    await negocioStore.fetchEstabelecimentos()
  }
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>

<template>
  <div ref="rootEl" class="relative">
    <button
      type="button"
      class="text-left transition-colors"
      :class="
        isSidebar
          ? [
              collapsed
                ? 'flex size-[29px] items-center justify-center rounded-full'
                : 'flex min-w-0 flex-1 items-center gap-2.5 rounded-lg py-0.5 pr-1 hover:bg-black/[0.03]',
            ]
          : [
              'inline-flex items-center rounded border border-glow-border-soft bg-glow-surface hover:bg-glow-hover-surface',
              compact ? 'size-10 justify-center p-0' : 'h-[46px] max-w-[220px] gap-2 py-1 pl-2 pr-2.5',
            ]
      "
      :aria-expanded="open"
      :aria-label="compact || collapsed ? `Menu de ${profile?.nome ?? 'usuário'}` : undefined"
      aria-haspopup="menu"
      @click.stop="toggleMenu"
    >
      <UserAvatar
        :src="profile?.avatarBase64"
        :name="profile?.nome"
        :size="isSidebar ? 'xs' : 'sm'"
        aria-hidden="true"
      />

      <template v-if="isSidebar && !collapsed">
        <div class="min-w-0 flex-1">
          <p class="truncate font-urbanist text-sm font-semibold leading-tight text-glow-text">
            {{ profile?.nome ?? 'Usuário' }}
          </p>
          <p class="truncate font-urbanist text-[13px] font-medium leading-tight text-glow-text-subtle">
            {{ roleLabel }}
          </p>
        </div>
      </template>

      <template v-else-if="!isSidebar && !compact">
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
      class="absolute z-50 min-w-[220px] overflow-hidden rounded border border-glow-border-soft bg-glow-surface py-1 shadow-lg"
      :class="isSidebar && collapsed ? 'bottom-[calc(100%+8px)] left-0' : 'right-0 top-[calc(100%+8px)]'"
      role="menu"
    >
      <template v-if="compact || (isSidebar && collapsed)">
        <p class="border-b border-glow-border-soft px-4 py-2 font-urbanist text-sm font-semibold text-glow-text">
          {{ profile?.nome ?? 'Usuário' }}
        </p>
        <p class="border-b border-glow-border-soft px-4 py-2 font-urbanist text-xs text-glow-text-subtle">
          {{ roleLabel }} · {{ profile?.email }}
        </p>
      </template>
      <p
        v-else-if="!isSidebar"
        class="border-b border-glow-border-soft px-4 py-2 font-urbanist text-xs text-glow-text-subtle"
      >
        {{ profile?.email }}
      </p>
      <p
        v-else
        class="border-b border-glow-border-soft px-4 py-2 font-urbanist text-xs text-glow-text-subtle"
      >
        {{ profile?.email }}
      </p>

      <div
        v-if="temVinculoNegocio && (isSidebar ? collapsed : true)"
        class="border-b border-glow-border-soft px-4 py-2.5"
      >
        <label for="sidebar-estabelecimento-select" class="mb-1.5 block font-urbanist text-xs text-glow-text-subtle">
          Estabelecimento
        </label>
        <select
          id="sidebar-estabelecimento-select"
          :value="estabelecimentoIdSelecionado ?? ''"
          :disabled="loading"
          class="w-full truncate rounded-lg border border-glow-border-soft bg-glow-surface px-2.5 py-1.5 font-urbanist text-sm text-glow-text focus:border-glow-gold focus:outline-none focus:ring-1 focus:ring-glow-gold/40"
          @change="onEstabelecimentoChange"
        >
          <option
            v-for="est in estabelecimentos"
            :key="est.estabelecimentoId"
            :value="est.estabelecimentoId"
          >
            {{ est.nome }}
          </option>
        </select>
      </div>

      <template v-if="!isSidebar || collapsed">
        <button
          type="button"
          class="flex w-full items-center gap-2 px-4 py-2.5 text-left font-urbanist text-sm text-glow-text transition-colors hover:bg-black/[0.03]"
          role="menuitem"
          @click="openSearch"
        >
          <IconSearch :size="18" />
          Pesquisar
        </button>

        <button
          type="button"
          class="flex w-full items-center gap-2 px-4 py-2.5 text-left font-urbanist text-sm text-glow-text transition-colors hover:bg-black/[0.03]"
          role="menuitem"
          @click="appStore.toggleTheme(); closeMenu()"
        >
          <IconSun v-if="isDark" :size="18" />
          <IconMoon v-else :size="18" />
          {{ isDark ? 'Modo claro' : 'Modo escuro' }}
        </button>
      </template>

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

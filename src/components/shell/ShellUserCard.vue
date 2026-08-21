<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { LogOut } from 'lucide-vue-next'
import { useUserStore } from '@/stores/user.store'
import { useNegocioStore } from '@/stores/negocio.store'
import { useAuth } from '@/composables/useAuth'
import { useAcessoUsuario } from '@/composables/useAcessoUsuario'
import UserAvatar from '@/components/layout/UserAvatar.vue'

const props = defineProps<{ collapsed?: boolean }>()

const { logout } = useAuth()
const { profile } = storeToRefs(useUserStore())
const { estabelecimentoAtivo } = storeToRefs(useNegocioStore())
const { roleExibicao } = useAcessoUsuario()

const subtitle = computed(() => {
  const cargo = roleExibicao.value
  const empresa = estabelecimentoAtivo.value?.nome
  if (empresa) return `${cargo} · ${empresa}`
  return profile.value?.email ?? cargo
})

async function handleLogout() {
  await logout()
}
</script>

<template>
  <div
    class="relative flex w-full items-center"
    :class="
      props.collapsed
        ? 'flex-col gap-2'
        : 'gap-2.5 rounded-lg border border-glow-border-soft bg-glow-canvas p-2'
    "
  >
    <UserAvatar
      :src="profile?.avatarBase64"
      :name="profile?.nome"
      size="sm"
      aria-hidden="true"
    />

    <div v-if="!props.collapsed" class="min-w-0 flex-1">
      <p class="truncate font-urbanist text-sm font-semibold leading-tight text-glow-text">
        {{ profile?.nome ?? 'Usuário' }}
      </p>
      <p class="truncate font-urbanist text-xs leading-tight text-glow-text-subtle">
        {{ subtitle }}
      </p>
    </div>

    <button
      type="button"
      class="inline-flex shrink-0 items-center justify-center rounded-lg text-glow-text-subtle transition-colors hover:bg-glow-error-bg hover:text-glow-error"
      :class="props.collapsed ? 'size-8' : 'size-8'"
      aria-label="Sair"
      @click="handleLogout"
    >
      <LogOut :size="16" :stroke-width="1.75" />
    </button>
  </div>
</template>

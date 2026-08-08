<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { ChevronDown, ChevronsUpDown, Store } from 'lucide-vue-next'
import { useNegocioStore } from '@/stores/negocio.store'
import { useTrocarEstabelecimento } from '@/composables/useTrocarEstabelecimento'
import UserAvatar from '@/components/layout/UserAvatar.vue'
import SidebarTooltip from './SidebarTooltip.vue'
import { ROUTE_PATHS } from '@/constants/routes'

defineProps<{ collapsed?: boolean }>()

const negocioStore = useNegocioStore()
const { trocarEstabelecimento, trocandoEstabelecimento } = useTrocarEstabelecimento()
const { estabelecimentos, estabelecimentoAtivo, loading, role, limites } = storeToRefs(negocioStore)

const open = ref(false)
const triggerEl = ref<HTMLElement | null>(null)
const menuEl = ref<HTMLElement | null>(null)
/** Acima do AppShellSidebar (z-2010) para o Teleport não ficar atrás da aside. */
const POPOVER_Z = 2100
const popoverStyle = ref({ left: '0px', top: '0px', width: '260px', zIndex: POPOVER_Z })

const planoLabel = computed(() => estabelecimentoAtivo.value?.planoNome ?? 'Plano Profissional')

const mostrarAtalhoMinhasLojas = computed(
  () => role.value === 'Owner' && (limites.value.estabelecimentos ?? 1) > 1,
)

function toggle() {
  if (!open.value && triggerEl.value) {
    const r = triggerEl.value.getBoundingClientRect()
    popoverStyle.value = {
      left: `${r.left}px`,
      top: `${r.bottom + 8}px`,
      width: `${Math.max(r.width, 260)}px`,
      zIndex: POPOVER_Z,
    }
  }
  open.value = !open.value
}

async function select(id: number) {
  open.value = false
  await trocarEstabelecimento(id)
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
    <!-- Recolhida: apenas avatar + tooltip -->
    <button
      v-if="collapsed"
      ref="triggerEl"
      type="button"
      class="group relative flex size-11 items-center justify-center rounded-xl border border-glow-border-soft bg-glow-surface transition-all duration-200 hover:border-glow-gold-cta/40"
      :aria-label="estabelecimentoAtivo?.nome ?? 'Empresa'"
      @click.stop="toggle"
    >
      <UserAvatar
        :src="estabelecimentoAtivo?.logo || null"
        :name="estabelecimentoAtivo?.nome"
        size="sm"
        aria-hidden="true"
      />
      <SidebarTooltip :label="estabelecimentoAtivo?.nome ?? 'Empresa'" />
    </button>

    <!-- Expandida: card -->
    <button
      v-else
      ref="triggerEl"
      type="button"
      class="sb-workspace group flex w-full items-center gap-2.5 rounded-md border border-glow-border-soft bg-glow-canvas p-2 text-left transition-colors hover:border-glow-gold-cta/40"
      :aria-expanded="open"
      :aria-label="`Loja atual: ${estabelecimentoAtivo?.nome ?? 'Selecione'} — trocar`"
      @click.stop="toggle"
    >
      <span class="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-glow-surface">
        <UserAvatar
          :src="estabelecimentoAtivo?.logo || null"
          :name="estabelecimentoAtivo?.nome"
          size="xs"
          aria-hidden="true"
        />
      </span>
      <span class="min-w-0 flex-1">
        <span class="block truncate font-urbanist text-[13px] font-semibold text-glow-text">
          {{ estabelecimentoAtivo?.nome ?? 'Selecione a loja' }}
        </span>
        <span class="flex items-center gap-1 font-urbanist text-[11px] font-normal text-glow-gold-cta">
          <span class="size-1.5 rounded-full bg-glow-success" aria-hidden="true" />
          {{ planoLabel }}
        </span>
      </span>
      <ChevronDown
        :size="14"
        class="shrink-0 text-glow-text-subtle transition-transform duration-200"
        :class="open ? 'rotate-180' : ''"
      />
    </button>

    <!-- Popover (Teleport para fora do overflow-hidden da sidebar) -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <div
          v-if="open"
          ref="menuEl"
          class="fixed min-w-[260px] overflow-hidden rounded-lg border border-glow-border-soft bg-glow-surface p-1.5 shadow-lg"
          :style="popoverStyle"
          role="menu"
          @click.stop
        >
          <p class="px-3 py-2 font-urbanist text-[11px] font-semibold uppercase tracking-wider text-glow-text-soft">
            Trocar loja
          </p>
          <button
            v-for="est in estabelecimentos"
            :key="est.estabelecimentoId"
            type="button"
            class="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left font-urbanist text-sm transition-colors hover:bg-glow-surface-tint"
            :class="est.estabelecimentoId === estabelecimentoAtivo?.estabelecimentoId ? 'text-glow-text font-semibold' : 'text-glow-text-subtle'"
            role="menuitem"
            :disabled="trocandoEstabelecimento || loading"
            @click="select(est.estabelecimentoId)"
          >
            <UserAvatar :src="est.logo || null" :name="est.nome" size="xs" aria-hidden="true" />
            <span class="min-w-0 flex-1 truncate">{{ est.nome }}</span>
            <ChevronsUpDown
              v-if="est.estabelecimentoId === estabelecimentoAtivo?.estabelecimentoId"
              :size="14"
              class="shrink-0 text-glow-gold-cta"
            />
          </button>
          <p v-if="estabelecimentos.length === 0" class="px-3 py-2 font-urbanist text-xs text-glow-text-subtle">
            <Store :size="14" class="mr-1 inline" /> Nenhuma loja disponível.
          </p>
          <div
            v-if="mostrarAtalhoMinhasLojas"
            class="mt-1 border-t border-glow-border-soft pt-1"
          >
            <RouterLink
              :to="ROUTE_PATHS.MINHAS_LOJAS"
              class="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 font-urbanist text-sm font-medium text-glow-gold-cta transition-colors hover:bg-glow-surface-tint"
              role="menuitem"
              @click="open = false"
            >
              <Store :size="14" />
              Minhas Lojas
            </RouterLink>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.sb-workspace:focus-visible {
  outline: 2px solid var(--glow-gold-cta);
  outline-offset: 2px;
}
</style>

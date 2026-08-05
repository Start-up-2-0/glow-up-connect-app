<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-vue-next'
import AppLogo from '@/components/layout/AppLogo.vue'
import { APP_NAME } from '@/constants/storageKeys'
import { useNegocioStore } from '@/stores/negocio.store'
import { useAcessoUsuario } from '@/composables/useAcessoUsuario'

const props = defineProps<{
  collapsed?: boolean
  mobile?: boolean
}>()

const emit = defineEmits<{ toggle: [] }>()

const negocioStore = useNegocioStore()
const { estabelecimentoAtivo, planoNome, assinaturaAtiva } = storeToRefs(negocioStore)
const { temVinculoNegocio } = useAcessoUsuario()

const planLabel = computed(() => {
  if (!temVinculoNegocio.value) return null
  if (assinaturaAtiva.value && (planoNome.value === 'Premium' || planoNome.value?.includes('Premium'))) {
    return 'Premium'
  }
  return planoNome.value || 'Free'
})

const isPremiumPlan = computed(() => planLabel.value === 'Premium')

const storeName = computed(() => estabelecimentoAtivo.value?.nome ?? null)
</script>

<template>
  <div class="shell-brand" :class="collapsed ? 'shell-brand--collapsed' : ''">
    <div class="shell-brand__row">
      <div class="shell-brand__identity">
        <AppLogo
          compact
          :logo-class="collapsed ? 'size-8 rounded-xl object-contain' : 'size-9 rounded-xl object-contain'"
        />
        <div v-if="!collapsed" class="min-w-0">
          <p class="truncate font-urbanist text-[15px] font-bold tracking-tight text-glow-text">
            {{ APP_NAME }}
          </p>
          <p v-if="storeName" class="mt-0.5 truncate font-urbanist text-xs text-glow-text-subtle">
            {{ storeName }}
          </p>
        </div>
      </div>

      <button
        type="button"
        class="shell-brand__toggle"
        :aria-label="mobile ? 'Fechar menu' : collapsed ? 'Expandir menu' : 'Recolher menu'"
        @click="emit('toggle')"
      >
        <PanelLeftOpen v-if="collapsed && !mobile" :size="16" :stroke-width="1.75" />
        <PanelLeftClose v-else :size="16" :stroke-width="1.75" />
      </button>
    </div>

    <div
      v-if="!collapsed && planLabel"
      class="shell-brand__plan"
      :class="isPremiumPlan ? 'shell-brand__plan--premium' : 'shell-brand__plan--free'"
    >
      <span class="size-1.5 rounded-full" :class="isPremiumPlan ? 'bg-glow-gold-cta' : 'bg-glow-text-soft'" />
      Plano {{ planLabel }}
    </div>
  </div>
</template>

<style scoped>
.shell-brand {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.shell-brand__row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}
.shell-brand--collapsed .shell-brand__row {
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}
.shell-brand__identity {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.75rem;
}
.shell-brand__toggle {
  display: inline-flex;
  height: 2rem;
  width: 2rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  color: var(--glow-text-subtle);
  transition: background 0.15s ease, color 0.15s ease;
}
.shell-brand__toggle:hover {
  background: var(--glow-hover-surface);
  color: var(--glow-text);
}
.shell-brand__toggle:focus-visible {
  outline: 2px solid var(--glow-gold-cta);
  outline-offset: 2px;
}
.shell-brand__plan {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 0.4rem;
  border-radius: 9999px;
  padding: 0.2rem 0.6rem;
  font-family: Urbanist, ui-sans-serif, system-ui, sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.shell-brand__plan--free {
  background: color-mix(in srgb, var(--glow-border-soft) 70%, transparent);
  color: var(--glow-text-subtle);
}
.shell-brand__plan--premium {
  background: color-mix(in srgb, var(--glow-gold-cta) 14%, transparent);
  color: var(--glow-gold-cta);
}
</style>

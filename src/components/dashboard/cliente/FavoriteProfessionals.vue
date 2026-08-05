<script setup lang="ts">
import { Heart, MapPin } from 'lucide-vue-next'
import type {
  DashboardFavoritoLoja,
  DashboardFavoritoProfissional,
} from '@/composables/useDashboardClienteData'
import { initialsFromName } from '@/utils/formatters'

defineProps<{
  lojas: DashboardFavoritoLoja[]
  profissionais: DashboardFavoritoProfissional[]
  loading?: boolean
}>()

const emit = defineEmits<{ 'abrir-loja': [publicGuid: string]; explorar: [] }>()
</script>

<template>
  <section class="flex h-full w-full flex-col rounded-2xl border border-glow-border-soft bg-glow-surface p-5 shadow-glow-sm">
    <div class="mb-4 flex items-center gap-2">
      <Heart :size="18" class="text-glow-gold-cta" fill="currentColor" />
      <h2 class="font-urbanist text-[16px] font-bold text-glow-text">Favoritos</h2>
    </div>

    <div v-if="loading" class="flex flex-wrap gap-3">
      <span v-for="i in 4" :key="i" class="h-16 w-24 animate-pulse rounded-xl bg-glow-canvas" />
    </div>

    <template v-else>
      <div v-if="lojas.length" class="flex flex-col gap-2">
        <p class="font-urbanist text-[11px] font-semibold uppercase tracking-wider text-glow-text-soft">Lojas</p>
        <button
          v-for="loja in lojas"
          :key="loja.id"
          type="button"
          class="fav-row"
          @click="emit('abrir-loja', loja.publicGuid)"
        >
          <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-glow-gold-cta/15 font-urbanist text-sm font-bold text-glow-gold-cta">
            {{ initialsFromName(loja.nome) }}
          </span>
          <span class="min-w-0 flex-1 text-left">
            <span class="block truncate font-urbanist text-[13px] font-semibold text-glow-text">{{ loja.nome }}</span>
            <span class="block font-urbanist text-[11px] text-glow-text-subtle">{{ loja.visitas }} visita{{ loja.visitas > 1 ? 's' : '' }}</span>
          </span>
          <MapPin :size="15" class="shrink-0 text-glow-gold-cta" :stroke-width="1.75" />
        </button>
      </div>

      <div v-if="profissionais.length" class="mt-4 flex flex-col gap-2">
        <p class="font-urbanist text-[11px] font-semibold uppercase tracking-wider text-glow-text-soft">Profissionais</p>
        <div
          v-for="prof in profissionais"
          :key="prof.id"
          class="flex items-center gap-2.5"
        >
          <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-glow-surface-tint font-urbanist text-sm font-bold text-glow-text-subtle">
            {{ initialsFromName(prof.nome) }}
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate font-urbanist text-[13px] font-semibold text-glow-text">{{ prof.nome }}</span>
            <span class="block truncate font-urbanist text-[11px] text-glow-text-subtle">{{ prof.estabelecimentoNome }}</span>
          </span>
        </div>
      </div>

      <button
        v-if="!lojas.length && !profissionais.length"
        type="button"
        class="mt-auto pt-4 font-urbanist text-[13px] font-semibold text-glow-gold-cta hover:underline"
        @click="emit('explorar')"
      >
        Explorar lojas para começar
      </button>
    </template>
  </section>
</template>

<style scoped>
.fav-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px;
  border-radius: 14px;
  transition: background 0.2s ease;
}
.fav-row:hover {
  background: color-mix(in srgb, var(--glow-text) 5%, transparent);
}
</style>
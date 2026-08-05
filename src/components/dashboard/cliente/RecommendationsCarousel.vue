<script setup lang="ts">
import { Star } from 'lucide-vue-next'
import type { EstabelecimentoProximo } from '@/types/estabelecimento.types'
import { formatNotaMediaDisplay } from '@/utils/formatNotaMediaIfood'
import { formatDistanciaKm, initialsFromName } from '@/utils/formatters'
import DashboardEmptyState from './DashboardEmptyState.vue'

defineProps<{
  items: EstabelecimentoProximo[]
  loading?: boolean
}>()

const emit = defineEmits<{ agendar: [publicGuid: string]; explorar: [] }>()
</script>

<template>
  <section class="flex h-full w-full flex-col rounded-2xl border border-glow-border-soft bg-glow-surface p-5 shadow-glow-sm">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="font-urbanist text-[16px] font-bold text-glow-text">Lojas recomendadas</h2>
      <button type="button" class="font-urbanist text-[13px] font-semibold text-glow-gold-cta hover:underline" @click="emit('explorar')">
        Ver todas
      </button>
    </div>

    <div v-if="loading" class="flex gap-4 overflow-hidden">
      <span v-for="i in 3" :key="i" class="h-40 w-60 shrink-0 rounded-2xl bg-glow-canvas animate-pulse" />
    </div>

    <DashboardEmptyState
      v-else-if="items.length === 0"
      title="Nenhuma loja por perto"
      description="Autorize a localização ou explore para descobrir salões e barbearias."
    >
      <button type="button" class="cliente-btn-cta" @click="emit('explorar')">Explorar lojas</button>
    </DashboardEmptyState>

    <div v-else class="recommend-scroll -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-1">
      <article
        v-for="item in items"
        :key="item.publicGuid"
        class="group flex w-60 shrink-0 snap-start flex-col rounded-2xl border border-glow-border-soft bg-glow-bg-elevated p-4 transition hover:border-glow-gold-cta/40 hover:shadow-glow-sm"
      >
        <div class="flex items-center gap-3">
          <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-glow-gold-cta/15 font-urbanist text-base font-bold text-glow-gold-cta">
            {{ initialsFromName(item.nome) }}
          </span>
          <div class="min-w-0">
            <p class="truncate font-urbanist text-[14px] font-semibold text-glow-text">{{ item.nome }}</p>
            <p class="flex items-center gap-1 font-urbanist text-[12px] text-glow-text-subtle">
              <Star :size="12" class="text-glow-gold" fill="currentColor" />
              {{ formatNotaMediaDisplay(item.notaMedia ?? 0) }}
              <span aria-hidden="true">·</span>
              {{ formatDistanciaKm(item.distanciaKm ?? 0) }}
            </p>
          </div>
        </div>
        <p class="mt-3 line-clamp-2 flex-1 font-urbanist text-[12px] leading-relaxed text-glow-text-subtle">
          {{ item.descricao }}
        </p>
        <button
          type="button"
          class="cliente-btn-cta mt-4 w-full justify-center"
          @click="emit('agendar', item.publicGuid)"
        >
          Agendar
        </button>
      </article>
    </div>
  </section>
</template>

<style scoped>
.recommend-scroll::-webkit-scrollbar {
  height: 6px;
}
.recommend-scroll::-webkit-scrollbar-thumb {
  border-radius: 9999px;
  background: color-mix(in srgb, var(--glow-gold-cta) 35%, transparent);
}
.recommend-scroll {
  scrollbar-width: thin;
}
</style>
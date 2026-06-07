<script setup lang="ts">
import { formatLimite } from '@/utils/formatters'
import { PLANO_LIMITE_ITEMS } from '@/utils/planoDisplay'
import type { Plano } from '@/types/plano.types'

defineProps<{
  plano: Plano
  popular?: boolean
  variant?: 'card' | 'modal'
}>()
</script>

<template>
  <div
    class="grid grid-cols-2 gap-x-3 gap-y-2"
    :class="
      variant === 'modal'
        ? 'rounded-xl border border-[#282828]/10 bg-white/70 p-4'
        : 'rounded-xl border border-[#282828]/10 bg-white/80 px-3 py-3'
    "
  >
    <div v-for="item in PLANO_LIMITE_ITEMS" :key="item.key">
      <p
        class="font-montserrat font-bold uppercase tracking-wide text-[#282828]/50"
        :class="variant === 'modal' ? 'text-[10px]' : 'text-[9px]'"
      >
        {{ item.label }}
      </p>
      <p
        class="font-poppins font-medium"
        :class="[
          variant === 'modal' ? 'text-sm' : 'text-xs',
          popular ? 'text-glow-purple-soft' : 'text-[#282828]',
        ]"
      >
        {{ formatLimite(plano[item.key]) }}
      </p>
    </div>
  </div>
</template>

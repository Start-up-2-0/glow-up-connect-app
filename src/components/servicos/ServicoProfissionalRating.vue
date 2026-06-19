<script setup lang="ts">
import { computed } from 'vue'
import { formatNotaMediaDisplay } from '@/utils/formatNotaMediaIfood'

const props = withDefaults(
  defineProps<{
    notaMedia?: number | null
    totalAvaliacoes?: number | null
    compact?: boolean
  }>(),
  {
    notaMedia: null,
    totalAvaliacoes: 0,
    compact: true,
  },
)

const exibir = computed(
  () => props.notaMedia != null && props.notaMedia > 0 && (props.totalAvaliacoes ?? 0) > 0,
)

const notaFormatada = computed(() => formatNotaMediaDisplay(props.notaMedia))
</script>

<template>
  <div
    v-if="exibir"
    class="servico-prof-rating"
    :class="{ 'servico-prof-rating--compact': compact }"
    :aria-label="`Nota média ${notaFormatada}`"
  >
    <svg class="servico-prof-rating__star" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 1.5l1.76 3.57 3.94.57-2.85 2.78.67 3.92L8 10.67l-3.52 1.85.67-3.92-2.85-2.78 3.94-.57L8 1.5Z"
        fill="currentColor"
      />
    </svg>
    <span class="servico-prof-rating__value">{{ notaFormatada }}</span>
  </div>
</template>

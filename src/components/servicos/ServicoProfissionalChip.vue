<script setup lang="ts">
import ServicoIcons from '@/components/servicos/ServicoIcons.vue'
import { iniciaisNome } from '@/utils/servicoFormatters'

defineProps<{
  nome: string
  removable?: boolean
}>()

const emit = defineEmits<{ remove: [] }>()
</script>

<template>
  <div class="servico-prof-chip">
    <span class="servico-prof-chip__avatar">{{ iniciaisNome(nome) }}</span>
    <span class="servico-prof-chip__name">{{ nome }}</span>
    <button
      v-if="removable"
      type="button"
      class="servico-prof-chip__remove"
      aria-label="Remover profissional"
      @click="emit('remove')"
    >
      <ServicoIcons name="close" class="size-3" />
    </button>
  </div>
</template>

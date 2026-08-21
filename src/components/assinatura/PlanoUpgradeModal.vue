<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { formatBRL } from '@/utils/formatters'
import type { Plano } from '@/types/plano.types'

const props = defineProps<{
  open: boolean
  planos: Plano[]
  planoAtualId: number | null
  loading?: boolean
}>()

const emit = defineEmits<{
  select: [planoId: number]
  close: []
}>()

const planosSuperiores = computed(() => {
  if (!props.planoAtualId) return props.planos
  const atual = props.planos.find((p) => p.id === props.planoAtualId)
  if (!atual) return props.planos
  return props.planos.filter((p) => p.preco > atual.preco)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[3000] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div class="absolute inset-0 glow-modal-scrim" @click="emit('close')" />
      <div class="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-glow-border-soft bg-glow-surface p-6 shadow-xl">
        <h2 class="mb-4 font-urbanist text-lg font-semibold text-glow-text">
          Escolha um plano superior
        </h2>
        <ul class="space-y-3">
          <li
            v-for="plano in planosSuperiores"
            :key="plano.id"
            class="flex items-center justify-between rounded-lg border border-glow-border-soft p-4"
          >
            <div>
              <p class="font-medium text-glow-text">{{ plano.nome }}</p>
              <p class="text-sm text-glow-text-subtle">{{ formatBRL(plano.preco) }}/mês</p>
            </div>
            <BaseButton
              variant="primary"
              size="sm"
              :loading="loading"
              @click="emit('select', plano.id)"
            >
              Selecionar
            </BaseButton>
          </li>
        </ul>
        <div class="mt-4 flex justify-end">
          <BaseButton variant="ghost" @click="emit('close')">Fechar</BaseButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

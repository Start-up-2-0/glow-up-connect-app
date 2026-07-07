<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import type { SubtipoAjusteManual } from '@/types/negocio/caixa.types'

const open = defineModel<boolean>({ default: false })

const props = defineProps<{
  subtipo: SubtipoAjusteManual
  loading?: boolean
}>()

const emit = defineEmits<{
  confirm: [payload: { valor: number; descricao: string }]
}>()

const valor = ref('')
const descricao = ref('')

watch(open, (isOpen) => {
  if (isOpen) {
    valor.value = ''
    descricao.value = ''
  }
})

function close() {
  open.value = false
}

function handleConfirm() {
  const valorNum = Number(valor.value)
  if (!descricao.value.trim() || !Number.isFinite(valorNum) || valorNum <= 0) return
  emit('confirm', { valor: valorNum, descricao: descricao.value.trim() })
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
        @click.self="close"
      >
        <div class="w-full max-w-md rounded-xl border border-glow-border-soft bg-glow-surface p-5 shadow-xl">
          <h2 class="font-satoshi text-lg font-bold text-glow-text">
            {{ subtipo === 'Sangria' ? 'Sangria' : 'Reforço' }} de caixa
          </h2>

          <label class="mt-4 block font-urbanist text-sm text-glow-text-subtle">
            Valor
            <input
              v-model="valor"
              type="number"
              min="0"
              step="0.01"
              class="mt-1 w-full rounded border border-glow-border-soft bg-glow-canvas px-3 py-2 text-glow-text"
            />
          </label>

          <label class="mt-3 block font-urbanist text-sm text-glow-text-subtle">
            Descrição
            <textarea
              v-model="descricao"
              rows="3"
              class="mt-1 w-full rounded border border-glow-border-soft bg-glow-canvas px-3 py-2 text-glow-text"
            />
          </label>

          <div class="mt-5 flex justify-end gap-2">
            <BaseButton variant="secondary" size="sm" :disabled="loading" @click="close">Cancelar</BaseButton>
            <BaseButton size="sm" :loading="loading" @click="handleConfirm">Confirmar</BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

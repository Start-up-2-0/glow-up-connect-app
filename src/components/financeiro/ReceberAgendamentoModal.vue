<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import type { FormaRecebimentoPresencial } from '@/types/negocio/caixa.types'
import { formatCurrency } from '@/utils/formatters'

const open = defineModel<boolean>({ default: false })

const props = defineProps<{
  valorTotal: number
  loading?: boolean
}>()

const emit = defineEmits<{
  confirm: [payload: { formaRecebimento: FormaRecebimentoPresencial; valor?: number }]
}>()

const forma = ref<FormaRecebimentoPresencial>('Dinheiro')
const valor = ref('')

const formas: FormaRecebimentoPresencial[] = [
  'Dinheiro',
  'Pix',
  'CartaoDebito',
  'CartaoCredito',
  'Outro',
]

watch(open, (isOpen) => {
  if (isOpen) {
    forma.value = 'Dinheiro'
    valor.value = String(props.valorTotal)
  }
})

function close() {
  open.value = false
}

function handleConfirm() {
  const valorNum = Number(valor.value)
  emit('confirm', {
    formaRecebimento: forma.value,
    valor: Number.isFinite(valorNum) && valorNum > 0 ? valorNum : undefined,
  })
}
</script>

<template>
  <Teleport to="body">
    <Transition name="equipe-modal">
      <div
        v-if="open"
        class="glow-modal-overlay !items-center"
        @click.self="close"
      >
        <div
          class="w-full max-w-md rounded-xl border border-glow-border-soft bg-glow-surface p-5 shadow-xl"
          role="dialog"
          aria-modal="true"
        >
          <h2 class="font-satoshi text-lg font-bold text-glow-text">Receber presencialmente</h2>
          <p class="mt-2 font-urbanist text-sm text-glow-text-subtle">
            Valor do agendamento: {{ formatCurrency(valorTotal) }}
          </p>

          <label class="mt-4 block font-urbanist text-sm text-glow-text-subtle">
            Forma de pagamento
            <select
              v-model="forma"
              class="mt-1 w-full rounded border border-glow-border-soft bg-glow-canvas px-3 py-2 text-glow-text"
            >
              <option v-for="f in formas" :key="f" :value="f">{{ f }}</option>
            </select>
          </label>

          <label class="mt-3 block font-urbanist text-sm text-glow-text-subtle">
            Valor recebido
            <input
              v-model="valor"
              type="number"
              min="0"
              step="0.01"
              class="mt-1 w-full rounded border border-glow-border-soft bg-glow-canvas px-3 py-2 text-glow-text"
            />
          </label>

          <div class="mt-5 flex justify-end gap-2">
            <BaseButton variant="secondary" size="sm" :disabled="loading" @click="close">
              Cancelar
            </BaseButton>
            <BaseButton size="sm" :loading="loading" @click="handleConfirm">Confirmar recebimento</BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

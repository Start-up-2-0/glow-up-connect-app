<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import { formatCurrency } from '@/utils/formatters'

const open = defineModel<boolean>({ default: false })

defineProps<{
  titulo: string
  descricao: string
  valor: number
  loading?: boolean
}>()

const emit = defineEmits<{ confirm: [payload: { formaBaixa: string; observacao: string }] }>()

const formaBaixa = ref('Dinheiro')
const observacao = ref('')

const formas = [
  { value: 'Dinheiro', label: 'Dinheiro' },
  { value: 'Pix', label: 'Pix' },
  { value: 'CartaoDebito', label: 'Cartão débito' },
  { value: 'CartaoCredito', label: 'Cartão crédito' },
  { value: 'Transferencia', label: 'Transferência' },
  { value: 'Outro', label: 'Outro' },
]

watch(open, (isOpen) => {
  if (isOpen) {
    formaBaixa.value = 'Dinheiro'
    observacao.value = ''
  }
})

function close() {
  open.value = false
}

function handleConfirm() {
  emit('confirm', { formaBaixa: formaBaixa.value, observacao: observacao.value.trim() })
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
        class="financeiro-modal-overlay"
        role="dialog"
        aria-modal="true"
        @click.self="close"
      >
        <div class="financeiro-modal">
          <div class="financeiro-modal__header">
            <h2 class="financeiro-modal__title">Baixar conta</h2>
            <p class="font-urbanist text-sm text-glow-text-subtle">{{ titulo }}</p>
          </div>
          <div class="financeiro-modal__body space-y-4">
            <p class="font-satoshi text-xl font-bold text-glow-text">{{ formatCurrency(valor) }}</p>
            <p class="font-urbanist text-sm text-glow-text">{{ descricao }}</p>
            <BaseSelect v-model="formaBaixa" label="Forma de baixa" :options="formas" />
            <div>
              <label class="font-urbanist text-sm font-medium text-glow-text">Observação (opcional)</label>
              <input
                v-model="observacao"
                type="text"
                class="mt-1 h-11 w-full rounded-lg border border-glow-border-soft bg-glow-canvas px-3.5 font-urbanist text-sm outline-none focus:border-glow-gold focus:ring-1 focus:ring-glow-gold"
              />
            </div>
          </div>
          <div class="financeiro-modal__footer">
            <BaseButton variant="secondary" size="sm" :disabled="loading" @click="close">
              Cancelar
            </BaseButton>
            <BaseButton size="sm" :loading="loading" @click="handleConfirm">
              Confirmar baixa
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

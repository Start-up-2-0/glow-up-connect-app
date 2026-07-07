<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import CurrencyInput from '@/components/ui/CurrencyInput.vue'
import type { SessaoCaixa } from '@/types/negocio/caixa.types'

const open = defineModel<boolean>({ default: false })

defineProps<{
  loading?: boolean
  sessao?: SessaoCaixa | null
}>()

const emit = defineEmits<{
  abrir: [saldoInicial: number]
  fechar: [saldoInformado: number]
}>()

const saldoInicial = ref(0)
const saldoFechamento = ref(0)

watch(open, (isOpen) => {
  if (isOpen) {
    saldoInicial.value = 0
    saldoFechamento.value = 0
  }
})

function close() {
  open.value = false
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
            <h2 class="financeiro-modal__title">
              {{ sessao ? 'Fechar caixa' : 'Abrir caixa' }}
            </h2>
            <p class="font-urbanist text-sm text-glow-text-subtle">
              {{
                sessao
                  ? 'Informe o saldo contado para conferência.'
                  : 'Informe o saldo inicial do caixa.'
              }}
            </p>
          </div>
          <div class="financeiro-modal__body space-y-4">
            <CurrencyInput
              v-if="!sessao"
              v-model="saldoInicial"
              label="Saldo inicial"
            />
            <CurrencyInput
              v-else
              v-model="saldoFechamento"
              label="Saldo informado no fechamento"
            />
          </div>
          <div class="financeiro-modal__footer">
            <BaseButton variant="secondary" size="sm" :disabled="loading" @click="close">
              Cancelar
            </BaseButton>
            <BaseButton
              size="sm"
              :loading="loading"
              @click="sessao ? emit('fechar', saldoFechamento) : emit('abrir', saldoInicial)"
            >
              {{ sessao ? 'Fechar caixa' : 'Abrir caixa' }}
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

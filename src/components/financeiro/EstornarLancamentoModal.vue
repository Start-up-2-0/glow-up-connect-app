<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import type { LancamentoCaixa } from '@/types/negocio/caixa.types'
import { formatCurrency, formatDateTime } from '@/utils/formatters'

const open = defineModel<boolean>({ default: false })

const props = defineProps<{
  lancamento: LancamentoCaixa | null
  loading?: boolean
}>()

const emit = defineEmits<{ confirm: [motivo: string] }>()

const motivo = ref('')

watch(open, (isOpen) => {
  if (isOpen) motivo.value = ''
})

function close() {
  open.value = false
}

function handleConfirm() {
  if (!motivo.value.trim()) return
  emit('confirm', motivo.value.trim())
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
            <h2 class="financeiro-modal__title">Estornar lançamento</h2>
          </div>
          <div v-if="props.lancamento" class="financeiro-modal__body space-y-4">
            <div class="rounded-lg bg-glow-hover-surface p-3 font-urbanist text-sm">
              <p class="text-glow-text-subtle">{{ formatDateTime(props.lancamento.criadoEm) }}</p>
              <p class="font-medium text-glow-text">{{ props.lancamento.descricao }}</p>
              <p class="mt-1 font-semibold text-glow-text">
                {{ formatCurrency(props.lancamento.valor) }}
              </p>
            </div>
            <div>
              <label class="font-urbanist text-sm font-medium text-glow-text">Motivo</label>
              <textarea
                v-model="motivo"
                rows="3"
                class="mt-1 w-full rounded-lg border border-glow-border-soft bg-glow-canvas px-3 py-2 font-urbanist text-sm outline-none focus:border-glow-gold focus:ring-1 focus:ring-glow-gold"
                placeholder="Descreva o motivo do estorno"
              />
            </div>
          </div>
          <div class="financeiro-modal__footer">
            <BaseButton variant="secondary" size="sm" :disabled="loading" @click="close">
              Cancelar
            </BaseButton>
            <BaseButton
              variant="danger"
              size="sm"
              :loading="loading"
              :disabled="!motivo.trim()"
              @click="handleConfirm"
            >
              Confirmar estorno
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import CurrencyInput from '@/components/ui/CurrencyInput.vue'
import type { Meta, CriarMetaPayload } from '@/types/negocio/caixa.types'

const open = defineModel<boolean>({ default: false })

const props = defineProps<{
  loading?: boolean
  meta?: Meta | null
}>()

const emit = defineEmits<{ confirm: [payload: CriarMetaPayload] }>()

const nome = ref('')
const tipoMeta = ref('Atendimentos')
const valorMeta = ref(0)
const percentualComissao = ref(10)

const tipoOptions = [
  { value: 'Atendimentos', label: 'Quantidade de atendimentos' },
  { value: 'Faturamento', label: 'Valor faturado (R$)' },
  { value: 'Mista', label: 'Mista (atendimentos + faturamento)' },
]

const isEditing = computed(() => !!props.meta)

watch(open, (isOpen) => {
  if (!isOpen) return
  if (props.meta) {
    nome.value = props.meta.nome
    tipoMeta.value = props.meta.tipoMeta
    valorMeta.value = props.meta.valorMeta
    percentualComissao.value = props.meta.percentualComissao
  } else {
    nome.value = ''
    tipoMeta.value = 'Atendimentos'
    valorMeta.value = 0
    percentualComissao.value = 10
  }
})

function close() {
  open.value = false
}

function handleConfirm() {
  if (!nome.value.trim() || valorMeta.value <= 0 || percentualComissao.value <= 0) return
  emit('confirm', {
    nome: nome.value.trim(),
    tipoMeta: tipoMeta.value as 'Atendimentos' | 'Faturamento' | 'Mista',
    valorMeta: valorMeta.value,
    percentualComissao: percentualComissao.value,
  })
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
              {{ isEditing ? 'Editar meta' : 'Nova meta' }}
            </h2>
          </div>
          <div class="financeiro-modal__body space-y-4">
            <div class="space-y-1">
              <label class="font-urbanist text-sm font-medium text-glow-text">Nome da meta</label>
              <input
                v-model="nome"
                type="text"
                placeholder="Ex.: Meta de atendimentos mensais"
                class="h-11 w-full rounded-lg border border-glow-border-soft bg-glow-canvas px-3.5 font-urbanist text-sm outline-none focus:border-glow-gold focus:ring-1 focus:ring-glow-gold"
              />
            </div>

            <BaseSelect v-model="tipoMeta" label="Tipo da meta" :options="tipoOptions" />

            <div class="space-y-1">
              <label class="font-urbanist text-sm font-medium text-glow-text">Valor da meta</label>
              <div class="flex items-center gap-1 text-sm text-glow-text-subtle">
                <template v-if="tipoMeta === 'Atendimentos'">Quantidade de atendimentos</template>
                <template v-else>Valor em R$</template>
              </div>
              <CurrencyInput v-model="valorMeta" :label="tipoMeta === 'Atendimentos' ? 'Quantidade' : 'Valor'" />
            </div>

            <div class="space-y-1">
              <label class="font-urbanist text-sm font-medium text-glow-text">Percentual de comissão (%)</label>
              <input
                v-model.number="percentualComissao"
                type="number"
                min="0"
                max="100"
                step="0.01"
                class="h-11 w-full rounded-lg border border-glow-border-soft bg-glow-canvas px-3.5 font-urbanist text-sm outline-none focus:border-glow-gold focus:ring-1 focus:ring-glow-gold"
              />
            </div>
          </div>
          <div class="financeiro-modal__footer">
            <BaseButton variant="secondary" size="sm" :disabled="loading" @click="close">
              Cancelar
            </BaseButton>
            <BaseButton size="sm" :loading="loading" @click="handleConfirm">
              {{ isEditing ? 'Salvar' : 'Criar meta' }}
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

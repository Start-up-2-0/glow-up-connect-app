<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import CurrencyInput from '@/components/ui/CurrencyInput.vue'

const open = defineModel<boolean>({ default: false })

defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  confirm: [payload: {
    fornecedor: string
    categoria: string
    descricao: string
    valor: number
    vencimento: string
    recorrente: boolean
  }]
}>()

const fornecedor = ref('')
const categoria = ref('')
const descricao = ref('')
const valor = ref(0)
const vencimento = ref('')
const recorrente = ref(false)

watch(open, (isOpen) => {
  if (isOpen) {
    fornecedor.value = ''
    categoria.value = ''
    descricao.value = ''
    valor.value = 0
    vencimento.value = ''
    recorrente.value = false
  }
})

function close() {
  open.value = false
}

function handleConfirm() {
  if (!fornecedor.value.trim() || !vencimento.value || valor.value <= 0) return
  emit('confirm', {
    fornecedor: fornecedor.value.trim(),
    categoria: categoria.value.trim(),
    descricao: descricao.value.trim(),
    valor: valor.value,
    vencimento: vencimento.value,
    recorrente: recorrente.value,
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
      <div v-if="open" class="financeiro-modal-overlay" role="dialog" aria-modal="true" @click.self="close">
        <div class="financeiro-modal">
          <div class="financeiro-modal__header">
            <h2 class="financeiro-modal__title">Nova conta a pagar</h2>
            <p class="font-urbanist text-sm text-glow-text-subtle">Cadastre uma despesa.</p>
          </div>
          <div class="financeiro-modal__body space-y-4">
            <div>
              <label class="font-urbanist text-sm font-medium text-glow-text">Fornecedor</label>
              <input v-model="fornecedor" type="text" class="mt-1 h-11 w-full rounded-lg border border-glow-border-soft bg-glow-canvas px-3.5 font-urbanist text-sm outline-none focus:border-glow-gold focus:ring-1 focus:ring-glow-gold" />
            </div>
            <div>
              <label class="font-urbanist text-sm font-medium text-glow-text">Categoria</label>
              <input v-model="categoria" type="text" class="mt-1 h-11 w-full rounded-lg border border-glow-border-soft bg-glow-canvas px-3.5 font-urbanist text-sm outline-none focus:border-glow-gold focus:ring-1 focus:ring-glow-gold" />
            </div>
            <div>
              <label class="font-urbanist text-sm font-medium text-glow-text">Descrição</label>
              <input v-model="descricao" type="text" class="mt-1 h-11 w-full rounded-lg border border-glow-border-soft bg-glow-canvas px-3.5 font-urbanist text-sm outline-none focus:border-glow-gold focus:ring-1 focus:ring-glow-gold" />
            </div>
            <CurrencyInput v-model="valor" label="Valor" />
            <div>
              <label class="font-urbanist text-sm font-medium text-glow-text">Vencimento</label>
              <input v-model="vencimento" type="date" class="mt-1 h-11 w-full rounded-lg border border-glow-border-soft bg-glow-canvas px-3.5 font-urbanist text-sm outline-none focus:border-glow-gold focus:ring-1 focus:ring-glow-gold" />
            </div>
            <label class="flex items-center gap-2 font-urbanist text-sm text-glow-text">
              <input v-model="recorrente" type="checkbox" class="size-4 rounded border-glow-border-soft" />
              Despesa recorrente
            </label>
          </div>
          <div class="financeiro-modal__footer">
            <BaseButton variant="secondary" size="sm" :disabled="loading" @click="close">Cancelar</BaseButton>
            <BaseButton size="sm" :loading="loading" @click="handleConfirm">Salvar</BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

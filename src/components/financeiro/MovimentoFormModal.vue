<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import CurrencyInput from '@/components/ui/CurrencyInput.vue'
import {
  CATEGORIAS_SAIDA,
  FORMAS_RECEBIMENTO,
  type MovimentoDirecao,
} from '@/types/negocio/financeiro.types'
import type { CriarMovimentoPayload } from '@/types/negocio/financeiro.types'

const open = defineModel<boolean>({ default: false })

const props = defineProps<{
  direcao: MovimentoDirecao
  loading?: boolean
}>()

const emit = defineEmits<{
  confirm: [payload: CriarMovimentoPayload]
}>()

const descricao = ref('')
const valor = ref(0)
const data = ref('')
const formaPagamento = ref('Pix')
const categoria = ref('Fornecedor')
const vencimento = ref('')
const agendarRecebimento = ref(false)

const isEntrada = () => props.direcao === 'entrada'

watch(open, (isOpen) => {
  if (isOpen) {
    descricao.value = ''
    valor.value = 0
    data.value = new Date().toISOString().slice(0, 10)
    formaPagamento.value = 'Pix'
    categoria.value = 'Fornecedor'
    vencimento.value = ''
    agendarRecebimento.value = false
  }
})

function close() {
  open.value = false
}

function handleConfirm() {
  if (!descricao.value.trim() || valor.value <= 0) return
  const payload: CriarMovimentoPayload = {
    valor: valor.value,
    descricao: descricao.value.trim(),
    data: data.value || null,
  }
  if (isEntrada()) {
    payload.formaPagamento = agendarRecebimento.value ? null : formaPagamento.value
  } else {
    payload.categoria = categoria.value
  }
  if (agendarRecebimento.value && vencimento.value) {
    payload.vencimento = vencimento.value
  }
  emit('confirm', payload)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="equipe-modal">
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
              {{ isEntrada() ? 'Nova entrada' : 'Nova saída' }}
            </h2>
            <p class="font-urbanist text-sm text-glow-text-subtle">
              {{ isEntrada() ? 'Registre um recebimento ou receita.' : 'Registre uma despesa ou gasto.' }}
            </p>
          </div>
          <div class="financeiro-modal__body space-y-4">
            <CurrencyInput v-model="valor" label="Valor" />
            <div>
              <label class="font-urbanist text-sm font-medium text-glow-text">Descrição</label>
              <input
                v-model="descricao"
                type="text"
                class="mt-1 h-11 w-full rounded-lg border border-glow-border-soft bg-glow-canvas px-3.5 font-urbanist text-sm outline-none focus:border-glow-gold focus:ring-1 focus:ring-glow-gold"
              />
            </div>
            <div>
              <label class="font-urbanist text-sm font-medium text-glow-text">Data</label>
              <input
                v-model="data"
                type="date"
                class="mt-1 h-11 w-full rounded-lg border border-glow-border-soft bg-glow-canvas px-3.5 font-urbanist text-sm outline-none focus:border-glow-gold focus:ring-1 focus:ring-glow-gold"
              />
            </div>
            <div v-if="isEntrada() && !agendarRecebimento">
              <label class="font-urbanist text-sm font-medium text-glow-text">Forma de recebimento</label>
              <select
                v-model="formaPagamento"
                class="mt-1 h-11 w-full rounded-lg border border-glow-border-soft bg-glow-canvas px-3.5 font-urbanist text-sm"
              >
                <option v-for="f in FORMAS_RECEBIMENTO" :key="f" :value="f">{{ f }}</option>
              </select>
            </div>
            <div v-if="!isEntrada() && !agendarRecebimento">
              <label class="font-urbanist text-sm font-medium text-glow-text">Categoria</label>
              <select
                v-model="categoria"
                class="mt-1 h-11 w-full rounded-lg border border-glow-border-soft bg-glow-canvas px-3.5 font-urbanist text-sm"
              >
                <option v-for="c in CATEGORIAS_SAIDA" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            <label class="flex items-center gap-2 font-urbanist text-sm text-glow-text">
              <input v-model="agendarRecebimento" type="checkbox" class="rounded border-glow-border-soft" />
              {{ isEntrada() ? 'Agendar para receber depois' : 'Agendar para pagar depois' }}
            </label>
            <div v-if="agendarRecebimento">
              <label class="font-urbanist text-sm font-medium text-glow-text">Vencimento</label>
              <input
                v-model="vencimento"
                type="date"
                class="mt-1 h-11 w-full rounded-lg border border-glow-border-soft bg-glow-canvas px-3.5 font-urbanist text-sm outline-none focus:border-glow-gold focus:ring-1 focus:ring-glow-gold"
              />
            </div>
          </div>
          <div class="financeiro-modal__footer">
            <BaseButton variant="secondary" :disabled="loading" @click="close">Cancelar</BaseButton>
            <BaseButton :loading="loading" @click="handleConfirm">Salvar</BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

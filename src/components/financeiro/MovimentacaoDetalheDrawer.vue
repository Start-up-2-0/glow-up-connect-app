<script setup lang="ts">
import { formatCurrency, formatDateTime } from '@/utils/formatters'
import type { LancamentoCaixa } from '@/types/negocio/caixa.types'

const open = defineModel<boolean>({ default: false })

defineProps<{
  lancamento: LancamentoCaixa | null
}>()

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
      <div v-if="open && lancamento" class="financeiro-drawer-overlay" @click="close" />
    </Transition>
    <Transition
      enter-active-class="transition-transform duration-200"
      leave-active-class="transition-transform duration-200"
      enter-from-class="translate-x-full"
      leave-to-class="translate-x-full"
    >
      <aside
        v-if="open && lancamento"
        class="financeiro-drawer"
        role="dialog"
        aria-modal="true"
      >
        <div class="flex items-center justify-between border-b border-glow-border-soft px-5 py-4">
          <h2 class="font-satoshi text-lg font-bold text-glow-text">Detalhe</h2>
          <button type="button" class="financeiro-btn-outline" @click="close">Fechar</button>
        </div>
        <div class="space-y-4 overflow-y-auto p-5 font-urbanist text-sm">
          <div>
            <p class="text-glow-text-subtle">Data</p>
            <p class="font-medium text-glow-text">{{ formatDateTime(lancamento.criadoEm) }}</p>
          </div>
          <div>
            <p class="text-glow-text-subtle">Tipo</p>
            <p class="font-medium text-glow-text">{{ lancamento.tipo }}</p>
          </div>
          <div>
            <p class="text-glow-text-subtle">Descrição</p>
            <p class="font-medium text-glow-text">{{ lancamento.descricao }}</p>
          </div>
          <div>
            <p class="text-glow-text-subtle">Valor</p>
            <p class="font-satoshi text-xl font-bold text-glow-text">{{ formatCurrency(lancamento.valor) }}</p>
          </div>
          <div v-if="lancamento.agendamentoId">
            <p class="text-glow-text-subtle">Agendamento</p>
            <p class="font-medium text-glow-text">#{{ lancamento.agendamentoId }}</p>
          </div>
          <slot :lancamento="lancamento" />
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

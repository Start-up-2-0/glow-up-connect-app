<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue'
import type { SessaoCaixa } from '@/types/negocio/caixa.types'
import { formatCurrency, formatDateTime } from '@/utils/formatters'

defineProps<{
  sessao: SessaoCaixa | null
  podeGerenciar: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  abrir: []
  fechar: []
}>()
</script>

<template>
  <div
    v-if="podeGerenciar"
    class="financeiro-alert-banner"
    :class="sessao ? 'financeiro-alert-banner--info' : 'financeiro-alert-banner--warning'"
  >
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <template v-if="sessao">
          <strong>Caixa aberto</strong>
          desde {{ formatDateTime(sessao.abertoEm) }} · saldo inicial
          {{ formatCurrency(sessao.saldoInicial) }}
        </template>
        <template v-else>
          <strong>Caixa fechado.</strong> Abra o caixa para iniciar o expediente.
        </template>
      </div>
      <BaseButton
        size="sm"
        :variant="sessao ? 'secondary' : 'primary'"
        :loading="loading"
        @click="sessao ? emit('fechar') : emit('abrir')"
      >
        {{ sessao ? 'Fechar caixa' : 'Abrir caixa' }}
      </BaseButton>
    </div>
  </div>
</template>

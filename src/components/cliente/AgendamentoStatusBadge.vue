<script setup lang="ts">
import type { AgendamentoStatus } from '@/types/agendamento.types'
import { agendamentoStatusLabel } from '@/utils/formatters'

defineProps<{
  status: AgendamentoStatus | string
}>()

const variantClasses: Record<string, string> = {
  Confirmado: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  PendenteConfirmacao: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  Cancelado: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  Concluido: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
}
</script>

<template>
  <span
    class="inline-flex rounded-full px-2.5 py-0.5 font-urbanist text-xs font-medium"
    :class="variantClasses[status] ?? 'bg-glow-canvas text-glow-text-subtle'"
  >
    {{ agendamentoStatusLabel(status) }}
  </span>
</template>

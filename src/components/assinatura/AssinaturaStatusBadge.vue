<script setup lang="ts">
import { computed } from 'vue'
import type { StatusAssinatura } from '@/types/assinatura.types'

const props = defineProps<{
  status: StatusAssinatura | string
}>()

const config = computed(() => {
  const map: Record<string, { label: string; className: string }> = {
    Trial: { label: 'Período de teste', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200' },
    Ativa: { label: 'Ativa', className: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' },
    Inadimplente: { label: 'Aguardando pagamento', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200' },
    PendentePagamento: { label: 'Pagamento pendente', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200' },
    Cancelada: { label: 'Cancelada', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
    Suspensa: { label: 'Suspensa', className: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' },
    Expirada: { label: 'Expirada', className: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' },
    Pendente: { label: 'Aguardando pagamento', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200' },
    Pago: { label: 'Pago', className: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' },
    Recusado: { label: 'Recusado', className: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' },
    Cancelado: { label: 'Cancelado', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
    Atrasado: { label: 'Em atraso', className: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' },
  }
  return map[props.status] ?? { label: props.status, className: 'bg-gray-100 text-gray-700' }
})
</script>

<template>
  <span
    class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium"
    :class="config.className"
  >
    {{ config.label }}
  </span>
</template>

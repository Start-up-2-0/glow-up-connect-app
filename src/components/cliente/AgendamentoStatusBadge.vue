<script setup lang="ts">
import type { AgendamentoStatus } from '@/types/agendamento.types'
import { agendamentoStatusLabel } from '@/utils/formatters'
import { resolveAgendamentoStatusTheme } from '@/utils/agendamentoStatusTheme'

const props = defineProps<{
  status: AgendamentoStatus | string
}>()

const theme = resolveAgendamentoStatusTheme(props.status)
</script>

<template>
  <span class="agendamento-badge" :class="theme.badgeClass">
    {{ agendamentoStatusLabel(status) }}
  </span>
</template>

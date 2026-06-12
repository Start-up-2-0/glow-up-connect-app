<script setup lang="ts">
import type { AgendamentoHistorico } from '@/types/negocio/agenda.types'
import AgendamentoDetailSection from '@/components/agenda/detail/AgendamentoDetailSection.vue'
import { agendamentoStatusLabel, formatHistoricoMeta } from '@/utils/formatters'

defineProps<{
  itens: AgendamentoHistorico[]
}>()
</script>

<template>
  <AgendamentoDetailSection title="Histórico">
    <p v-if="itens.length === 0" class="font-urbanist text-sm text-glow-text-subtle">
      Nenhum registro no histórico.
    </p>
    <ol v-else class="agendamento-detail-historico">
      <li
        v-for="item in itens"
        :key="item.id"
        class="agendamento-detail-historico-item"
      >
        <p class="agendamento-detail-historico-status">
          {{ agendamentoStatusLabel(item.statusNovo) }}
        </p>
        <p class="agendamento-detail-historico-meta">
          {{ formatHistoricoMeta(item.criadoEm, item.usuarioExecutorNome ?? 'Sistema') }}
        </p>
      </li>
    </ol>
  </AgendamentoDetailSection>
</template>

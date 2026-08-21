<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import EmptyState from '@/components/feedback/EmptyState.vue'
import AgendaPageHeader from '@/components/agenda/AgendaPageHeader.vue'
import AgendaFigmaFilter from '@/components/agenda/AgendaFigmaFilter.vue'
import AgendaStatusFilterIcon from '@/components/agenda/AgendaStatusFilterIcon.vue'
import AgendaCalendarFilterIcon from '@/components/agenda/AgendaCalendarFilterIcon.vue'
import AgendaFigmaDateRangeFilter from '@/components/agenda/AgendaFigmaDateRangeFilter.vue'
import AgendaSortFilterIcon from '@/components/agenda/AgendaSortFilterIcon.vue'
import AgendaPagination from '@/components/agenda/AgendaPagination.vue'
import AgendamentoCard from '@/components/agenda/AgendamentoCard.vue'
import { AGENDA_DEFAULT_ORDENACAO, AGENDA_PAGE_SIZE } from '@/constants/agendaFilters'
import { useAgendamentosStore } from '@/stores/agendamentos.store'
import { useMeusAgendamentosFilters } from '@/composables/useAgendaPageFilters'
import { agendamentoAvaliarPath, agendamentoDetalhePath } from '@/constants/routes'
import type { AgendamentoCliente } from '@/types/agendamento.types'

const router = useRouter()
const store = useAgendamentosStore()
const { itens, total, loading } = storeToRefs(store)

const {
  statusFilter,
  periodFilter,
  customDateRange,
  sortFilter,
  pagina,
  statusOptions,
  periodOptions,
  sortOptions,
  apiFiltro,
  resetPagina,
  applyPeriodFilter,
  applyCustomDateRange,
  clearPeriodFilter,
  clearCustomDateRange,
  applySortFilter,
  clearSortFilter,
} = useMeusAgendamentosFilters()

const totalPaginas = computed(() => Math.max(1, Math.ceil(total.value / AGENDA_PAGE_SIZE)))

function avaliacaoSubtitle(item: AgendamentoCliente): string | undefined {
  if (item.avaliacaoStatus === 'Pendente') return 'Concluído · Avalie seu atendimento'
  if (item.avaliacaoStatus === 'Realizada' && item.avaliacaoResumo) {
    return `Avaliado · Loja ${item.avaliacaoResumo.notaEstabelecimento}/5 · Prof. ${item.avaliacaoResumo.notaProfissional}/5`
  }
  return undefined
}

function podeAvaliar(item: AgendamentoCliente): boolean {
  return item.avaliacaoStatus === 'Pendente'
}

function irAvaliar(item: AgendamentoCliente) {
  void router.push(agendamentoAvaliarPath(item.id))
}

async function load() {
  const data = await store.fetchLista({ ...apiFiltro.value }, false)
  pagina.value = data.pagina
}

function onPaginaChange(novaPagina: number) {
  pagina.value = novaPagina
  void load()
}

onMounted(() => {
  resetPagina()
  void load()
})

watch([statusFilter, periodFilter, customDateRange, sortFilter], () => {
  resetPagina()
  void load()
})
</script>

<template>
  <div class="agenda-page">
    <AgendaPageHeader
      title="Meus agendamentos"
      subtitle="Agendamentos do mês atual, com os horários mais recentes primeiro."
    >
      <template #filters>
        <AgendaFigmaFilter
          v-model="statusFilter"
          label="Filtrar por Status"
          :options="statusOptions"
        >
          <template #icon>
            <AgendaStatusFilterIcon />
          </template>
        </AgendaFigmaFilter>

        <AgendaFigmaFilter
          :model-value="periodFilter"
          label="Filtrar por Período"
          :options="periodOptions"
          default-value="mes"
          clear-value="mes"
          @update:model-value="applyPeriodFilter"
          @clear="clearPeriodFilter"
        >
          <template #icon>
            <AgendaCalendarFilterIcon />
          </template>
        </AgendaFigmaFilter>

        <AgendaFigmaDateRangeFilter
          v-model="customDateRange"
          @apply="applyCustomDateRange"
          @clear="clearCustomDateRange"
        />

        <AgendaFigmaFilter
          :model-value="sortFilter"
          label="Ordenar por"
          :options="sortOptions"
          :default-value="AGENDA_DEFAULT_ORDENACAO"
          :clear-value="AGENDA_DEFAULT_ORDENACAO"
          min-width="220px"
          @update:model-value="applySortFilter"
          @clear="clearSortFilter"
        >
          <template #icon>
            <AgendaSortFilterIcon />
          </template>
        </AgendaFigmaFilter>
      </template>
    </AgendaPageHeader>

    <EmptyState
      v-if="itens.length === 0 && !loading"
      title="Nenhum agendamento"
      description="Quando você agendar em uma loja, seus horários aparecerão aqui."
    />

    <template v-else-if="itens.length > 0">
      <div class="agenda-cards-grid">
        <AgendamentoCard
          v-for="item in itens"
          :key="item.id"
          :title="item.estabelecimentoNome"
          :subtitle="avaliacaoSubtitle(item)"
          :inicio="item.inicio"
          :valor-total="item.valorTotal"
          :status="item.status"
          :to="agendamentoDetalhePath(item.id)"
          :pode-avaliar="podeAvaliar(item)"
          @avaliar="irAvaliar(item)"
        />
      </div>

      <AgendaPagination
        :pagina="pagina"
        :total-paginas="totalPaginas"
        :total="total"
        :loading="loading"
        @update:pagina="onPaginaChange"
      />
    </template>
  </div>
</template>

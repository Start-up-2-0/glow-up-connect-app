<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import AgendaPageHeader from '@/components/agenda/AgendaPageHeader.vue'
import AgendaFigmaFilter from '@/components/agenda/AgendaFigmaFilter.vue'
import AgendaStatusFilterIcon from '@/components/agenda/AgendaStatusFilterIcon.vue'
import AgendaCalendarFilterIcon from '@/components/agenda/AgendaCalendarFilterIcon.vue'
import AgendamentoCard from '@/components/agenda/AgendamentoCard.vue'
import { useAgendamentosStore } from '@/stores/agendamentos.store'
import { useMeusAgendamentosFilters } from '@/composables/useAgendaPageFilters'
import { agendamentoDetalhePath } from '@/constants/routes'

const store = useAgendamentosStore()
const { itens, total, loading } = storeToRefs(store)

const {
  statusFilter,
  periodFilter,
  dateFilter,
  statusOptions,
  periodOptions,
  apiFiltro,
  applyPeriodFilter,
  applyDateFilter,
  clearPeriodFilter,
  clearDateFilter,
} = useMeusAgendamentosFilters()

async function load(reset = true) {
  await store.fetchLista({ ...apiFiltro.value, pagina: 1 }, !reset)
}

async function loadMore() {
  await store.fetchLista(
    { ...apiFiltro.value, pagina: store.pagina + 1 },
    true,
  )
}

onMounted(() => load(true))

watch([statusFilter, periodFilter, dateFilter], () => {
  void load(true)
})
</script>

<template>
  <div class="agenda-page">
    <AgendaPageHeader
      title="Meus agendamentos"
      subtitle="Acompanhe, cancele ou remarque seus horários."
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
          default-value="proximos"
          clear-value="proximos"
          @update:model-value="applyPeriodFilter"
          @clear="clearPeriodFilter"
        >
          <template #icon>
            <AgendaCalendarFilterIcon />
          </template>
        </AgendaFigmaFilter>

        <AgendaFigmaFilter
          :model-value="dateFilter"
          label="Filtrar por Data"
          mode="date"
          @update:model-value="applyDateFilter"
          @clear="clearDateFilter"
        >
          <template #icon>
            <AgendaCalendarFilterIcon />
          </template>
        </AgendaFigmaFilter>
      </template>
    </AgendaPageHeader>

    <LoadingSpinner v-if="loading && itens.length === 0" />

    <EmptyState
      v-else-if="itens.length === 0"
      title="Nenhum agendamento"
      description="Quando você agendar em uma loja, seus horários aparecerão aqui."
    />

    <template v-else>
      <div class="agenda-cards-grid">
        <AgendamentoCard
          v-for="item in itens"
          :key="item.id"
          :title="item.estabelecimentoNome"
          :inicio="item.inicio"
          :valor-total="item.valorTotal"
          :status="item.status"
          :to="agendamentoDetalhePath(item.id)"
        />
      </div>

      <div v-if="itens.length < total" class="flex justify-center pt-2">
        <button
          type="button"
          class="agenda-filter-btn"
          :disabled="loading"
          @click="loadMore"
        >
          {{ loading ? 'Carregando…' : 'Carregar mais' }}
        </button>
      </div>
    </template>
  </div>
</template>

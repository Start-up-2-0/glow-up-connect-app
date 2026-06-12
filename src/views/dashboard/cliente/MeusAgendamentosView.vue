<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import AgendaPageHeader from '@/components/agenda/AgendaPageHeader.vue'
import AgendaFilterDropdown from '@/components/agenda/AgendaFilterDropdown.vue'
import AgendamentoCard from '@/components/agenda/AgendamentoCard.vue'
import { useAgendamentosStore } from '@/stores/agendamentos.store'
import { useMeusAgendamentosFilters } from '@/composables/useAgendaPageFilters'
import { agendamentoDetalhePath } from '@/constants/routes'

const store = useAgendamentosStore()
const { itens, total, loading } = storeToRefs(store)

const {
  statusFilter,
  periodFilter,
  statusOptions,
  periodOptions,
  apiFiltro,
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

watch([statusFilter, periodFilter], () => {
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
        <AgendaFilterDropdown
          v-model="statusFilter"
          button-label="Filtrar por Status"
          :options="statusOptions"
        >
          <template #icon>
            <svg class="size-5 shrink-0" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="10" cy="10" r="6.5" stroke="currentColor" stroke-width="1.2" />
              <path d="M10 5.5V10l2.5 1.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
            </svg>
          </template>
        </AgendaFilterDropdown>

        <AgendaFilterDropdown
          v-model="periodFilter"
          button-label="Filtrar por Período"
          :options="periodOptions"
        >
          <template #icon>
            <svg class="size-4 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" stroke-width="1.2" />
              <path d="M5 1.5V4M11 1.5V4M1.5 6.5H14.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
            </svg>
          </template>
        </AgendaFilterDropdown>
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

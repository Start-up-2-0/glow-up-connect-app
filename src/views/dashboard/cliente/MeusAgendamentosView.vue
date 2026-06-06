<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import AgendamentoStatusBadge from '@/components/cliente/AgendamentoStatusBadge.vue'
import { useAgendamentosStore } from '@/stores/agendamentos.store'
import { agendamentoDetalhePath } from '@/constants/routes'
import type { AgendamentoOrdenacao } from '@/types/agendamento.types'
import { formatCurrency, formatDateTime } from '@/utils/formatters'

const store = useAgendamentosStore()
const { itens, total, loading } = storeToRefs(store)

const ordenacao = ref<AgendamentoOrdenacao>('proximos')

async function load(reset = true) {
  await store.fetchLista({ ordenacao: ordenacao.value, pagina: 1 }, !reset)
}

async function loadMore() {
  await store.fetchLista(
    { ordenacao: ordenacao.value, pagina: store.pagina + 1 },
    true,
  )
}

onMounted(() => load(true))
</script>

<template>
  <div class="space-y-4 lg:space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="font-satoshi text-xl font-bold leading-tight text-glow-text lg:text-2xl">
          Meus agendamentos
        </h1>
        <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
          Acompanhe, cancele ou remarque seus horários.
        </p>
      </div>

      <select
        v-model="ordenacao"
        class="rounded border border-glow-border-soft bg-glow-surface px-3 py-2 font-urbanist text-sm"
        @change="load(true)"
      >
        <option value="proximos">Próximos</option>
        <option value="recentes">Recentes</option>
      </select>
    </div>

    <LoadingSpinner v-if="loading && itens.length === 0" />

    <BaseCard v-else-if="itens.length === 0">
      <EmptyState
        title="Nenhum agendamento"
        description="Quando você agendar em uma loja, seus horários aparecerão aqui."
      />
    </BaseCard>

    <div v-else class="space-y-3">
      <RouterLink
        v-for="item in itens"
        :key="item.id"
        :to="agendamentoDetalhePath(item.id)"
        class="block rounded-lg border border-glow-border-soft bg-glow-surface p-4 transition-colors hover:border-glow-gold-dark hover:bg-glow-hover-surface"
      >
        <div class="flex flex-wrap items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="font-urbanist text-base font-semibold text-glow-text">
              {{ item.estabelecimentoNome }}
            </p>
            <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
              {{ formatDateTime(item.inicio) }}
            </p>
          </div>
          <AgendamentoStatusBadge :status="item.status" />
        </div>
        <p class="mt-2 font-urbanist text-sm font-medium text-glow-text">
          {{ formatCurrency(item.valorTotal) }}
        </p>
      </RouterLink>

      <div v-if="itens.length < total" class="flex justify-center pt-2">
        <BaseButton variant="secondary" :loading="loading" @click="loadMore">
          Carregar mais
        </BaseButton>
      </div>
    </div>
  </div>
</template>

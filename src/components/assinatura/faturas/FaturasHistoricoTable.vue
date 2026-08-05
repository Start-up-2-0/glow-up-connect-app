<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { ChevronLeft, ChevronRight, MoreVertical } from 'lucide-vue-next'
import AssinaturaStatusBadge from '@/components/assinatura/AssinaturaStatusBadge.vue'
import DashboardEmptyState from '@/components/dashboard/cliente/DashboardEmptyState.vue'
import { formatBRL, formatDate } from '@/utils/formatters'
import type { CobrancaAssinatura } from '@/types/assinatura.types'

const props = withDefaults(
  defineProps<{
    cobrancas: CobrancaAssinatura[]
    loading?: boolean
    pageSize?: number
  }>(),
  { pageSize: 8 },
)

const emit = defineEmits<{
  detalhe: [cobranca: CobrancaAssinatura]
  'copiar-id': [cobranca: CobrancaAssinatura]
}>()

const page = ref(1)
const menuAbertoId = ref<number | null>(null)

const totalPages = computed(() =>
  Math.max(1, Math.ceil(props.cobrancas.length / props.pageSize)),
)

const pageItems = computed(() => {
  const start = (page.value - 1) * props.pageSize
  return props.cobrancas.slice(start, start + props.pageSize)
})

const mostrandoDe = computed(() => {
  if (props.cobrancas.length === 0) return 0
  return (page.value - 1) * props.pageSize + 1
})

const mostrandoAte = computed(() =>
  Math.min(page.value * props.pageSize, props.cobrancas.length),
)

function irPara(p: number) {
  page.value = Math.min(Math.max(1, p), totalPages.value)
  menuAbertoId.value = null
}

function toggleMenu(id: number) {
  menuAbertoId.value = menuAbertoId.value === id ? null : id
}

function fecharMenu() {
  menuAbertoId.value = null
}

function onDocClick(e: MouseEvent) {
  const target = e.target as HTMLElement | null
  if (!target?.closest('[data-fatura-menu]')) fecharMenu()
}

onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))
</script>

<template>
  <section class="faturas-table-card">
    <div class="mb-4 flex items-center justify-between gap-2">
      <div>
        <h2 class="font-urbanist text-[16px] font-semibold text-glow-text">
          Histórico de faturas
        </h2>
        <p class="mt-0.5 font-urbanist text-[12px] text-glow-text-subtle">
          Cobranças geradas pela sua assinatura
        </p>
      </div>
    </div>

    <div v-if="loading" class="flex flex-col gap-2">
      <span v-for="i in 4" :key="i" class="h-12 animate-pulse rounded-xl bg-glow-canvas" />
    </div>

    <DashboardEmptyState
      v-else-if="cobrancas.length === 0"
      title="Nenhuma fatura gerada ainda"
      description="As faturas aparecerão aqui após o primeiro ciclo de cobrança."
    />

    <template v-else>
      <div class="overflow-x-auto">
        <table class="faturas-table min-w-[720px] w-full border-collapse text-left">
          <thead>
            <tr>
              <th>Ciclo</th>
              <th>Período</th>
              <th>Vencimento</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Pago em</th>
              <th class="w-12 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cobranca in pageItems" :key="cobranca.id">
              <td class="font-semibold text-glow-text">#{{ cobranca.numeroCiclo }}</td>
              <td class="text-glow-text-subtle">
                {{ formatDate(cobranca.cicloInicio) }} — {{ formatDate(cobranca.cicloFim) }}
              </td>
              <td class="text-glow-text-subtle">{{ formatDate(cobranca.dataVencimento) }}</td>
              <td class="font-semibold text-glow-text">{{ formatBRL(cobranca.valor) }}</td>
              <td><AssinaturaStatusBadge :status="cobranca.status" /></td>
              <td class="text-glow-text-subtle">
                {{ cobranca.pagoEm ? formatDate(cobranca.pagoEm) : '—' }}
              </td>
              <td class="text-right">
                <div class="relative inline-flex justify-end" data-fatura-menu>
                  <button
                    type="button"
                    class="faturas-menu-btn"
                    :aria-expanded="menuAbertoId === cobranca.id"
                    @click.stop="toggleMenu(cobranca.id)"
                  >
                    <MoreVertical :size="16" :stroke-width="1.75" />
                  </button>
                  <div
                    v-if="menuAbertoId === cobranca.id"
                    class="faturas-menu"
                    role="menu"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      @click="emit('detalhe', cobranca); fecharMenu()"
                    >
                      Ver detalhes
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      @click="emit('copiar-id', cobranca); fecharMenu()"
                    >
                      Copiar ID do pagamento
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-glow-border-soft pt-4">
        <p class="font-urbanist text-[12px] text-glow-text-subtle">
          Mostrando {{ mostrandoDe }}–{{ mostrandoAte }} de {{ cobrancas.length }} faturas
        </p>
        <div class="flex items-center gap-1">
          <button
            type="button"
            class="faturas-page-btn"
            :disabled="page <= 1"
            @click="irPara(page - 1)"
          >
            <ChevronLeft :size="16" :stroke-width="1.75" />
          </button>
          <span
            class="inline-flex size-8 items-center justify-center rounded-lg bg-glow-gold-selected font-urbanist text-[12px] font-semibold text-glow-gold-cta"
          >
            {{ page }}
          </span>
          <button
            type="button"
            class="faturas-page-btn"
            :disabled="page >= totalPages"
            @click="irPara(page + 1)"
          >
            <ChevronRight :size="16" :stroke-width="1.75" />
          </button>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.faturas-table-card {
  border-radius: 20px;
  border: 1px solid var(--glow-border-soft);
  background: var(--glow-surface);
  padding: 1.25rem 1.35rem 1.35rem;
  box-shadow: var(--glow-shadow-sm);
  animation: faturas-fade-up 0.45s ease 0.06s both;
}
.faturas-table th {
  padding: 0.65rem 0.75rem;
  border-bottom: 1px solid var(--glow-border-soft);
  font-family: 'Urbanist', ui-sans-serif, system-ui, sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: var(--glow-text-muted);
}
.faturas-table td {
  padding: 0.9rem 0.75rem;
  border-bottom: 1px solid var(--glow-border-soft);
  font-family: 'Urbanist', ui-sans-serif, system-ui, sans-serif;
  font-size: 13px;
  vertical-align: middle;
}
.faturas-table tbody tr:last-child td {
  border-bottom: 0;
}
.faturas-table tbody tr:hover td {
  background: color-mix(in srgb, var(--glow-text) 3%, transparent);
}
.faturas-menu-btn {
  display: inline-flex;
  height: 32px;
  width: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: var(--glow-text-muted);
  transition: background 0.15s ease, color 0.15s ease;
}
.faturas-menu-btn:hover {
  background: var(--glow-hover-surface);
  color: var(--glow-text);
}
.faturas-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  z-index: 20;
  min-width: 190px;
  border-radius: 12px;
  border: 1px solid var(--glow-border-soft);
  background: var(--glow-surface);
  padding: 0.35rem;
  box-shadow: 0 12px 28px -16px rgba(0, 0, 0, 0.35);
}
.faturas-menu button {
  display: block;
  width: 100%;
  border-radius: 8px;
  padding: 0.55rem 0.7rem;
  text-align: left;
  font-family: 'Urbanist', ui-sans-serif, system-ui, sans-serif;
  font-size: 13px;
  color: var(--glow-text);
}
.faturas-menu button:hover {
  background: var(--glow-hover-surface);
}
.faturas-page-btn {
  display: inline-flex;
  height: 32px;
  width: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 1px solid var(--glow-border-soft);
  color: var(--glow-text-subtle);
  transition: background 0.15s ease;
}
.faturas-page-btn:hover:not(:disabled) {
  background: var(--glow-hover-surface);
}
.faturas-page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
@keyframes faturas-fade-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

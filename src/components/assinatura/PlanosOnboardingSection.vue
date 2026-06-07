<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import PlanoCard from '@/components/assinatura/PlanoCard.vue'
import PromocaoLancamentoBanner from '@/components/assinatura/PromocaoLancamentoBanner.vue'
import { usePlanosStore } from '@/stores/planos.store'
import { useApiError } from '@/composables/useApiError'

withDefaults(
  defineProps<{
    showComparativa?: boolean
    modoLogado?: boolean
  }>(),
  {
    showComparativa: true,
    modoLogado: false,
  },
)

const planosStore = usePlanosStore()
const { planos, promocao, loading } = storeToRefs(planosStore)
const { resolveError } = useApiError()
const erro = ref<string | null>(null)
const comparativaAberta = ref(false)

const planoPlus = computed(() => planos.value.find((p) => p.nome === 'Plus'))

onMounted(async () => {
  try {
    await planosStore.fetchPlanos()
  } catch (err) {
    erro.value = resolveError(err)
  }
})
</script>

<template>
  <div>
    <PromocaoLancamentoBanner v-if="promocao?.disponivel" :promocao="promocao" />

    <LoadingSpinner v-if="loading" />
    <p v-else-if="erro" class="text-center text-sm text-red-600">{{ erro }}</p>
    <EmptyState
      v-else-if="planos.length === 0"
      title="Nenhum plano disponível"
      description="Tente novamente mais tarde."
    />
    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <PlanoCard
        v-for="plano in planos"
        :key="plano.id"
        :plano="plano"
        :destacado="plano.id === planoPlus?.id"
        :desabilitado="planos.length === 0"
        :modo-logado="modoLogado"
      />
    </div>

    <div v-if="showComparativa && planos.length > 0" class="mt-10">
      <button
        type="button"
        class="text-sm font-medium text-glow-gold hover:underline"
        @click="comparativaAberta = !comparativaAberta"
      >
        {{ comparativaAberta ? 'Ocultar' : 'Ver' }} comparativo de funcionalidades
      </button>
      <div
        v-if="comparativaAberta"
        class="mt-4 overflow-x-auto rounded-lg border border-glow-border-soft"
      >
        <table class="min-w-full text-left text-sm">
          <thead class="bg-glow-surface">
            <tr>
              <th class="px-4 py-3 font-medium text-glow-text">Funcionalidade</th>
              <th
                v-for="plano in planos"
                :key="plano.id"
                class="px-4 py-3 font-medium text-glow-text"
              >
                {{ plano.nome }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(func, idx) in [...new Set(planos.flatMap((p) => p.funcionalidades))]"
              :key="idx"
              class="border-t border-glow-border-soft"
            >
              <td class="px-4 py-2 text-glow-text-subtle">{{ func }}</td>
              <td
                v-for="plano in planos"
                :key="`${plano.id}-${idx}`"
                class="px-4 py-2 text-center"
              >
                {{ plano.funcionalidades.includes(func) ? '✓' : '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

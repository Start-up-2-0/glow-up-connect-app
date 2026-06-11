<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useNegocioStore } from '@/stores/negocio.store'
import { useAcessoUsuario } from '@/composables/useAcessoUsuario'

withDefaults(
  defineProps<{
    block?: boolean
  }>(),
  { block: false },
)

const negocioStore = useNegocioStore()
const { temVinculoNegocio } = useAcessoUsuario()
const { estabelecimentos, estabelecimentoIdSelecionado, loading } = storeToRefs(negocioStore)

onMounted(async () => {
  await negocioStore.fetchEstabelecimentos()
})

function onChange(event: Event) {
  const value = Number((event.target as HTMLSelectElement).value)
  if (Number.isFinite(value)) {
    negocioStore.selecionarEstabelecimento(value)
  }
}
</script>

<template>
  <div
    v-if="temVinculoNegocio"
    :class="block ? 'min-w-0' : 'hidden min-w-0 lg:block'"
  >
    <label for="estabelecimento-select" class="sr-only">Estabelecimento</label>
    <select
      id="estabelecimento-select"
      :value="estabelecimentoIdSelecionado ?? ''"
      :disabled="loading"
      class="truncate rounded-lg border border-glow-border-soft bg-glow-surface px-3 font-urbanist text-sm text-glow-text focus:border-glow-gold focus:outline-none focus:ring-1 focus:ring-glow-gold/40"
      :class="block ? 'h-10 w-full' : 'h-[46px] max-w-[220px]'"
      @change="onChange"
    >
      <option
        v-for="est in estabelecimentos"
        :key="est.estabelecimentoId"
        :value="est.estabelecimentoId"
      >
        {{ est.nome }}
      </option>
    </select>
  </div>
</template>

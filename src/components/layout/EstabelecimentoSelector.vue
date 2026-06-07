<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useNegocioStore } from '@/stores/negocio.store'
import { isClienteRole } from '@/types/user.types'
import { useUserStore } from '@/stores/user.store'

const negocioStore = useNegocioStore()
const userStore = useUserStore()
const { estabelecimentos, estabelecimentoIdSelecionado, loading } = storeToRefs(negocioStore)

onMounted(async () => {
  if (userStore.profile && !isClienteRole(userStore.profile.role)) {
    await negocioStore.fetchEstabelecimentos()
  }
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
    v-if="estabelecimentos.length > 0 && userStore.profile && !isClienteRole(userStore.profile.role)"
    class="hidden min-w-0 lg:block"
  >
    <label for="estabelecimento-select" class="sr-only">Estabelecimento</label>
    <select
      id="estabelecimento-select"
      :value="estabelecimentoIdSelecionado ?? ''"
      :disabled="loading"
      class="h-[46px] max-w-[220px] truncate rounded-xl border border-glow-border-soft bg-glow-surface px-3 font-urbanist text-sm text-glow-text focus:border-glow-gold focus:outline-none focus:ring-1 focus:ring-glow-gold"
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

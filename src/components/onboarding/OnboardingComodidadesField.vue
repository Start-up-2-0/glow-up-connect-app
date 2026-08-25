<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { publicoService, type ComodidadePublica } from '@/services/publicoService'

const model = defineModel<number[]>({ required: true })
const comodidades = ref<ComodidadePublica[]>([])
const loading = ref(true)
const loadError = ref(false)

onMounted(async () => {
  try {
    comodidades.value = await publicoService.listarComodidades()
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <fieldset class="space-y-3 sm:col-span-2">
    <div>
      <legend class="font-urbanist text-sm font-bold text-glow-text">
        Comodidades oferecidas
      </legend>
      <p class="mt-1 font-urbanist text-sm text-glow-text-muted">
        Marque o que seus clientes encontrarão no local. Se não oferecer nenhuma, deixe sem marcar.
      </p>
    </div>

    <p v-if="loading" class="font-urbanist text-sm text-glow-text-muted">
      Carregando comodidades...
    </p>
    <p v-else-if="loadError" class="font-urbanist text-sm text-red-600" role="alert">
      Não foi possível carregar as comodidades. Tente novamente antes de continuar.
    </p>
    <div v-else class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      <label
        v-for="comodidade in comodidades"
        :key="comodidade.id"
        class="flex cursor-pointer items-center gap-3 rounded-xl border border-glow-border-soft bg-glow-surface px-3 py-3 transition hover:bg-glow-hover-surface"
      >
        <input
          v-model="model"
          type="checkbox"
          :value="comodidade.id"
          class="size-4 shrink-0 rounded border-glow-border text-glow-gold focus:ring-glow-gold"
        />
        <span class="font-urbanist text-sm text-glow-text">{{ comodidade.nome }}</span>
      </label>
    </div>
  </fieldset>
</template>

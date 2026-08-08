<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ServicoForm from '@/components/servicos/ServicoForm.vue'
import ServicoPageHeader from '@/components/servicos/ServicoPageHeader.vue'
import { SERVICOS_PAGE_CLASS } from '@/constants/designTokens'
import { ROUTE_NAMES, ROUTE_PATHS } from '@/constants/routes'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'

const route = useRoute()
const router = useRouter()
const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()

const isNovo = computed(() => route.name === ROUTE_NAMES.SERVICOS_NOVO)
const servicoId = computed(() => {
  if (isNovo.value) return null
  const id = Number(route.params.id)
  return Number.isFinite(id) ? id : null
})

const formReady = ref(false)

const pageTitle = computed(() => (isNovo.value ? 'Novo serviço' : 'Editar serviço'))
const pageSubtitle = computed(() =>
  isNovo.value
    ? 'Cadastre um novo serviço oferecido pelo estabelecimento.'
    : 'Atualize as informações do serviço.',
)

function onSaved() {
  void router.push(ROUTE_PATHS.SERVICOS)
}

function voltar() {
  void router.push(ROUTE_PATHS.SERVICOS)
}

watch(
  ready,
  (isReady) => {
    formReady.value = isReady
  },
  { immediate: true },
)
</script>

<template>
  <div :class="SERVICOS_PAGE_CLASS">
    <ServicoPageHeader
      :title="pageTitle"
      :subtitle="pageSubtitle"
      :back-to="ROUTE_PATHS.SERVICOS"
      back-label="Voltar à listagem"
    />

    <p v-if="contextError" class="font-urbanist text-sm text-red-600">{{ contextError }}</p>

    <ServicoForm
      v-if="formReady && estabelecimentoId && !contextLoading"
      :estabelecimento-id="estabelecimentoId"
      :servico-id="servicoId"
      @saved="onSaved"
      @cancel="voltar"
    />
  </div>
</template>

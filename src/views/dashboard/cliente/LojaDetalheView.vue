<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import BaseAlert from '@/components/feedback/BaseAlert.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import ClientePageHeader from '@/components/cliente/ClientePageHeader.vue'
import LojaResumoPanel from '@/components/cliente/LojaResumoPanel.vue'
import LojaServicoCard from '@/components/cliente/LojaServicoCard.vue'
import { publicoService } from '@/services/publicoService'
import { useGeolocation } from '@/composables/useGeolocation'
import { useApiError } from '@/composables/useApiError'
import { ROUTE_PATHS } from '@/constants/routes'
import type { EstabelecimentoPublico } from '@/types/estabelecimento.types'
import type { ServicoPublico } from '@/types/agendamento.types'

const route = useRoute()
const publicGuid = computed(() => String(route.params.publicGuid))
const { coords, request } = useGeolocation()
const { resolveError } = useApiError()

const loja = ref<EstabelecimentoPublico | null>(null)
const servicos = ref<ServicoPublico[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    await request()
    const [detalhe, listaServicos] = await Promise.all([
      publicoService.obterEstabelecimento(publicGuid.value, {
        latitude: coords.value?.latitude,
        longitude: coords.value?.longitude,
      }),
      publicoService.listarServicosLoja(publicGuid.value).catch(() => []),
    ])
    loja.value = detalhe
    servicos.value = listaServicos
  } catch (err) {
    error.value = resolveError(err, 'Não foi possível carregar a loja.')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="cliente-loja-detalhe-page">
    <LoadingSpinner v-if="loading" />

    <template v-else-if="loja">
      <ClientePageHeader :back-to="ROUTE_PATHS.EXPLORAR" back-label="Voltar para explorar lojas" />

      <div class="cliente-loja-detalhe-layout">
        <LojaResumoPanel :loja="loja" />

        <aside class="cliente-loja-servicos">
          <h3 class="cliente-section-label">SERVIÇOS DISPONÍVEIS</h3>

          <p v-if="servicos.length === 0" class="cliente-empty-panel text-center font-urbanist text-sm text-glow-text-subtle">
            Nenhum serviço disponível no momento.
          </p>

          <div v-else class="cliente-loja-servicos-grid">
            <LojaServicoCard
              v-for="servico in servicos"
              :key="servico.id"
              :nome="servico.nome"
              :duracao-minutos="servico.duracaoMinutosEstimada"
              :preco-minimo="servico.precoMinimo"
              :preco-maximo="servico.precoMaximo"
            />
          </div>
        </aside>
      </div>
    </template>

    <BaseAlert v-else variant="error">{{ error ?? 'Loja não encontrada.' }}</BaseAlert>
  </div>
</template>

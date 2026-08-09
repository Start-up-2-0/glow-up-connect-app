<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { ChevronRight, CalendarDays, Scissors, Users } from 'lucide-vue-next'
import { RouterLink, useRoute } from 'vue-router'
import BaseAlert from '@/components/feedback/BaseAlert.vue'
import LojaResumoPanel from '@/components/cliente/LojaResumoPanel.vue'
import LojaHorariosCard from '@/components/cliente/LojaHorariosCard.vue'
import LojaProfissionaisModal from '@/components/cliente/LojaProfissionaisModal.vue'
import LojaServicosModal from '@/components/cliente/LojaServicosModal.vue'
import AvaliacaoResumoCard from '@/components/avaliacao/AvaliacaoResumoCard.vue'
import AvaliacaoComentariosLista from '@/components/avaliacao/AvaliacaoComentariosLista.vue'
import { publicoService } from '@/services/publicoService'
import { avaliacaoService } from '@/services/avaliacaoService'
import { useGeolocation } from '@/composables/useGeolocation'
import { useApiError } from '@/composables/useApiError'
import { useLoading } from '@/composables/useLoading'
import { lojaAgendarPath } from '@/constants/routes'
import type { EstabelecimentoPublico } from '@/types/estabelecimento.types'
import type { ProfissionalPublico, ServicoPublico } from '@/types/agendamento.types'
import type { AvaliacoesPaginadas } from '@/types/avaliacao.types'

const route = useRoute()
const publicGuid = computed(() => String(route.params.publicGuid))
const { coords, request } = useGeolocation()
const { resolveError } = useApiError()
const globalLoading = useLoading()

const loja = ref<EstabelecimentoPublico | null>(null)
const servicos = ref<ServicoPublico[]>([])
const profissionais = ref<ProfissionalPublico[]>([])
const avaliacoes = ref<AvaliacoesPaginadas | null>(null)
const favorito = ref(false)
const error = ref<string | null>(null)
const modalProfissionais = ref(false)
const modalServicos = ref(false)

const tempoMedioMinutos = computed(() => {
  if (servicos.value.length === 0) return null
  const total = servicos.value.reduce((acc, s) => acc + (s.duracaoMinutosEstimada || 0), 0)
  return Math.round(total / servicos.value.length)
})

onMounted(async () => {
  error.value = null
  globalLoading.show({ message: 'Carregando loja...' })
  try {
    await request()
    const [detalhe, listaServicos, listaProfissionais, listaAvaliacoes] = await Promise.all([
      publicoService.obterEstabelecimento(publicGuid.value, {
        latitude: coords.value?.latitude,
        longitude: coords.value?.longitude,
      }),
      publicoService.listarServicosLoja(publicGuid.value).catch(() => []),
      publicoService.listarProfissionaisLoja(publicGuid.value).catch(() => []),
      avaliacaoService.listarEstabelecimento(publicGuid.value).catch(() => null),
    ])
    loja.value = detalhe
    servicos.value = listaServicos
    profissionais.value = listaProfissionais
    avaliacoes.value = listaAvaliacoes
  } catch (err) {
    error.value = resolveError(err, 'Não foi possível carregar a loja.')
  } finally {
    // Só some depois dos dados (ou erro) estarem prontos para a tela.
    globalLoading.hide()
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
  globalLoading.hide()
})
</script>

<template>
  <div class="loja-detalhe-page">
    <template v-if="loja">
      <div class="loja-detalhe-layout">
        <div class="loja-detalhe-layout__main">
          <LojaResumoPanel
            v-model:favorito="favorito"
            :loja="loja"
            :tempo-medio-minutos="tempoMedioMinutos"
          />

          <div class="loja-detalhe-atalhos">
            <button
              type="button"
              class="loja-detalhe-atalho"
              @click="modalProfissionais = true"
            >
              <span class="loja-detalhe-atalho__icon loja-detalhe-atalho__icon--users">
                <Users class="size-4" aria-hidden="true" />
              </span>
              <span class="loja-detalhe-atalho__text">
                <strong>Profissionais</strong>
                <small>{{ profissionais.length }} na equipe</small>
              </span>
              <ChevronRight class="loja-detalhe-atalho__chevron" aria-hidden="true" />
            </button>

            <button
              type="button"
              class="loja-detalhe-atalho"
              @click="modalServicos = true"
            >
              <span class="loja-detalhe-atalho__icon loja-detalhe-atalho__icon--scissors">
                <Scissors class="size-4" aria-hidden="true" />
              </span>
              <span class="loja-detalhe-atalho__text">
                <strong>Serviços</strong>
                <small>{{ servicos.length }} disponíveis</small>
              </span>
              <ChevronRight class="loja-detalhe-atalho__chevron" aria-hidden="true" />
            </button>
          </div>

          <div class="loja-detalhe-layout__hours-mobile">
            <LojaHorariosCard
              :aberto-agora="loja.abertoAgora"
              :horario-abertura="loja.horarioAbertura"
              :horario-fechamento="loja.horarioFechamento"
            />
          </div>

          <section
            v-if="avaliacoes && avaliacoes.resumo.totalAvaliacoes > 0"
            class="loja-detalhe-avaliacoes"
          >
            <header class="loja-detalhe-avaliacoes__head">
              <h2 class="loja-detalhe-avaliacoes__title">Avaliações dos clientes</h2>
            </header>
            <AvaliacaoResumoCard :resumo="avaliacoes.resumo" />
            <AvaliacaoComentariosLista :itens="avaliacoes.itens" />
          </section>
        </div>

        <aside class="loja-detalhe-layout__aside">
          <LojaHorariosCard
            :aberto-agora="loja.abertoAgora"
            :horario-abertura="loja.horarioAbertura"
            :horario-fechamento="loja.horarioFechamento"
          />
        </aside>
      </div>

      <div class="loja-detalhe-sticky-cta">
        <RouterLink :to="lojaAgendarPath(loja.publicGuid)" class="loja-detalhe-sticky-cta__btn">
          <CalendarDays class="size-4" aria-hidden="true" />
          Continuar agendamento
        </RouterLink>
      </div>

      <LojaProfissionaisModal
        v-model="modalProfissionais"
        :profissionais="profissionais"
        :loja-nome="loja.nome"
      />
      <LojaServicosModal
        v-model="modalServicos"
        :servicos="servicos"
        :loja-nome="loja.nome"
      />
    </template>

    <BaseAlert v-else-if="error" variant="error">{{ error }}</BaseAlert>
  </div>
</template>

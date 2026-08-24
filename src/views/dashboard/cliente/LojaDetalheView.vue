<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { ArrowRight, ChevronRight, CalendarDays, Clock3, Scissors, Users } from 'lucide-vue-next'
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
import { forceUnlockBodyScroll } from '@/utils/bodyScrollLock'
import { lojaAgendarPath } from '@/constants/routes'
import { formatPrecoFigma } from '@/utils/formatters'
import type { EstabelecimentoPublico } from '@/types/estabelecimento.types'
import type { ProfissionalPublico, ServicoPublico } from '@/types/agendamento.types'
import type { AvaliacoesPaginadas } from '@/types/avaliacao.types'

const route = useRoute()
const publicGuid = computed(() => String(route.params.publicGuid))
const { request } = useGeolocation()
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

const servicosDestaque = computed(() => servicos.value.slice(0, 3))

function precoServico(servico: ServicoPublico) {
  if (servico.precoMinimo === servico.precoMaximo) return formatPrecoFigma(servico.precoMinimo)
  return `A partir de ${formatPrecoFigma(servico.precoMinimo)}`
}

onMounted(async () => {
  error.value = null
  globalLoading.show({ message: 'Carregando loja...' })
  try {
    const [detalhe, listaServicos, listaProfissionais, listaAvaliacoes] = await Promise.all([
      publicoService.obterEstabelecimento(publicGuid.value),
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
    globalLoading.hide()
  }

  // Localização enriquece a distância, mas nunca deve bloquear a vitrine.
  void request({ waitMs: 6_000, minSamples: 1 }).then(async (position) => {
    if (!position || !loja.value) return
    try {
      loja.value = await publicoService.obterEstabelecimento(publicGuid.value, {
        latitude: position.latitude,
        longitude: position.longitude,
      })
    } catch {
      // Mantém os dados já exibidos caso a atualização de distância falhe.
    }
  })
})

onUnmounted(() => {
  forceUnlockBodyScroll()
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

          <section class="loja-detalhe-escolha" aria-labelledby="loja-escolha-title">
            <header class="loja-detalhe-escolha__head">
              <div>
                <p class="loja-detalhe-escolha__eyebrow">Explore antes de agendar</p>
                <h2 id="loja-escolha-title" class="loja-detalhe-escolha__title">
                  O que você deseja conhecer?
                </h2>
              </div>
              <p class="loja-detalhe-escolha__hint">Consulte opções, valores e especialistas.</p>
            </header>

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
          </section>

          <section v-if="servicosDestaque.length" class="loja-detalhe-servicos-destaque">
            <header class="loja-detalhe-section-head">
              <div>
                <p class="loja-detalhe-escolha__eyebrow">Valores transparentes</p>
                <h2 class="loja-detalhe-escolha__title">Serviços mais procurados</h2>
              </div>
              <button type="button" class="loja-detalhe-section-link" @click="modalServicos = true">
                Ver todos
                <ArrowRight class="size-3.5" aria-hidden="true" />
              </button>
            </header>

            <div class="loja-detalhe-servicos-destaque__list">
              <article
                v-for="servico in servicosDestaque"
                :key="servico.id"
                class="loja-detalhe-servico-preview"
              >
                <span class="loja-detalhe-servico-preview__icon">
                  <Scissors class="size-4" aria-hidden="true" />
                </span>
                <div class="loja-detalhe-servico-preview__body">
                  <h3>{{ servico.nome }}</h3>
                  <p v-if="servico.descricao">{{ servico.descricao }}</p>
                  <span class="loja-detalhe-servico-preview__duration">
                    <Clock3 class="size-3.5" aria-hidden="true" />
                    {{ servico.duracaoMinutosEstimada }} min
                  </span>
                </div>
                <div class="loja-detalhe-servico-preview__action">
                  <strong>{{ precoServico(servico) }}</strong>
                  <RouterLink :to="lojaAgendarPath(loja.publicGuid)">Agendar</RouterLink>
                </div>
              </article>
            </div>
          </section>

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
          Agendar um horário
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

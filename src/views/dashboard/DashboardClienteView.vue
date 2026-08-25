<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { CalendarCheck, CalendarDays, Heart, Repeat2, Store, Wallet } from 'lucide-vue-next'
import { useDashboardClienteData } from '@/composables/useDashboardClienteData'
import { useUserStore } from '@/stores/user.store'
import { ROUTE_PATHS, agendamentoDetalhePath, lojaAgendarPath } from '@/constants/routes'
import { favoritoService } from '@/services/favoritoService'
import type { FavoritoCliente } from '@/types/favorito.types'
import { formatCurrency } from '@/utils/formatters'
import { mensagemBoasVindas } from '@/utils/dashboardClienteUtils'
import ClienteDashHeader from '@/components/dashboard/cliente/ClienteDashHeader.vue'
import ClienteDashSection from '@/components/dashboard/cliente/ClienteDashSection.vue'
import NextAppointmentCard from '@/components/dashboard/cliente/NextAppointmentCard.vue'
import StatsGrid, { type ClienteStat } from '@/components/dashboard/cliente/StatsGrid.vue'
import HistoryTimeline from '@/components/dashboard/cliente/HistoryTimeline.vue'
import RelationshipInsights from '@/components/dashboard/cliente/RelationshipInsights.vue'

const router = useRouter()
const userStore = useUserStore()
const { profile } = storeToRefs(userStore)

const {
  loading,
  totalGastoMes,
  variacaoGastoMes,
  atendimentosMes,
  proximoAgendamento,
  historicoTimeline,
  relacionamento,
  load,
} = useDashboardClienteData()

const primeiroNome = computed(() => profile.value?.nome?.split(' ')[0] ?? 'Cliente')
const welcome = computed(() => mensagemBoasVindas(primeiroNome.value, proximoAgendamento.value))
const headerChip = computed(() => (proximoAgendamento.value ? '1 próximo' : null))
const favoritos = ref<FavoritoCliente[]>([])
const favoritosLoading = ref(false)

const stats = computed<ClienteStat[]>(() => {
  const trend = variacaoGastoMes.value
  const trendHint: string | null =
    typeof trend === 'number' && Number.isFinite(trend) && trend !== 0
      ? `${trend > 0 ? '+' : ''}${Math.round(trend)}%`
      : null

  const freq = relacionamento.value.frequenciaMediaDias

  return [
    {
      id: 'gasto-mes',
      label: 'Gasto no mês',
      value: formatCurrency(totalGastoMes.value),
      icon: Wallet,
      iconClass: 'bg-glow-gold-cta/15 text-glow-gold-cta',
      hint: trendHint,
    },
    {
      id: 'agendamentos-mes',
      label: 'Atendimentos no mês',
      value: String(atendimentosMes.value),
      icon: CalendarCheck,
      iconClass: 'bg-glow-info-bg text-glow-info',
      hint: null,
    },
    {
      id: 'visitas',
      label: 'Visitas acumuladas',
      value: String(relacionamento.value.totalAtendimentos),
      icon: Store,
      iconClass: 'bg-glow-success-bg text-glow-success-dark',
      hint: null,
    },
    {
      id: 'frequencia',
      label: 'Frequência média',
      value: freq != null ? `${freq} dias` : '—',
      icon: Repeat2,
      iconClass: 'bg-glow-surface-tint text-glow-text-subtle',
      hint: null,
    },
  ]
})

function abrirLoja(publicGuid: string) {
  router.push(`/loja/${publicGuid}`)
}

function verAgendamento(id: number) {
  router.push(agendamentoDetalhePath(id))
}

async function loadFavoritos() {
  favoritosLoading.value = true
  try {
    favoritos.value = await favoritoService.listar()
  } catch {
    favoritos.value = []
  } finally {
    favoritosLoading.value = false
  }
}

onMounted(() => {
  void load()
  void loadFavoritos()
})
</script>

<template>
  <div class="cliente-dash flex w-full flex-col gap-5">
    <ClienteDashHeader
      :titulo="welcome.titulo"
      :subtitulo="welcome.subtitulo"
      :chip="headerChip"
      :loading="loading"
    />

    <ClienteDashSection
      title="Indicadores"
      description="Resumo do seu relacionamento neste mês e no acumulado"
    >
      <StatsGrid :items="stats" :loading="loading" />
    </ClienteDashSection>

    <ClienteDashSection
      title="Favoritos"
      description="Agende novamente com suas lojas e profissionais preferidos"
    >
      <div v-if="favoritosLoading" class="dashboard-favorite-grid">
        <div v-for="n in 3" :key="n" class="dashboard-favorite-card dashboard-favorite-card--static animate-pulse" />
      </div>
      <div v-else-if="favoritos.length" class="dashboard-favorite-grid">
        <article v-for="favorito in favoritos" :key="favorito.id" class="dashboard-favorite-card dashboard-favorite-card--static">
          <img
            v-if="favorito.profissionalLogo || favorito.estabelecimentoLogo"
            :src="favorito.profissionalLogo || favorito.estabelecimentoLogo"
            :alt="favorito.profissionalNome || favorito.estabelecimentoNome"
            class="dashboard-favorite-card__avatar"
          />
          <div class="min-w-0 flex-1">
            <p class="dashboard-favorite-card__name">{{ favorito.profissionalNome || favorito.estabelecimentoNome }}</p>
            <p class="dashboard-favorite-card__meta">
              {{ favorito.profissionalNome ? favorito.estabelecimentoNome : favorito.tipo === 'ProfissionalAutonomo' ? 'Profissional autônomo' : 'Loja' }}
            </p>
          </div>
          <button
            type="button"
            class="dashboard-favoritos__cta"
            @click="router.push(lojaAgendarPath(favorito.estabelecimentoPublicGuid, favorito.profissionalPublicGuid || undefined))"
          >
            <CalendarDays class="size-4" /> Agendar
          </button>
        </article>
      </div>
      <button v-else type="button" class="dashboard-favorite-card dashboard-favorite-card--static w-full" @click="router.push(ROUTE_PATHS.EXPLORAR)">
        <Heart class="size-5 text-glow-gold-cta" />
        <span>Explore e marque lojas ou profissionais como favoritos.</span>
      </button>
    </ClienteDashSection>

    <div class="grid gap-5 lg:grid-cols-2 lg:items-stretch">
      <NextAppointmentCard
        class="h-full min-w-0"
        :agendamento="proximoAgendamento"
        :loading="loading"
        @ver-detalhe="verAgendamento"
        @explorar="router.push(ROUTE_PATHS.EXPLORAR)"
      />

      <RelationshipInsights
        class="h-full min-w-0"
        :data="relacionamento"
        :loading="loading"
        @abrir-loja="abrirLoja"
      />
    </div>

    <HistoryTimeline
      :groups="historicoTimeline"
      :loading="loading"
      @ver-todos="router.push(ROUTE_PATHS.MEUS_AGENDAMENTOS)"
      @explorar="router.push(ROUTE_PATHS.EXPLORAR)"
    />
  </div>
</template>

<style scoped>
.cliente-dash {
  padding: 4px 0 28px;
}
</style>

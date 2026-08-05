<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Calendar, CalendarCheck, Heart, Store, User, Wallet } from 'lucide-vue-next'
import { useDashboardClienteData } from '@/composables/useDashboardClienteData'
import { useUserStore } from '@/stores/user.store'
import { ROUTE_PATHS, agendamentoDetalhePath } from '@/constants/routes'
import { formatCurrency } from '@/utils/formatters'
import { mensagemBoasVindas } from '@/utils/dashboardClienteUtils'
import DashboardHero from '@/components/dashboard/cliente/DashboardHero.vue'
import NextAppointmentCard from '@/components/dashboard/cliente/NextAppointmentCard.vue'
import StatsGrid, { type ClienteStat } from '@/components/dashboard/cliente/StatsGrid.vue'
import ProfileCompletion from '@/components/dashboard/cliente/ProfileCompletion.vue'
import QuickActions, { type ClienteQuickAction } from '@/components/dashboard/cliente/QuickActions.vue'
import RecommendationsCarousel from '@/components/dashboard/cliente/RecommendationsCarousel.vue'
import HistoryTimeline from '@/components/dashboard/cliente/HistoryTimeline.vue'
import FavoriteProfessionals from '@/components/dashboard/cliente/FavoriteProfessionals.vue'
import PromotionBanner from '@/components/dashboard/cliente/PromotionBanner.vue'

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
  lojasFavoritas,
  profissionaisFavoritos,
  recomendados,
  progressoPerfil,
  load,
} = useDashboardClienteData()

const primeiroNome = computed(() => profile.value?.nome?.split(' ')[0] ?? 'Cliente')
const welcome = computed(() => mensagemBoasVindas(primeiroNome.value, proximoAgendamento.value))
const totalFavoritos = computed(
  () => lojasFavoritas.value.length + profissionaisFavoritos.value.length,
)

const stats = computed<ClienteStat[]>(() => {
  const trend = variacaoGastoMes.value
  const trendHint: string | null =
    typeof trend === 'number' && Number.isFinite(trend) && trend > 0
      ? `${Math.round(trend)}%`
      : null
  return [
    {
      id: 'gasto',
      label: 'Gasto no mês',
      value: formatCurrency(totalGastoMes.value),
      icon: Wallet,
      iconClass: 'bg-glow-gold-cta/15 text-glow-gold-cta',
      hint: trendHint,
    },
    {
      id: 'atendimentos',
      label: 'Agendamentos no mês',
      value: String(atendimentosMes.value),
      icon: CalendarCheck,
      iconClass: 'bg-blue-100 text-blue-600',
      hint: null,
    },
    {
      id: 'favoritos',
      label: 'Favoritos',
      value: String(totalFavoritos.value),
      icon: Heart,
      iconClass: 'bg-rose-100 text-rose-500',
      hint: null,
    },
  ]
})

const acoes = computed<ClienteQuickAction[]>(() => [
  { id: 'explorar', label: 'Explorar lojas', description: 'Descubra novos profissionais', icon: Store },
  { id: 'agendamentos', label: 'Meus agendamentos', description: 'Veja seus horários', icon: Calendar },
  { id: 'perfil', label: 'Meu perfil', description: 'Atualize seus dados', icon: User },
])

function onAcao(id: string) {
  if (id === 'explorar') router.push(ROUTE_PATHS.EXPLORAR)
  else if (id === 'agendamentos') router.push(ROUTE_PATHS.MEUS_AGENDAMENTOS)
  else if (id === 'perfil') router.push(ROUTE_PATHS.PERFIL)
}

function abrirLoja(publicGuid: string) {
  router.push(`/loja/${publicGuid}`)
}

function verAgendamento(id: number) {
  router.push(agendamentoDetalhePath(id))
}

onMounted(() => void load())
</script>

<template>
  <div class="cliente-dash mx-auto max-w-[1200px]">
    <!-- Hero -->
    <DashboardHero
      :titulo="welcome.titulo"
      :subtitulo="welcome.subtitulo"
      :loading="loading"
      @explorar="router.push(ROUTE_PATHS.EXPLORAR)"
    />

    <!-- Próximo agendamento + Perfil (mesma altura) -->
    <div class="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12">
      <div class="lg:col-span-8">
        <NextAppointmentCard
          :agendamento="proximoAgendamento"
          :loading="loading"
          @ver-detalhe="verAgendamento"
          @explorar="router.push(ROUTE_PATHS.EXPLORAR)"
        />
      </div>
      <div class="lg:col-span-4">
        <ProfileCompletion
          :progresso-perfil="progressoPerfil"
          :profile="profile"
          :loading="loading"
          @completar-perfil="router.push(ROUTE_PATHS.PERFIL)"
        />
      </div>
    </div>

    <!-- Estatísticas -->
    <div class="mt-6">
      <StatsGrid :items="stats" :loading="loading" />
    </div>

    <!-- Acesso rápido -->
    <div class="mt-6">
      <QuickActions :actions="acoes" @action="onAcao" />
    </div>

    <!-- Recomendações -->
    <div class="mt-6">
      <RecommendationsCarousel
        :items="recomendados"
        :loading="loading"
        @agendar="abrirLoja"
        @explorar="router.push(ROUTE_PATHS.EXPLORAR)"
      />
    </div>

    <!-- Histórico + Favoritos (mesma altura) -->
    <div class="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12">
      <div class="lg:col-span-7">
        <HistoryTimeline
          :groups="historicoTimeline"
          :loading="loading"
          @ver-todos="router.push(ROUTE_PATHS.MEUS_AGENDAMENTOS)"
          @explorar="router.push(ROUTE_PATHS.EXPLORAR)"
        />
      </div>
      <div class="lg:col-span-5">
        <FavoriteProfessionals
          :lojas="lojasFavoritas"
          :profissionais="profissionaisFavoritos"
          :loading="loading"
          @abrir-loja="abrirLoja"
          @explorar="router.push(ROUTE_PATHS.EXPLORAR)"
        />
      </div>
    </div>

    <!-- CTA -->
    <div class="mt-6">
      <PromotionBanner @explorar="router.push(ROUTE_PATHS.EXPLORAR)" />
    </div>
  </div>
</template>

<style scoped>
.cliente-dash {
  padding: 4px 0 24px;
}
</style>
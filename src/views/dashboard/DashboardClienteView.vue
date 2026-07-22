<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import DashboardQuickActions from '@/components/dashboard/DashboardQuickActions.vue'
import DashboardClienteWelcome from '@/components/dashboard/cliente/DashboardClienteWelcome.vue'
import DashboardProximoAgendamento from '@/components/dashboard/cliente/DashboardProximoAgendamento.vue'
import DashboardClienteStats from '@/components/dashboard/cliente/DashboardClienteStats.vue'
import DashboardClienteProgress from '@/components/dashboard/cliente/DashboardClienteProgress.vue'
import DashboardRecomendados from '@/components/dashboard/cliente/DashboardRecomendados.vue'
import DashboardClienteTimeline from '@/components/dashboard/cliente/DashboardClienteTimeline.vue'
import DashboardClienteNovidades from '@/components/dashboard/cliente/DashboardClienteNovidades.vue'
import DashboardClienteFavoritos from '@/components/dashboard/cliente/DashboardClienteFavoritos.vue'
import { useDashboardClienteData } from '@/composables/useDashboardClienteData'
import { useUserStore } from '@/stores/user.store'
import { ROUTE_PATHS, agendamentoDetalhePath } from '@/constants/routes'
import { formatCurrency } from '@/utils/formatters'
import { mensagemBoasVindas } from '@/utils/dashboardClienteUtils'

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
  novidades,
  progressoPerfil,
  temAgendamentos,
  load,
} = useDashboardClienteData()

const acoes = [
  { id: 'explorar', label: 'Explorar lojas', description: 'Descubra novos profissionais', icon: 'store' as const },
  { id: 'agendamentos', label: 'Meus agendamentos', description: 'Veja seus horários', icon: 'calendar' as const },
  { id: 'perfil', label: 'Meu perfil', description: 'Atualize seus dados', icon: 'user' as const },
]

const primeiroNome = computed(() => profile.value?.nome?.split(' ')[0] ?? 'Cliente')

const welcome = computed(() =>
  mensagemBoasVindas(primeiroNome.value, proximoAgendamento.value),
)

const totalFavoritos = computed(
  () => lojasFavoritas.value.length + profissionaisFavoritos.value.length,
)

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
  <div class="dashboard-page dashboard-page--cliente dashboard-cliente-fade-in">
    <DashboardClienteWelcome
      :titulo="welcome.titulo"
      :subtitulo="welcome.subtitulo"
      :loading="loading"
    />

    <DashboardProximoAgendamento
      :agendamento="proximoAgendamento"
      :loading="loading"
      @explorar="router.push(ROUTE_PATHS.EXPLORAR)"
      @ver-detalhe="verAgendamento"
    />

    <DashboardClienteStats
      :gasto="formatCurrency(totalGastoMes)"
      :atendimentos="atendimentosMes"
      :favoritos="totalFavoritos"
      :trend="variacaoGastoMes"
      :loading="loading"
    />

    <DashboardClienteProgress
      :progresso-perfil="progressoPerfil"
      :tem-agendamentos="temAgendamentos"
      :loading="loading"
      @completar-perfil="router.push(ROUTE_PATHS.PERFIL)"
      @explorar="router.push(ROUTE_PATHS.EXPLORAR)"
    />

    <DashboardQuickActions
      title="Acesso rápido"
      variant="shortcuts"
      :actions="acoes"
      @action="onAcao"
    />

    <DashboardRecomendados
      :items="recomendados"
      :loading="loading"
      @explorar="router.push(ROUTE_PATHS.EXPLORAR)"
      @agendar="abrirLoja"
    />

    <DashboardClienteNovidades :items="novidades" :loading="loading" />

    <DashboardClienteTimeline
      :groups="historicoTimeline"
      :loading="loading"
      @ver-todos="router.push(ROUTE_PATHS.MEUS_AGENDAMENTOS)"
      @explorar="router.push(ROUTE_PATHS.EXPLORAR)"
    />

    <DashboardClienteFavoritos
      :lojas="lojasFavoritas"
      :profissionais="profissionaisFavoritos"
      :loading="loading"
      @explorar="router.push(ROUTE_PATHS.EXPLORAR)"
      @abrir-loja="abrirLoja"
    />
  </div>
</template>

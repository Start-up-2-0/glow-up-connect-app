<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader.vue'
import DashboardKpiCard from '@/components/dashboard/DashboardKpiCard.vue'
import DashboardQuickActions from '@/components/dashboard/DashboardQuickActions.vue'
import DashboardPanel from '@/components/dashboard/DashboardPanel.vue'
import { useDashboardClienteData } from '@/composables/useDashboardClienteData'
import { useUserStore } from '@/stores/user.store'
import { ROUTE_PATHS } from '@/constants/routes'
import { formatCurrency, formatDate } from '@/utils/formatters'
import AgendamentoStatusBadge from '@/components/cliente/AgendamentoStatusBadge.vue'

const router = useRouter()
const userStore = useUserStore()
const { profile } = storeToRefs(userStore)

const {
  loading,
  totalGastoMes,
  agendamentosRecentes,
  lojasFavoritas,
  profissionaisFavoritos,
  load,
} = useDashboardClienteData()

const acoes = [
  { id: 'explorar', label: 'Explorar lojas', description: 'Descubra novos estabelecimentos', icon: 'store' as const },
  { id: 'agendamentos', label: 'Meus agendamentos', description: 'Veja e gerencie seus horários', icon: 'calendar' as const },
  { id: 'perfil', label: 'Meu perfil', description: 'Atualize seus dados pessoais', icon: 'user' as const },
]

const greeting = computed(() => {
  const hora = new Date().getHours()
  if (hora < 12) return 'Bom dia'
  if (hora < 18) return 'Boa tarde'
  return 'Boa noite'
})

function onAcao(id: string) {
  if (id === 'explorar') router.push(ROUTE_PATHS.EXPLORAR)
  else if (id === 'agendamentos') router.push(ROUTE_PATHS.MEUS_AGENDAMENTOS)
  else if (id === 'perfil') router.push(ROUTE_PATHS.PERFIL)
}

function abrirLoja(publicGuid: string) {
  router.push(`/loja/${publicGuid}`)
}

onMounted(() => void load())
</script>

<template>
  <div class="dashboard-page">
    <DashboardPageHeader
      :greeting="`${greeting}, ${profile?.nome?.split(' ')[0] ?? 'Cliente'}`"
      title="Seu painel"
      subtitle="Acompanhe seus agendamentos e acesse rapidamente o que mais usa."
    />

    <div class="dashboard-kpi-grid dashboard-kpi-grid--hero">
      <DashboardKpiCard
        class="dashboard-kpi-grid__main"
        label="Gasto no mês"
        :value="formatCurrency(totalGastoMes)"
        hint="Total em agendamentos concluídos"
        icon="money"
        variant="gold"
        :loading="loading"
      />
      <DashboardKpiCard
        label="Agendamentos recentes"
        :value="String(agendamentosRecentes.length)"
        hint="Últimos registrados"
        icon="calendar"
        :loading="loading"
      />
    </div>

    <DashboardQuickActions title="Acessos rápidos" :actions="acoes" @action="onAcao" />

    <DashboardPanel
      title="Histórico recente"
      subtitle="Seus últimos agendamentos na plataforma"
      link-label="Ver todos"
      :loading="loading"
      :empty="!loading && agendamentosRecentes.length === 0"
      empty-title="Nenhum agendamento ainda"
      empty-description="Explore lojas próximas e agende seu primeiro serviço."
      @link="router.push(ROUTE_PATHS.MEUS_AGENDAMENTOS)"
    >
      <ul class="dashboard-activity-list">
        <li
          v-for="item in agendamentosRecentes"
          :key="item.id"
          class="dashboard-activity-list__row"
        >
          <div class="dashboard-activity-list__main">
            <p class="dashboard-activity-list__title">{{ item.estabelecimentoNome }}</p>
            <p class="dashboard-activity-list__meta">
              {{ formatDate(item.inicio) }} · {{ formatCurrency(item.valorTotal) }}
            </p>
          </div>
          <AgendamentoStatusBadge :status="item.status" />
        </li>
      </ul>
    </DashboardPanel>

    <div class="dashboard-two-col">
      <DashboardPanel
        title="Lojas favoritas"
        subtitle="Baseado nos seus agendamentos recentes"
        :loading="loading"
        :empty="!loading && lojasFavoritas.length === 0"
        empty-title="Nenhuma loja favorita"
        empty-description="Suas lojas mais visitadas aparecerão aqui."
      >
        <div class="dashboard-favorite-grid">
          <button
            v-for="loja in lojasFavoritas"
            :key="loja.id"
            type="button"
            class="dashboard-favorite-card"
            @click="abrirLoja(loja.publicGuid)"
          >
            <span class="dashboard-favorite-card__avatar">{{ loja.nome.charAt(0) }}</span>
            <span class="dashboard-favorite-card__name">{{ loja.nome }}</span>
            <span class="dashboard-favorite-card__meta">{{ loja.visitas }} visita(s)</span>
          </button>
        </div>
      </DashboardPanel>

      <DashboardPanel
        title="Profissionais favoritos"
        subtitle="Quem você mais agenda"
        :loading="loading"
        :empty="!loading && profissionaisFavoritos.length === 0"
        empty-title="Nenhum profissional favorito"
        empty-description="Profissionais dos seus agendamentos aparecerão aqui."
      >
        <div class="dashboard-favorite-grid">
          <div
            v-for="prof in profissionaisFavoritos"
            :key="prof.id"
            class="dashboard-favorite-card dashboard-favorite-card--static"
          >
            <span class="dashboard-favorite-card__avatar">{{ prof.nome.charAt(0) }}</span>
            <span class="dashboard-favorite-card__name">{{ prof.nome }}</span>
            <span class="dashboard-favorite-card__meta">{{ prof.estabelecimentoNome }}</span>
          </div>
        </div>
      </DashboardPanel>
    </div>
  </div>
</template>

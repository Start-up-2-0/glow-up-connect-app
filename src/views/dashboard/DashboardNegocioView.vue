<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import TrialStatusBanner from '@/components/assinatura/TrialStatusBanner.vue'
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader.vue'
import DashboardKpiCard from '@/components/dashboard/DashboardKpiCard.vue'
import DashboardQuickActions from '@/components/dashboard/DashboardQuickActions.vue'
import DashboardPanel from '@/components/dashboard/DashboardPanel.vue'
import { useDashboardNegocioData } from '@/composables/useDashboardNegocioData'
import { useDashboardRole } from '@/composables/useDashboardRole'
import { useNegocioStore } from '@/stores/negocio.store'
import { useAssinaturaStore } from '@/stores/assinatura.store'
import { ROUTE_PATHS } from '@/constants/routes'
import { formatCurrency, formatDate, formatTime } from '@/utils/formatters'
import AgendamentoStatusBadge from '@/components/cliente/AgendamentoStatusBadge.vue'

const router = useRouter()
const negocioStore = useNegocioStore()
const assinaturaStore = useAssinaturaStore()
const { roleExibicao } = useDashboardRole()

const {
  estabelecimentoAtivo,
  assinaturaAtiva,
  emTrial,
  diasTrial,
  proximaDataVencimento,
  planoNome,
} = storeToRefs(negocioStore)
const { assinatura } = storeToRefs(assinaturaStore)

const {
  loading,
  totalGanhoMes,
  agendamentosHoje,
  clientesAtivos,
  servicosAtivos,
  profissionais,
  ultimosAtendimentos,
  avaliacaoResumo,
  load,
} = useDashboardNegocioData()

const acoes = computed(() => [
  { id: 'agenda', label: 'Agenda', description: 'Veja os horários do dia', icon: 'calendar' as const },
  { id: 'financeiro', label: 'Financeiro', description: 'Acompanhe receitas e despesas', icon: 'money' as const },
  { id: 'equipe', label: 'Equipe', description: 'Gerencie profissionais', icon: 'users' as const },
  { id: 'clientes', label: 'Clientes', description: 'Base de clientes da loja', icon: 'user' as const },
])

async function carregar() {
  if (!estabelecimentoAtivo.value) return
  await load(estabelecimentoAtivo.value.estabelecimentoId)
  if (estabelecimentoAtivo.value.assinaturaId) {
    try {
      await assinaturaStore.fetchAtual(estabelecimentoAtivo.value.estabelecimentoId)
    } catch {
      // fallback nos dados do contexto
    }
  }
}

function onAcao(id: string) {
  const map: Record<string, string> = {
    agenda: ROUTE_PATHS.AGENDA,
    financeiro: ROUTE_PATHS.FINANCEIRO,
    equipe: ROUTE_PATHS.CONFIG_EQUIPE,
    clientes: ROUTE_PATHS.CONFIG_CLIENTES,
  }
  if (map[id]) router.push(map[id])
}

onMounted(() => void carregar())

watch(
  () => estabelecimentoAtivo.value?.estabelecimentoId,
  () => void carregar(),
)
</script>

<template>
  <div class="dashboard-page">
    <DashboardPageHeader
      :title="estabelecimentoAtivo?.nome ?? 'Painel do negócio'"
      :subtitle="`Visão geral da operação · ${roleExibicao}${planoNome ? ` · ${planoNome}` : ''}`"
    >
      <template #actions>
        <BaseButton @click="router.push(ROUTE_PATHS.AGENDA)">Ver agenda</BaseButton>
      </template>
    </DashboardPageHeader>

    <TrialStatusBanner
      v-if="
        (assinatura?.emTrial || emTrial) &&
        (assinatura?.proximaDataVencimento || proximaDataVencimento)
      "
      :dias-trial="assinatura?.diasTrial ?? diasTrial ?? 30"
      :proxima-data-vencimento="assinatura?.proximaDataVencimento ?? proximaDataVencimento ?? ''"
    />

    <div
      v-if="estabelecimentoAtivo && !assinaturaAtiva"
      class="dashboard-alert"
    >
      <p class="dashboard-alert__title">Assinatura pendente</p>
      <p class="dashboard-alert__desc">Conclua o pagamento para liberar todos os módulos.</p>
      <RouterLink :to="ROUTE_PATHS.CONFIG_ASSINATURA">
        <BaseButton variant="primary" size="sm">Gerenciar assinatura</BaseButton>
      </RouterLink>
    </div>

    <div class="dashboard-kpi-grid dashboard-kpi-grid--hero">
      <DashboardKpiCard
        class="dashboard-kpi-grid__main"
        label="Ganho no mês"
        :value="formatCurrency(totalGanhoMes)"
        hint="Entradas registradas no período"
        icon="money"
        variant="gold"
        :loading="loading"
      />
      <DashboardKpiCard
        label="Agendamentos hoje"
        :value="String(agendamentosHoje)"
        icon="calendar"
        :loading="loading"
      />
      <DashboardKpiCard
        label="Clientes"
        :value="String(clientesAtivos)"
        icon="users"
        :loading="loading"
      />
      <DashboardKpiCard
        label="Serviços ativos"
        :value="String(servicosAtivos)"
        icon="scissors"
        :loading="loading"
      />
    </div>

    <div v-if="avaliacaoResumo" class="dashboard-inline-stats">
      <span class="dashboard-inline-stats__item">
        Avaliação média: <strong>{{ avaliacaoResumo.notaMedia.toFixed(1) }}</strong>
      </span>
      <span class="dashboard-inline-stats__divider" />
      <span class="dashboard-inline-stats__item">
        Total de avaliações: <strong>{{ avaliacaoResumo.totalAvaliacoes }}</strong>
      </span>
    </div>

    <DashboardQuickActions title="Ações rápidas" :actions="acoes" @action="onAcao" />

    <div class="dashboard-two-col">
      <DashboardPanel
        title="Profissionais"
        subtitle="Equipe vinculada ao estabelecimento"
        link-label="Gerenciar"
        :loading="loading"
        :empty="!loading && profissionais.length === 0"
        empty-title="Nenhum profissional"
        empty-description="Convide profissionais para começar a receber agendamentos."
        @link="router.push(ROUTE_PATHS.CONFIG_EQUIPE)"
      >
        <ul class="dashboard-team-list">
          <li v-for="prof in profissionais" :key="prof.id" class="dashboard-team-list__row">
            <span class="dashboard-team-list__avatar">{{ prof.nomePublico.charAt(0) }}</span>
            <div>
              <p class="dashboard-team-list__name">{{ prof.nomePublico }}</p>
              <p class="dashboard-team-list__meta">
                {{ prof.podeReceberAgendamento ? 'Recebendo agendamentos' : 'Indisponível' }}
                <template v-if="prof.notaMedia"> · ★ {{ prof.notaMedia.toFixed(1) }}</template>
              </p>
            </div>
          </li>
        </ul>
      </DashboardPanel>

      <DashboardPanel
        title="Últimos atendimentos"
        subtitle="Movimentação recente da agenda"
        link-label="Ver agenda"
        :loading="loading"
        :empty="!loading && ultimosAtendimentos.length === 0"
        empty-title="Nenhum atendimento recente"
        empty-description="Os atendimentos realizados aparecerão aqui."
        @link="router.push(ROUTE_PATHS.AGENDA)"
      >
        <ul class="dashboard-activity-list">
          <li
            v-for="item in ultimosAtendimentos"
            :key="item.id"
            class="dashboard-activity-list__row"
          >
            <div class="dashboard-activity-list__main">
              <p class="dashboard-activity-list__title">{{ item.clienteNome }}</p>
              <p class="dashboard-activity-list__meta">
                {{ formatDate(item.inicio) }} {{ formatTime(item.inicio) }} · {{ formatCurrency(item.valorTotal) }}
              </p>
            </div>
            <AgendamentoStatusBadge :status="item.status" />
          </li>
        </ul>
      </DashboardPanel>
    </div>
  </div>
</template>

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
import DashboardRevenueHero from '@/components/dashboard/DashboardRevenueHero.vue'
import DashboardOperacionalResumo from '@/components/dashboard/DashboardOperacionalResumo.vue'
import DashboardInsights from '@/components/dashboard/DashboardInsights.vue'
import DashboardRevenueChart from '@/components/dashboard/DashboardRevenueChart.vue'
import DashboardServicosChart from '@/components/dashboard/DashboardServicosChart.vue'
import DashboardAgendaPreview from '@/components/dashboard/DashboardAgendaPreview.vue'
import DashboardIcon from '@/components/dashboard/DashboardIcon.vue'
import { useDashboardNegocioData } from '@/composables/useDashboardNegocioData'
import { useDashboardRole } from '@/composables/useDashboardRole'
import { useNegocioStore } from '@/stores/negocio.store'
import { useAssinaturaStore } from '@/stores/assinatura.store'
import { ROUTE_PATHS } from '@/constants/routes'
import { formatCurrency } from '@/utils/formatters'

const router = useRouter()
const negocioStore = useNegocioStore()
const assinaturaStore = useAssinaturaStore()
const { roleExibicao } = useDashboardRole()

const {
  estabelecimentoAtivo,
  assinaturaAtiva,
  assinaturaStatus,
  emTrial,
  diasTrial,
  proximaDataVencimento,
  planoNome,
} = storeToRefs(negocioStore)
const { assinatura } = storeToRefs(assinaturaStore)

const {
  loading,
  totalGanhoMes,
  totalGanhoHoje,
  variacaoReceitaMes,
  variacaoAgendamentos,
  agendamentosHoje,
  agendamentosOntem,
  agendamentosSemana,
  cancelamentosHoje,
  clientesAtivos,
  clientesAtendidosHoje,
  servicosAtivos,
  profissionais,
  avaliacaoResumo,
  receitaUltimos7Dias,
  receitaUltimos30Dias,
  distribuicaoServicos,
  agendaTimeline,
  taxaOcupacao,
  insights,
  load,
} = useDashboardNegocioData()

const headerMeta = computed(() => {
  const parts = [roleExibicao.value]
  if (planoNome.value) parts.unshift(planoNome.value)
  return parts.join(' · ')
})

const acoes = computed(() => [
  { id: 'agenda', label: 'Agenda', description: 'Ver horários', icon: 'calendar' as const },
  { id: 'financeiro', label: 'Financeiro', description: 'Fluxo de caixa', icon: 'money' as const },
  { id: 'equipe', label: 'Equipe', description: 'Profissionais', icon: 'users' as const },
  { id: 'clientes', label: 'Clientes', description: 'Cadastro', icon: 'user' as const },
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
  <div class="dashboard-page dashboard-page--negocio">
    <DashboardPageHeader
      compact
      :title="estabelecimentoAtivo?.nome ?? 'Painel do negócio'"
      :meta="headerMeta"
    >
      <template #actions>
        <BaseButton size="lg" @click="router.push(ROUTE_PATHS.AGENDA)">
          <DashboardIcon name="calendar" class="dashboard-header-btn-icon" />
          Ver agenda
        </BaseButton>
      </template>
    </DashboardPageHeader>

    <TrialStatusBanner
      v-if="
        (assinatura?.emTrial || emTrial) &&
        (assinatura?.proximaDataVencimento || proximaDataVencimento)
      "
      compact
      :plano-nome="planoNome ?? undefined"
      :dias-trial="assinatura?.diasTrial ?? diasTrial ?? 30"
      :proxima-data-vencimento="assinatura?.proximaDataVencimento ?? proximaDataVencimento ?? ''"
      :inicio="assinatura?.inicio"
    />

    <div
      v-if="estabelecimentoAtivo && assinaturaStatus === 'PendentePagamento'"
      class="dashboard-alert"
    >
      <p class="dashboard-alert__title">Pagamento pendente</p>
      <p class="dashboard-alert__desc">Conclua o pagamento para liberar todos os módulos.</p>
      <RouterLink :to="ROUTE_PATHS.CONFIG_ASSINATURA">
        <BaseButton variant="primary" size="sm">Gerenciar assinatura</BaseButton>
      </RouterLink>
    </div>

    <div
      v-else-if="estabelecimentoAtivo && assinaturaStatus === 'CancelamentoAgendado'"
      class="dashboard-alert dashboard-alert--info"
    >
      <p class="dashboard-alert__title">Cancelamento agendado</p>
      <p class="dashboard-alert__desc">
        Você mantém acesso ao plano até o fim do período contratado.
      </p>
      <RouterLink :to="ROUTE_PATHS.CONFIG_ASSINATURA">
        <BaseButton variant="secondary" size="sm">Ver detalhes</BaseButton>
      </RouterLink>
    </div>

    <div
      v-else-if="estabelecimentoAtivo && !assinaturaAtiva"
      class="dashboard-alert"
    >
      <p class="dashboard-alert__title">Assinatura inativa</p>
      <p class="dashboard-alert__desc">Reative sua assinatura para voltar a usar todos os recursos.</p>
      <RouterLink :to="ROUTE_PATHS.ASSINATURA_DESPEDIDA">
        <BaseButton variant="primary" size="sm">Reativar assinatura</BaseButton>
      </RouterLink>
    </div>

    <DashboardOperacionalResumo
      :receita-hoje="formatCurrency(totalGanhoHoje)"
      :agendamentos="agendamentosHoje"
      :clientes="clientesAtendidosHoje"
      :cancelamentos="cancelamentosHoje"
      :ocupacao="taxaOcupacao != null ? `${taxaOcupacao}%` : '—'"
      :loading="loading"
    />

    <div class="dashboard-exec-grid">
      <DashboardRevenueHero
        class="dashboard-exec-grid__revenue"
        :value="formatCurrency(totalGanhoMes)"
        :trend="variacaoReceitaMes"
        trend-label="Comparado ao mês passado"
        :sparkline="receitaUltimos7Dias"
        :loading="loading"
      />

      <DashboardKpiCard
        label="Agenda hoje"
        :value="String(agendamentosHoje)"
        icon="calendar"
        color="blue"
        :trend="variacaoAgendamentos"
        trend-label="vs ontem"
        :sub-stats="[
          { label: 'Ontem', value: String(agendamentosOntem) },
          { label: 'Semana', value: String(agendamentosSemana) },
        ]"
        :loading="loading"
      />

      <DashboardKpiCard
        label="Clientes"
        :value="String(clientesAtivos)"
        icon="users"
        color="purple"
        hint="Base cadastrada na loja"
        :loading="loading"
      />

      <DashboardKpiCard
        label="Serviços ativos"
        :value="String(servicosAtivos)"
        icon="scissors"
        color="yellow"
        :loading="loading"
      />

      <DashboardKpiCard
        label="Equipe"
        :value="String(profissionais.length)"
        icon="users"
        color="orange"
        hint="Profissionais ativos"
        :loading="loading"
      />

      <DashboardKpiCard
        class="dashboard-exec-grid__rating"
        label="Avaliação"
        :value="avaliacaoResumo ? avaliacaoResumo.notaMedia.toFixed(1) : '0.0'"
        icon="star"
        color="gold"
        :rating="avaliacaoResumo ? { nota: avaliacaoResumo.notaMedia, total: avaliacaoResumo.totalAvaliacoes } : { nota: 0, total: 0 }"
        :loading="loading"
      />
    </div>

    <DashboardInsights :insights="insights" :loading="loading" />

    <div class="dashboard-charts-grid">
      <DashboardRevenueChart :data="receitaUltimos30Dias" :loading="loading" />
      <DashboardServicosChart :data="distribuicaoServicos" :loading="loading" />
    </div>

    <DashboardQuickActions
      title="Ações rápidas"
      variant="shortcuts"
      :actions="acoes"
      @action="onAcao"
    />

    <div class="dashboard-two-col">
      <DashboardPanel
        title="Profissionais"
        subtitle="Desempenho da equipe hoje"
        link-label="Gerenciar"
        :loading="loading"
        :empty="!loading && profissionais.length === 0"
        empty-title="Nenhum profissional"
        empty-description="Convide profissionais para começar a receber agendamentos."
        @link="router.push(ROUTE_PATHS.CONFIG_EQUIPE)"
      >
        <ul class="dashboard-team-list dashboard-team-list--rich">
          <li v-for="prof in profissionais" :key="prof.id" class="dashboard-team-list__row dashboard-team-list__row--rich">
            <span
              class="dashboard-team-list__status"
              :class="prof.podeReceberAgendamento ? 'dashboard-team-list__status--online' : 'dashboard-team-list__status--offline'"
            />
            <span class="dashboard-team-list__avatar">{{ prof.nomePublico.charAt(0) }}</span>
            <div class="dashboard-team-list__body">
              <p class="dashboard-team-list__name">{{ prof.nomePublico }}</p>
              <p class="dashboard-team-list__meta">Profissional</p>
            </div>
            <div class="dashboard-team-list__stats">
              <p class="dashboard-team-list__stat">
                <span>Hoje</span>
                <strong>{{ prof.agendamentosHoje }} agendamento{{ prof.agendamentosHoje === 1 ? '' : 's' }}</strong>
              </p>
              <p v-if="prof.notaMedia" class="dashboard-team-list__rating">★ {{ prof.notaMedia.toFixed(1) }}</p>
            </div>
          </li>
        </ul>
      </DashboardPanel>

      <DashboardAgendaPreview
        :timeline="agendaTimeline"
        :loading="loading"
        @ver-agenda="router.push(ROUTE_PATHS.AGENDA)"
      />
    </div>
  </div>
</template>

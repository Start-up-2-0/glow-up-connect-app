<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import {
  CalendarCheck,
  Star,
  Users,
  Wallet,
  Ban,
  Scissors,
} from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'
import TrialStatusBanner from '@/components/assinatura/TrialStatusBanner.vue'
import ClienteDashHeader from '@/components/dashboard/cliente/ClienteDashHeader.vue'
import ClienteDashSection from '@/components/dashboard/cliente/ClienteDashSection.vue'
import StatsGrid, { type ClienteStat } from '@/components/dashboard/cliente/StatsGrid.vue'
import AgendaHojeCard from '@/components/dashboard/negocio/AgendaHojeCard.vue'
import OperacaoInsights from '@/components/dashboard/negocio/OperacaoInsights.vue'
import EquipeResumoCard from '@/components/dashboard/negocio/EquipeResumoCard.vue'
import HistoricoNegocioCard from '@/components/dashboard/negocio/HistoricoNegocioCard.vue'
import { useDashboardNegocioData } from '@/composables/useDashboardNegocioData'
import { useDashboardRole } from '@/composables/useDashboardRole'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useNegocioStore } from '@/stores/negocio.store'
import { useAssinaturaStore } from '@/stores/assinatura.store'
import { ROUTE_PATHS } from '@/constants/routes'
import { formatCurrency } from '@/utils/formatters'
import GlowGuideLauncher from '@/tutorials/components/GlowGuideLauncher.vue'
import { usePageTutorial } from '@/tutorials/hooks/usePageTutorial'

const { startPageTutorial } = usePageTutorial('dashboard')

const router = useRouter()
const negocioStore = useNegocioStore()
const assinaturaStore = useAssinaturaStore()
const { roleExibicao } = useDashboardRole()
const { possuiModulo, possuiPermissao } = useNegocioContext()

const {
  estabelecimentoAtivo,
  assinaturaAtiva,
  assinaturaStatus,
  emTrial,
  diasTrial,
  proximaDataVencimento,
  planoNome,
  ehProfissionalAutonomo,
} = storeToRefs(negocioStore)
const { assinatura } = storeToRefs(assinaturaStore)

const {
  loading,
  error,
  totalGanhoMes,
  totalGanhoHoje,
  variacaoReceitaMes,
  variacaoAgendamentos,
  agendamentosHoje,
  cancelamentosHoje,
  clientesAtivos,
  clientesAtendidosHoje,
  servicosAtivos,
  profissionais,
  ultimosAtendimentos,
  proximosAtendimentos,
  avaliacaoResumo,
  distribuicaoServicos,
  taxaOcupacao,
  load,
} = useDashboardNegocioData()

const podeVerFinanceiro = computed(
  () => possuiModulo('Financeiro') && possuiPermissao('CaixaVisualizar'),
)

const saudacao = computed(() => {
  const hora = new Date().getHours()
  return hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'
})

const primeiroNomeLoja = computed(
  () => estabelecimentoAtivo.value?.nome ?? 'sua loja',
)

const welcomeTitulo = computed(
  () => `${saudacao.value} em ${primeiroNomeLoja.value}`,
)

const welcomeSubtitulo = computed(() => {
  const papel = roleExibicao.value
  if (agendamentosHoje.value > 0) {
    return `${papel}: você tem ${agendamentosHoje.value} horário${agendamentosHoje.value === 1 ? '' : 's'} na agenda de hoje.`
  }
  return `${papel}: acompanhe a operação e o ritmo da loja neste painel.`
})

const headerChip = computed(() => {
  if (agendamentosHoje.value > 0) return `${agendamentosHoje.value} hoje`
  return planoNome.value || roleExibicao.value
})

const topServico = computed(() => distribuicaoServicos.value[0] ?? null)

const stats = computed<ClienteStat[]>(() => {
  const items: ClienteStat[] = []

  if (podeVerFinanceiro.value) {
    const trend = variacaoReceitaMes.value
    items.push({
      id: 'receita-mes',
      label: 'Receita no mês',
      value: formatCurrency(totalGanhoMes.value),
      icon: Wallet,
      iconClass: 'bg-glow-gold-cta/15 text-glow-gold-cta',
      hint:
        typeof trend === 'number' && Number.isFinite(trend) && trend !== 0
          ? `${trend > 0 ? '+' : ''}${Math.round(trend)}%`
          : null,
    })
  } else {
    items.push({
      id: 'cancelamentos',
      label: 'Cancelamentos hoje',
      value: String(cancelamentosHoje.value),
      icon: Ban,
      iconClass: 'bg-glow-surface-tint text-glow-text-subtle',
      hint: null,
    })
  }

  const varAgenda = variacaoAgendamentos.value
  items.push(
    {
      id: 'agenda-hoje',
      label: 'Agenda hoje',
      value: String(agendamentosHoje.value),
      icon: CalendarCheck,
      iconClass: 'bg-glow-info-bg text-glow-info',
      hint:
        typeof varAgenda === 'number' && Number.isFinite(varAgenda) && varAgenda !== 0
          ? `${varAgenda > 0 ? '+' : ''}${Math.round(varAgenda)}%`
          : null,
    },
    {
      id: 'clientes',
      label: 'Clientes ativos',
      value: String(clientesAtivos.value),
      icon: Users,
      iconClass: 'bg-glow-success-bg text-glow-success-dark',
      hint: null,
    },
  )

  if (avaliacaoResumo.value) {
    items.push({
      id: 'avaliacao',
      label: 'Avaliação',
      value: avaliacaoResumo.value.notaMedia.toFixed(1),
      icon: Star,
      iconClass: 'bg-amber-100 text-amber-600',
      hint: `${avaliacaoResumo.value.totalAvaliacoes} reviews`,
    })
  } else {
    items.push({
      id: 'servicos',
      label: 'Serviços ativos',
      value: String(servicosAtivos.value),
      icon: Scissors,
      iconClass: 'bg-glow-surface-tint text-glow-text-subtle',
      hint: null,
    })
  }

  return items
})

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

onMounted(() => void carregar())
watch(
  () => estabelecimentoAtivo.value?.estabelecimentoId,
  () => void carregar(),
)
</script>

<template>
  <div class="negocio-dash flex w-full flex-col gap-5" data-tour="dashboard-page">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0 flex-1">
        <ClienteDashHeader
          :titulo="welcomeTitulo"
          :subtitulo="welcomeSubtitulo"
          :chip="headerChip"
          :loading="loading"
        />
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <GlowGuideLauncher class="max-sm:hidden" @click="startPageTutorial" />
        <GlowGuideLauncher class="sm:hidden" compact @click="startPageTutorial" />
      </div>
    </div>

    <TrialStatusBanner
      v-if="
        (assinatura?.emTrial || emTrial) &&
        (assinatura?.proximaDataVencimento || proximaDataVencimento)
      "
      compact
      :plano-nome="planoNome ?? undefined"
      :dias-trial="assinatura?.diasTrial ?? diasTrial ?? 14"
      :proxima-data-vencimento="assinatura?.proximaDataVencimento ?? proximaDataVencimento ?? ''"
      :inicio="assinatura?.inicio"
      :percentual-desconto-permanente="assinatura?.percentualDescontoPermanente"
    />

    <div v-if="error" class="dash-alert dash-alert--error" role="alert">
      <div>
        <p class="font-urbanist text-[14px] font-semibold text-glow-text">Não foi possível atualizar o painel</p>
        <p class="font-urbanist text-[13px] text-glow-text-subtle">{{ error }}</p>
      </div>
      <BaseButton variant="secondary" size="sm" @click="carregar">Tentar novamente</BaseButton>
    </div>

    <div
      v-if="estabelecimentoAtivo && assinaturaStatus === 'PendentePagamento'"
      class="dash-alert"
    >
      <div>
        <p class="font-urbanist text-[14px] font-semibold text-glow-text">Pagamento pendente</p>
        <p class="font-urbanist text-[13px] text-glow-text-subtle">
          Conclua o pagamento para liberar todos os módulos.
        </p>
      </div>
      <RouterLink :to="ROUTE_PATHS.CONFIG_ASSINATURA">
        <BaseButton variant="primary" size="sm">Gerenciar assinatura</BaseButton>
      </RouterLink>
    </div>

    <div
      v-else-if="estabelecimentoAtivo && assinaturaStatus === 'CancelamentoAgendado'"
      class="dash-alert dash-alert--info"
    >
      <div>
        <p class="font-urbanist text-[14px] font-semibold text-glow-text">Cancelamento agendado</p>
        <p class="font-urbanist text-[13px] text-glow-text-subtle">
          Você mantém acesso ao plano até o fim do período contratado.
        </p>
      </div>
      <RouterLink :to="ROUTE_PATHS.CONFIG_ASSINATURA">
        <BaseButton variant="secondary" size="sm">Ver detalhes</BaseButton>
      </RouterLink>
    </div>

    <div
      v-else-if="estabelecimentoAtivo && !assinaturaAtiva"
      class="dash-alert"
    >
      <div>
        <p class="font-urbanist text-[14px] font-semibold text-glow-text">Assinatura inativa</p>
        <p class="font-urbanist text-[13px] text-glow-text-subtle">
          Reative sua assinatura para voltar a usar todos os recursos.
        </p>
      </div>
      <RouterLink :to="ROUTE_PATHS.ASSINATURA_DESPEDIDA">
        <BaseButton variant="primary" size="sm">Reativar assinatura</BaseButton>
      </RouterLink>
    </div>

    <ClienteDashSection
      title="Indicadores"
      description="Resumo operacional deste mês e do dia"
    >
      <StatsGrid :items="stats" :loading="loading" />
    </ClienteDashSection>

    <div class="grid gap-5 lg:grid-cols-2 lg:items-stretch">
      <AgendaHojeCard
        class="h-full min-w-0"
        :itens="proximosAtendimentos"
        :loading="loading"
        @ver-agenda="router.push(ROUTE_PATHS.AGENDA)"
        @ver-item="router.push(ROUTE_PATHS.AGENDA)"
      />

      <OperacaoInsights
        class="h-full min-w-0"
        :receita-hoje="totalGanhoHoje"
        :ocupacao="taxaOcupacao"
        :clientes-hoje="clientesAtendidosHoje"
        :cancelamentos="cancelamentosHoje"
        :avaliacao="avaliacaoResumo"
        :top-servico="topServico"
        :pode-ver-financeiro="podeVerFinanceiro"
        :loading="loading"
      />
    </div>

    <div class="grid gap-5 lg:grid-cols-2 lg:items-stretch">
      <EquipeResumoCard
        v-if="!ehProfissionalAutonomo"
        class="h-full min-w-0"
        :profissionais="profissionais"
        :loading="loading"
        @gerenciar="router.push(ROUTE_PATHS.CONFIG_EQUIPE)"
      />

      <HistoricoNegocioCard
        class="h-full min-w-0"
        :class="{ 'lg:col-span-2': ehProfissionalAutonomo }"
        :itens="ultimosAtendimentos"
        :loading="loading"
        @ver-todos="router.push(ROUTE_PATHS.AGENDA)"
      />
    </div>
  </div>
</template>

<style scoped>
.negocio-dash {
  padding: 4px 0 28px;
}
.dash-alert {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-radius: 16px;
  border: 1px solid color-mix(in srgb, var(--glow-danger, #dc2626) 25%, transparent);
  background: color-mix(in srgb, var(--glow-danger, #dc2626) 8%, var(--glow-surface));
  padding: 14px 16px;
}
.dash-alert--info {
  border-color: color-mix(in srgb, var(--glow-info, #2563eb) 25%, transparent);
  background: color-mix(in srgb, var(--glow-info, #2563eb) 8%, var(--glow-surface));
}
.dash-alert--error {
  border-color: color-mix(in srgb, var(--glow-danger, #dc2626) 34%, transparent);
  background: color-mix(in srgb, var(--glow-danger, #dc2626) 7%, var(--glow-surface));
}
</style>

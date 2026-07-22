<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import BaseButton from '@/components/ui/BaseButton.vue'
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader.vue'
import DashboardKpiCard from '@/components/dashboard/DashboardKpiCard.vue'
import DashboardQuickActions from '@/components/dashboard/DashboardQuickActions.vue'
import DashboardPanel from '@/components/dashboard/DashboardPanel.vue'
import { useDashboardProfissionalData } from '@/composables/useDashboardProfissionalData'
import { useAcessoUsuario } from '@/composables/useAcessoUsuario'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useNegocioStore } from '@/stores/negocio.store'
import { useUserStore } from '@/stores/user.store'
import { ROUTE_PATHS } from '@/constants/routes'
import { formatDate, formatTime } from '@/utils/formatters'
import AgendamentoStatusBadge from '@/components/cliente/AgendamentoStatusBadge.vue'

const router = useRouter()
const negocioStore = useNegocioStore()
const userStore = useUserStore()
const { linkAgendamentoPublico } = useAcessoUsuario()
const notifications = useNotificationsStore()
const { estabelecimentoAtivo } = storeToRefs(negocioStore)
const { profile } = storeToRefs(userStore)

const linkCopiado = ref(false)

const {
  loading,
  totalAtendimentos,
  ultimosAtendimentos,
  ultimasAvaliacoes,
  notaMedia,
  totalAvaliacoes,
  load,
} = useDashboardProfissionalData()

const acoes = [
  { id: 'agenda', label: 'Minha agenda', description: 'Horários marcados com você', icon: 'calendar' as const },
  { id: 'horarios', label: 'Meus horários', description: 'Configure sua disponibilidade', icon: 'clock' as const },
  { id: 'link', label: 'Copiar link', description: 'Compartilhe seu agendamento', icon: 'user' as const },
]

async function carregar() {
  const ativo = estabelecimentoAtivo.value
  if (!ativo) return
  await load(ativo.estabelecimentoId, ativo.profissionalId, profile.value?.nome)
}

function onAcao(id: string) {
  if (id === 'agenda') router.push(ROUTE_PATHS.AGENDA)
  else if (id === 'horarios') router.push(ROUTE_PATHS.CONFIG_HORARIOS)
  else if (id === 'link') void copiarLink()
}

async function copiarLink() {
  if (!linkAgendamentoPublico.value) return
  try {
    await navigator.clipboard.writeText(linkAgendamentoPublico.value)
    linkCopiado.value = true
    notifications.push('success', 'Link copiado!')
    window.setTimeout(() => { linkCopiado.value = false }, 2000)
  } catch {
    notifications.push('error', 'Não foi possível copiar o link.')
  }
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
      title="Seu painel profissional"
      :subtitle="`Acompanhe sua rotina em ${estabelecimentoAtivo?.nome ?? 'sua loja'}`"
    >
      <template #actions>
        <BaseButton variant="secondary" @click="router.push(ROUTE_PATHS.AGENDA)">
          Minha agenda
        </BaseButton>
      </template>
    </DashboardPageHeader>

    <div class="dashboard-kpi-grid dashboard-kpi-grid--hero">
      <DashboardKpiCard
        class="dashboard-kpi-grid__main"
        label="Atendimentos no mês"
        :value="String(totalAtendimentos)"
        hint="Total realizado no período"
        icon="calendar"
        variant="gold"
        :loading="loading"
      />
      <DashboardKpiCard
        label="Nota média"
        :value="notaMedia != null ? notaMedia.toFixed(1) : '—'"
        :hint="totalAvaliacoes ? `${totalAvaliacoes} avaliação(ões)` : 'Sem avaliações'"
        icon="star"
        :loading="loading"
      />
    </div>

    <DashboardQuickActions title="Ações rápidas" :actions="acoes" @action="onAcao" />

    <div v-if="linkAgendamentoPublico" class="dashboard-link-card">
      <p class="dashboard-link-card__label">Link de agendamento</p>
      <p class="dashboard-link-card__url">{{ linkAgendamentoPublico }}</p>
      <BaseButton variant="secondary" size="sm" @click="copiarLink">
        {{ linkCopiado ? 'Copiado!' : 'Copiar link' }}
      </BaseButton>
    </div>

    <div class="dashboard-two-col">
      <DashboardPanel
        title="Últimos atendimentos"
        subtitle="Sua rotina recente"
        link-label="Ver agenda"
        :loading="loading"
        :empty="!loading && ultimosAtendimentos.length === 0"
        empty-title="Nenhum atendimento recente"
        empty-description="Seus atendimentos aparecerão aqui conforme forem realizados."
        @link="router.push(ROUTE_PATHS.AGENDA)"
      >
        <ul class="dashboard-activity-list">
          <li
            v-for="item in ultimosAtendimentos"
            :key="item.agendamentoItemId"
            class="dashboard-activity-list__row"
          >
            <div class="dashboard-activity-list__main">
              <p class="dashboard-activity-list__title">{{ item.clienteNome }}</p>
              <p class="dashboard-activity-list__meta">
                {{ item.servicoNome }} · {{ formatDate(item.inicio) }} {{ formatTime(item.inicio) }}
              </p>
            </div>
            <AgendamentoStatusBadge :status="item.status" />
          </li>
        </ul>
      </DashboardPanel>

      <DashboardPanel
        title="Últimas avaliações"
        subtitle="Feedback dos seus clientes"
        :loading="loading"
        :empty="!loading && ultimasAvaliacoes.length === 0"
        empty-title="Nenhuma avaliação ainda"
        empty-description="As avaliações recebidas aparecerão aqui."
      >
        <ul class="dashboard-activity-list">
          <li
            v-for="av in ultimasAvaliacoes"
            :key="av.id"
            class="dashboard-activity-list__row dashboard-activity-list__row--stacked"
          >
            <div class="dashboard-activity-list__main">
              <p class="dashboard-activity-list__title">
                ★ {{ av.notaProfissional }} · {{ av.clienteNome }}
              </p>
              <p v-if="av.comentarioProfissional" class="dashboard-activity-list__meta">
                {{ av.comentarioProfissional }}
              </p>
              <p class="dashboard-activity-list__meta">{{ formatDate(av.avaliadoEm) }}</p>
            </div>
          </li>
        </ul>
      </DashboardPanel>
    </div>
  </div>
</template>

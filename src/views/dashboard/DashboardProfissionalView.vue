<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { CalendarCheck, Star, Clock3, MessageSquare } from 'lucide-vue-next'
import ClienteDashHeader from '@/components/dashboard/cliente/ClienteDashHeader.vue'
import ClienteDashSection from '@/components/dashboard/cliente/ClienteDashSection.vue'
import StatsGrid, { type ClienteStat } from '@/components/dashboard/cliente/StatsGrid.vue'
import ProximoAtendimentoCard from '@/components/dashboard/profissional/ProximoAtendimentoCard.vue'
import DesempenhoInsights from '@/components/dashboard/profissional/DesempenhoInsights.vue'
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

const {
  loading,
  totalAtendimentos,
  atendimentosHoje,
  ultimosAtendimentos,
  proximoAtendimento,
  ultimasAvaliacoes,
  notaMedia,
  totalAvaliacoes,
  load,
} = useDashboardProfissionalData()

const primeiroNome = computed(() => profile.value?.nome?.split(' ')[0] ?? 'Profissional')
const saudacao = computed(() => {
  const hora = new Date().getHours()
  return hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'
})

const welcomeTitulo = computed(() => `${saudacao.value}, ${primeiroNome.value}`)
const welcomeSubtitulo = computed(() => {
  const loja = estabelecimentoAtivo.value?.nome ?? 'sua loja'
  if (proximoAtendimento.value) {
    return `Seu próximo atendimento em ${loja} é às ${formatTime(proximoAtendimento.value.inicio)}.`
  }
  return `Acompanhe sua rotina e reputação em ${loja}.`
})

const headerChip = computed(() =>
  atendimentosHoje.value > 0 ? `${atendimentosHoje.value} hoje` : null,
)

const stats = computed<ClienteStat[]>(() => [
  {
    id: 'atendimentos',
    label: 'Atendimentos no mês',
    value: String(totalAtendimentos.value),
    icon: CalendarCheck,
    iconClass: 'bg-glow-gold-cta/15 text-glow-gold-cta',
    hint: null,
  },
  {
    id: 'hoje',
    label: 'Atendimentos hoje',
    value: String(atendimentosHoje.value),
    icon: Clock3,
    iconClass: 'bg-glow-info-bg text-glow-info',
    hint: null,
  },
  {
    id: 'nota',
    label: 'Nota média',
    value: notaMedia.value != null ? notaMedia.value.toFixed(1) : '—',
    icon: Star,
    iconClass: 'bg-amber-100 text-amber-600',
    hint: totalAvaliacoes.value ? `${totalAvaliacoes.value} reviews` : null,
  },
  {
    id: 'avaliacoes',
    label: 'Avaliações recentes',
    value: String(ultimasAvaliacoes.value.length),
    icon: MessageSquare,
    iconClass: 'bg-glow-success-bg text-glow-success-dark',
    hint: null,
  },
])

async function carregar() {
  const ativo = estabelecimentoAtivo.value
  if (!ativo) return
  await load(ativo.estabelecimentoId, ativo.profissionalId, profile.value?.nome)
}

async function copiarLink() {
  if (!linkAgendamentoPublico.value) return
  try {
    await navigator.clipboard.writeText(linkAgendamentoPublico.value)
    notifications.push('success', 'Link copiado!')
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
  <div class="prof-dash flex w-full flex-col gap-5">
    <ClienteDashHeader
      :titulo="welcomeTitulo"
      :subtitulo="welcomeSubtitulo"
      :chip="headerChip"
      :loading="loading"
    />

    <ClienteDashSection
      title="Indicadores"
      description="Resumo da sua performance neste mês"
    >
      <StatsGrid :items="stats" :loading="loading" />
    </ClienteDashSection>

    <div class="grid gap-5 lg:grid-cols-2 lg:items-stretch">
      <ProximoAtendimentoCard
        class="h-full min-w-0"
        :agendamento="proximoAtendimento"
        :loading="loading"
        @ver-agenda="router.push(ROUTE_PATHS.AGENDA)"
        @ver-item="router.push(ROUTE_PATHS.AGENDA)"
      />

      <DesempenhoInsights
        class="h-full min-w-0"
        :atendimentos-mes="totalAtendimentos"
        :atendimentos-hoje="atendimentosHoje"
        :nota-media="notaMedia"
        :total-avaliacoes="totalAvaliacoes"
        :tem-link="Boolean(linkAgendamentoPublico)"
        :loading="loading"
        @copiar-link="copiarLink"
      />
    </div>

    <div class="grid gap-5 lg:grid-cols-2 lg:items-stretch">
      <section class="list-card">
        <div class="mb-3 flex items-center justify-between">
          <div>
            <h2 class="font-urbanist text-[15px] font-semibold text-glow-text">
              Últimos atendimentos
            </h2>
            <p class="font-urbanist text-[12px] text-glow-text-subtle">
              Histórico recente com você
            </p>
          </div>
          <button
            type="button"
            class="font-urbanist text-[12px] font-semibold text-glow-gold-cta hover:underline"
            @click="router.push(ROUTE_PATHS.AGENDA)"
          >
            Ver agenda
          </button>
        </div>
        <div v-if="loading" class="flex flex-col gap-2">
          <span v-for="i in 3" :key="i" class="h-12 animate-pulse rounded-xl bg-glow-canvas" />
        </div>
        <p
          v-else-if="ultimosAtendimentos.length === 0"
          class="py-6 text-center font-urbanist text-[13px] text-glow-text-subtle"
        >
          Seus atendimentos aparecerão aqui conforme forem realizados.
        </p>
        <ul v-else class="flex flex-col gap-1">
          <li
            v-for="item in ultimosAtendimentos"
            :key="item.agendamentoItemId"
            class="list-row"
          >
            <div class="min-w-0 flex-1">
              <p class="truncate font-urbanist text-[13px] font-semibold text-glow-text">
                {{ item.clienteNome }}
              </p>
              <p class="truncate font-urbanist text-[12px] text-glow-text-subtle">
                {{ item.servicoNome }} · {{ formatDate(item.inicio) }}
                {{ formatTime(item.inicio) }}
              </p>
            </div>
            <AgendamentoStatusBadge :status="item.status" />
          </li>
        </ul>
      </section>

      <section class="list-card">
        <div class="mb-3">
          <h2 class="font-urbanist text-[15px] font-semibold text-glow-text">
            Últimas avaliações
          </h2>
          <p class="font-urbanist text-[12px] text-glow-text-subtle">
            Feedback recente dos clientes
          </p>
        </div>
        <div v-if="loading" class="flex flex-col gap-2">
          <span v-for="i in 3" :key="i" class="h-12 animate-pulse rounded-xl bg-glow-canvas" />
        </div>
        <p
          v-else-if="ultimasAvaliacoes.length === 0"
          class="py-6 text-center font-urbanist text-[13px] text-glow-text-subtle"
        >
          As avaliações recebidas aparecerão aqui.
        </p>
        <ul v-else class="flex flex-col gap-1">
          <li v-for="av in ultimasAvaliacoes" :key="av.id" class="list-row list-row--stack">
            <p class="font-urbanist text-[13px] font-semibold text-glow-text">
              ★ {{ av.notaProfissional }} · {{ av.clienteNome }}
            </p>
            <p
              v-if="av.comentarioProfissional"
              class="font-urbanist text-[12px] text-glow-text-subtle"
            >
              {{ av.comentarioProfissional }}
            </p>
            <p class="font-urbanist text-[11px] text-glow-text-soft">
              {{ formatDate(av.avaliadoEm) }}
            </p>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.prof-dash {
  padding: 4px 0 28px;
}
.list-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  border-radius: 16px;
  border: 1px solid var(--glow-border-soft);
  background: var(--glow-surface);
  box-shadow: var(--glow-shadow-sm);
}
.list-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 14px;
  transition: background 0.15s ease;
}
.list-row:hover {
  background: color-mix(in srgb, var(--glow-text) 5%, transparent);
}
.list-row--stack {
  flex-direction: column;
  align-items: flex-start;
}
</style>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Calendar, CalendarCheck, Clock, Copy, Star } from 'lucide-vue-next'
import DashboardGreeting from '@/components/dashboard/DashboardGreeting.vue'
import StatsGrid, { type ClienteStat } from '@/components/dashboard/cliente/StatsGrid.vue'
import QuickActions, { type ClienteQuickAction } from '@/components/dashboard/cliente/QuickActions.vue'
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

const primeiroNome = computed(() => profile.value?.nome?.split(' ')[0] ?? 'Profissional')
const saudacao = computed(() => {
  const hora = new Date().getHours()
  return hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'
})

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
    id: 'nota',
    label: 'Nota média',
    value: notaMedia.value != null ? notaMedia.value.toFixed(1) : '—',
    icon: Star,
    iconClass: 'bg-amber-100 text-amber-600',
    hint: totalAvaliacoes.value ? `${totalAvaliacoes.value} avaliações` : null,
  },
])

const acoes = computed<ClienteQuickAction[]>(() => [
  { id: 'agenda', label: 'Minha agenda', description: 'Horários marcados com você', icon: Calendar },
  { id: 'horarios', label: 'Meus horários', description: 'Configure sua disponibilidade', icon: Clock },
  { id: 'link', label: 'Copiar link', description: 'Compartilhe seu agendamento', icon: Copy },
])

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
watch(() => estabelecimentoAtivo.value?.estabelecimentoId, () => void carregar())
</script>

<template>
  <div class="mx-auto max-w-[1200px]">
    <DashboardGreeting
      :title="`${saudacao}, ${primeiroNome}`"
      :subtitle="`Acompanhe sua rotina em ${estabelecimentoAtivo?.nome ?? 'sua loja'}`"
      eyebrow="Painel profissional"
      :loading="loading"
    >
      <template #actions>
        <button type="button" class="cliente-btn-cta" @click="router.push(ROUTE_PATHS.AGENDA)">
          Minha agenda
        </button>
      </template>
    </DashboardGreeting>

    <div class="mt-6">
      <StatsGrid :items="stats" :loading="loading" />
    </div>

    <div class="mt-6">
      <QuickActions :actions="acoes" @action="onAcao" />
    </div>

    <div v-if="linkAgendamentoPublico" class="mt-6 flex flex-col items-start gap-3 rounded-2xl border border-glow-border-soft bg-glow-surface p-5 shadow-glow-sm sm:flex-row sm:items-center sm:justify-between">
      <div class="min-w-0">
        <p class="font-urbanist text-[11px] font-semibold uppercase tracking-wider text-glow-text-soft">Link de agendamento</p>
        <p class="truncate font-urbanist text-[13px] text-glow-text-subtle">{{ linkAgendamentoPublico }}</p>
      </div>
      <button type="button" class="cliente-btn-outline shrink-0" @click="copiarLink">
        {{ linkCopiado ? 'Copiado!' : 'Copiar link' }}
      </button>
    </div>

    <div class="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12">
      <div class="lg:col-span-6">
        <section class="biz-list">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="font-urbanist text-[16px] font-bold text-glow-text">Últimos atendimentos</h2>
            <button type="button" class="font-urbanist text-[13px] font-semibold text-glow-gold-cta hover:underline" @click="router.push(ROUTE_PATHS.AGENDA)">Ver agenda</button>
          </div>
          <div v-if="loading" class="flex flex-col gap-2">
            <span v-for="i in 3" :key="i" class="h-12 animate-pulse rounded-xl bg-glow-canvas" />
          </div>
          <p v-else-if="ultimosAtendimentos.length === 0" class="py-6 text-center font-urbanist text-[13px] text-glow-text-subtle">
            Seus atendimentos aparecerão aqui conforme forem realizados.
          </p>
          <ul v-else class="flex flex-col gap-1">
            <li v-for="item in ultimosAtendimentos" :key="item.agendamentoItemId" class="biz-row">
              <div class="min-w-0 flex-1">
                <p class="truncate font-urbanist text-[13px] font-semibold text-glow-text">{{ item.clienteNome }}</p>
                <p class="truncate font-urbanist text-[12px] text-glow-text-subtle">
                  {{ item.servicoNome }} · {{ formatDate(item.inicio) }} {{ formatTime(item.inicio) }}
                </p>
              </div>
              <AgendamentoStatusBadge :status="item.status" />
            </li>
          </ul>
        </section>
      </div>

      <div class="lg:col-span-6">
        <section class="biz-list">
          <h2 class="mb-3 font-urbanist text-[16px] font-bold text-glow-text">Últimas avaliações</h2>
          <div v-if="loading" class="flex flex-col gap-2">
            <span v-for="i in 3" :key="i" class="h-12 animate-pulse rounded-xl bg-glow-canvas" />
          </div>
          <p v-else-if="ultimasAvaliacoes.length === 0" class="py-6 text-center font-urbanist text-[13px] text-glow-text-subtle">
            As avaliações recebidas aparecerão aqui.
          </p>
          <ul v-else class="flex flex-col gap-1">
            <li v-for="av in ultimasAvaliacoes" :key="av.id" class="biz-row biz-row--stacked">
              <p class="font-urbanist text-[13px] font-semibold text-glow-text">★ {{ av.notaProfissional }} · {{ av.clienteNome }}</p>
              <p v-if="av.comentarioProfissional" class="font-urbanist text-[12px] text-glow-text-subtle">{{ av.comentarioProfissional }}</p>
              <p class="font-urbanist text-[11px] text-glow-text-soft">{{ formatDate(av.avaliadoEm) }}</p>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.biz-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 18px;
  border-radius: 20px;
  border: 1px solid var(--glow-border-soft);
  background: var(--glow-surface);
  box-shadow: 0 8px 24px -14px rgba(82, 46, 95, 0.14);
}
.biz-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 14px;
  transition: background 0.2s ease;
}
.biz-row:hover {
  background: color-mix(in srgb, var(--glow-text) 5%, transparent);
}
</style>
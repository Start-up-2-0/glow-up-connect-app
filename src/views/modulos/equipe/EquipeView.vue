<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Link2, Plus } from 'lucide-vue-next'
import ContentAlert from '@/components/feedback/ContentAlert.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import EquipeCriarLinkModal from '@/components/equipe/EquipeCriarLinkModal.vue'
import EquipeIcons from '@/components/equipe/EquipeIcons.vue'
import EquipeMembroDetalheModal from '@/components/equipe/EquipeMembroDetalheModal.vue'
import EquipePageHeader from '@/components/equipe/EquipePageHeader.vue'
import EquipeStatsGrid from '@/components/equipe/page/EquipeStatsGrid.vue'
import {
  EQUIPE_STAT_ICONS,
  type EquipeStatItem,
} from '@/components/equipe/page/equipeStats'
import EquipeToolbar from '@/components/equipe/page/EquipeToolbar.vue'
import EquipeMembroCard from '@/components/equipe/page/EquipeMembroCard.vue'
import EquipeMembrosTable from '@/components/equipe/page/EquipeMembrosTable.vue'
import EquipePagination from '@/components/equipe/page/EquipePagination.vue'
import { EQUIPE_PAGE_CLASS } from '@/constants/designTokens'
import { ROUTE_PATHS } from '@/constants/routes'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useApiError } from '@/composables/useApiError'
import { equipeService } from '@/services/equipeService'
import { useUserStore } from '@/stores/user.store'
import type {
  EstablishmentUserRole,
  EquipeMembrosResumo,
  MembroEquipeApiItem,
  MembroEquipeItem,
} from '@/types/negocio/equipe.types'
import { formatTelefone } from '@/utils/formatters'
import GlowGuideLauncher from '@/tutorials/components/GlowGuideLauncher.vue'
import { usePageTutorial } from '@/tutorials/hooks/usePageTutorial'

const PAGE_SIZE = 6

const { startPageTutorial } = usePageTutorial('team')

const route = useRoute()
const router = useRouter()
const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const { possuiPermissao } = useNegocioContext()
const { profile } = storeToRefs(useUserStore())
const { resolveError } = useApiError()

const itens = ref<MembroEquipeApiItem[]>([])
const resumo = ref<EquipeMembrosResumo>({
  totalMembros: 0,
  administradores: 0,
  profissionais: 0,
  recepcionistas: 0,
  convidados: 0,
})
const total = ref(0)
const loading = ref(false)
const initialLoaded = ref(false)
const loadError = ref<string | null>(null)
const menuAberto = ref(false)
const modalAberto = ref(false)
const detalheAberto = ref(false)
const membroSelecionado = ref<MembroEquipeItem | null>(null)

const busca = ref('')
const filtroCargo = ref('')
const filtroStatus = ref('')
const vista = ref<'grid' | 'lista'>('grid')
const pagina = ref(1)

const podeGerenciarEquipe = computed(() => possuiPermissao('EquipeGerenciar'))
const podeGerenciarProfissional = computed(() => possuiPermissao('ProfissionalGerenciar'))
const podeAbrirDetalhe = computed(() => podeGerenciarEquipe.value || podeGerenciarProfissional.value)

const cargoOptions = [
  { value: '', label: 'Todos os cargos' },
  { value: 'Owner', label: 'Dono' },
  { value: 'Admin', label: 'Administrador' },
  { value: 'Manager', label: 'Gerente' },
  { value: 'Receptionist', label: 'Recepcionista' },
  { value: 'Profissional', label: 'Profissional' },
  { value: 'Convidado', label: 'Convidado' },
]

const statusOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
  { value: 'pendente', label: 'Pendente' },
]

const totalPaginas = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))

const paginaMeta = computed(() => {
  if (total.value === 0) return { inicio: 0, fim: 0, total: 0 }
  const inicio = (pagina.value - 1) * PAGE_SIZE + 1
  const fim = Math.min(pagina.value * PAGE_SIZE, total.value)
  return { inicio, fim, total: total.value }
})

const stats = computed<EquipeStatItem[]>(() => [
  {
    id: 'total',
    label: 'Total de membros',
    value: resumo.value.totalMembros,
    hint: 'Ativos na equipe',
    icon: EQUIPE_STAT_ICONS.total,
    iconClass: 'bg-glow-gold-selected text-glow-gold-cta',
  },
  {
    id: 'admin',
    label: 'Administradores',
    value: resumo.value.administradores,
    hint: 'Com acesso total',
    icon: EQUIPE_STAT_ICONS.admin,
    iconClass: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
  },
  {
    id: 'prof',
    label: 'Profissionais',
    value: resumo.value.profissionais,
    hint: 'Prestam serviços',
    icon: EQUIPE_STAT_ICONS.profissional,
    iconClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300',
  },
  {
    id: 'recep',
    label: 'Recepcionistas',
    value: resumo.value.recepcionistas,
    hint: 'Atendimento e agenda',
    icon: EQUIPE_STAT_ICONS.recepcionista,
    iconClass: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
  },
  {
    id: 'conv',
    label: 'Convidados',
    value: resumo.value.convidados,
    hint: 'Aguardando acesso',
    icon: EQUIPE_STAT_ICONS.convidado,
    iconClass: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
  },
])

const tabelaItens = computed(() =>
  itens.value.map((item) => ({
    id: item.id,
    nome: item.nome,
    cargo: item.cargo,
    role: (item.role === 'Convidado' ? 'Convidado' : item.role) as EstablishmentUserRole | 'Profissional' | 'Convidado',
    email: item.email ?? undefined,
    telefone: item.telefone ? formatTelefone(item.telefone) : undefined,
    ativo: item.ativo,
    convidado: item.tipo === 'convite',
    conviteEm: item.conviteEm ?? null,
    foto: item.foto ?? null,
  })),
)

function toMembroItem(item: MembroEquipeApiItem): MembroEquipeItem | null {
  if (item.tipo === 'convite') return null
  return {
    id: item.id,
    tipo: item.tipo,
    nome: item.nome,
    cargo: item.cargo,
    role: item.role as EstablishmentUserRole | 'Profissional',
    email: item.email ?? undefined,
    telefone: item.telefone ? formatTelefone(item.telefone) : undefined,
    ativo: item.ativo,
    usuarioId: item.usuarioId ?? 0,
    profissionalId: item.profissionalId ?? undefined,
    podeReceberAgendamento: item.podeReceberAgendamento ?? undefined,
    foto: item.foto ?? null,
  }
}

function abrirModalCriarLink() {
  modalAberto.value = true
  menuAberto.value = false
}

function abrirDetalhe(membro: MembroEquipeItem) {
  if (!podeAbrirDetalhe.value) return
  membroSelecionado.value = membro
  detalheAberto.value = true
}

function onCardClick(item: MembroEquipeApiItem) {
  if (item.tipo === 'convite') {
    void router.push(ROUTE_PATHS.CONFIG_EQUIPE_CONVITES)
    return
  }
  const membro = toMembroItem(item)
  if (membro) abrirDetalhe(membro)
}

function onTableSelect(id: string) {
  const item = itens.value.find((i) => i.id === id)
  if (item) onCardClick(item)
}

function fecharMenuAoClicarFora(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (!target?.closest('[data-equipe-add-menu]')) {
    menuAberto.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', fecharMenuAoClicarFora)
  if (route.query.acao || route.query.modo) {
    abrirModalCriarLink()
    void router.replace({ path: ROUTE_PATHS.CONFIG_EQUIPE, query: {} })
  }
})

onUnmounted(() => {
  document.removeEventListener('click', fecharMenuAoClicarFora)
})

let buscaDebounce: ReturnType<typeof setTimeout> | null = null

watch([busca, filtroCargo, filtroStatus], () => {
  if (buscaDebounce) clearTimeout(buscaDebounce)
  buscaDebounce = setTimeout(() => {
    if (pagina.value !== 1) {
      pagina.value = 1
    } else {
      void load()
    }
  }, 250)
})

watch(pagina, () => {
  void load()
})

watch(totalPaginas, (tp) => {
  if (pagina.value > tp) pagina.value = tp
})

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  loadError.value = null
  try {
    const resultado = await equipeService.listarMembros(estabelecimentoId.value, {
      busca: busca.value,
      cargo: filtroCargo.value,
      status: filtroStatus.value,
      pagina: pagina.value,
      tamanhoPagina: PAGE_SIZE,
    })
    itens.value = resultado.itens
    total.value = resultado.total
    resumo.value = resultado.resumo
  } catch (err) {
    loadError.value = resolveError(err, 'Não foi possível carregar a equipe.')
  } finally {
    loading.value = false
    initialLoaded.value = true
  }
}

watch(ready, (isReady) => {
  if (isReady) void load()
}, { immediate: true })
</script>

<template>
  <div :class="[EQUIPE_PAGE_CLASS, 'space-y-5']" data-tour="team-page">
    <EquipePageHeader
      title="Equipe"
      subtitle="Pessoas que fazem parte do seu negócio."
    >
      <template #actions>
        <GlowGuideLauncher class="max-sm:hidden" @click="startPageTutorial" />
        <GlowGuideLauncher class="sm:hidden" compact @click="startPageTutorial" />
        <div class="relative" data-equipe-add-menu>
          <button
            type="button"
            class="equipe-btn-primary equipe-btn-primary--add"
            @click="abrirModalCriarLink"
          >
            <Plus class="size-4" aria-hidden="true" />
            Adicionar membros
          </button>
        </div>
        <RouterLink
          :to="ROUTE_PATHS.CONFIG_EQUIPE_CONVITES"
          class="equipe-btn-outline equipe-btn-outline--links"
        >
          <Link2 class="size-4" aria-hidden="true" />
          Links enviados
        </RouterLink>
      </template>
    </EquipePageHeader>

    <ContentAlert v-if="contextError" variant="error" title="Não foi possível continuar">
      {{ contextError }}
    </ContentAlert>

    <ContentAlert v-if="loadError" variant="error" title="Erro ao carregar dados" compact>
      {{ loadError }}
    </ContentAlert>

    <LoadingSpinner v-if="contextLoading || (loading && !initialLoaded)" />

    <template v-else>
      <EquipeStatsGrid :items="stats" :class="{ 'opacity-60': loading }" />

      <EquipeToolbar
        v-model:busca="busca"
        v-model:cargo="filtroCargo"
        v-model:status="filtroStatus"
        v-model:vista="vista"
        :cargo-options="cargoOptions"
        :status-options="statusOptions"
      />

      <div
        v-if="itens.length === 0"
        class="rounded-2xl border border-dashed border-glow-border-soft bg-glow-surface px-6 py-12 text-center"
      >
        <h2 class="font-satoshi text-lg font-bold text-glow-text">
          {{ resumo.totalMembros === 0 && resumo.convidados === 0 ? 'Ninguém na equipe ainda' : 'Nenhum resultado' }}
        </h2>
        <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
          {{
            resumo.totalMembros === 0 && resumo.convidados === 0
              ? 'Adicione quem faz parte do negócio para começar a organizar a operação.'
              : 'Ajuste a busca ou os filtros para encontrar membros.'
          }}
        </p>
        <button
          v-if="resumo.totalMembros === 0 && resumo.convidados === 0"
          type="button"
          class="equipe-btn-primary equipe-btn-primary--add mt-4"
          @click="abrirModalCriarLink"
        >
          <EquipeIcons name="plus" />
          Adicionar membros
        </button>
      </div>

      <template v-else>
        <div
          v-if="vista === 'grid'"
          class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          <EquipeMembroCard
            v-for="item in itens"
            :key="item.id"
            :nome="item.nome"
            :cargo="item.cargo"
            :role="(item.role === 'Convidado' ? 'Convidado' : item.role) as any"
            :email="item.email ?? undefined"
            :telefone="item.telefone ? formatTelefone(item.telefone) : undefined"
            :ativo="item.ativo"
            :convidado="item.tipo === 'convite'"
            :convite-em="item.conviteEm"
            :foto="item.foto"
            :interactive="item.tipo === 'convite' || podeAbrirDetalhe"
            @click="onCardClick(item)"
            @menu="onCardClick(item)"
          />
        </div>

        <EquipeMembrosTable
          v-else
          :items="tabelaItens"
          interactive
          @select="onTableSelect"
        />

        <EquipePagination
          v-if="total > PAGE_SIZE"
          :pagina="pagina"
          :total-paginas="totalPaginas"
          :total="paginaMeta.total"
          :inicio="paginaMeta.inicio"
          :fim="paginaMeta.fim"
          @anterior="pagina = Math.max(1, pagina - 1)"
          @proxima="pagina = Math.min(totalPaginas, pagina + 1)"
          @ir="pagina = $event"
        />
        <p
          v-else
          class="text-right font-urbanist text-xs text-glow-text-subtle"
        >
          Mostrando {{ paginaMeta.inicio }} a {{ paginaMeta.fim }} de {{ paginaMeta.total }} membros
        </p>
      </template>
    </template>

    <EquipeCriarLinkModal
      v-model="modalAberto"
      @criado="load"
    />

    <EquipeMembroDetalheModal
      v-model="detalheAberto"
      :membro="membroSelecionado"
      :estabelecimento-id="estabelecimentoId"
      :pode-gerenciar-equipe="podeGerenciarEquipe"
      :pode-gerenciar-profissional="podeGerenciarProfissional"
      :usuario-atual-id="profile?.id ?? null"
      @atualizado="load"
    />
  </div>
</template>

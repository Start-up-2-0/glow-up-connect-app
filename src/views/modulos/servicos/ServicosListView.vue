<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Search, SlidersHorizontal, X } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ServicoCard from '@/components/servicos/ServicoCard.vue'
import ServicoEmptyState from '@/components/servicos/ServicoEmptyState.vue'
import ServicoIcons from '@/components/servicos/ServicoIcons.vue'
import ServicoPageHeader from '@/components/servicos/ServicoPageHeader.vue'
import ServicoPagination from '@/components/servicos/ServicoPagination.vue'
import GlowGuideLauncher from '@/tutorials/components/GlowGuideLauncher.vue'
import { SERVICOS_PAGE_CLASS } from '@/constants/designTokens'
import { ROUTE_PATHS, servicoEditarPath, servicoProfissionaisPath } from '@/constants/routes'
import { useAcessoUsuario } from '@/composables/useAcessoUsuario'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useGlowGuide } from '@/tutorials/hooks/useGlowGuide'
import { useNegocioStore } from '@/stores/negocio.store'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { servicoService } from '@/services/servicoService'
import type { Servico } from '@/types/negocio/servico.types'
import { formatLimite } from '@/utils/formatters'
import { SERVICOS_PAGE_SIZE } from '@/utils/servicoFormatters'

const router = useRouter()
const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const { possuiPermissao, possuiModulo } = useNegocioContext()
const { ehProfissionalOperacional } = useAcessoUsuario()
const negocioStore = useNegocioStore()
const { limites, estabelecimentoAtivo } = storeToRefs(negocioStore)
const notifications = useNotificationsStore()
const { resolveError } = useApiError()
const { start: startTutorial } = useGlowGuide()

const servicos = ref<Servico[]>([])
const loading = ref(false)
const loadError = ref<string | null>(null)
const togglingId = ref<number | null>(null)
const pagina = ref(1)
const busca = ref('')
const status = ref<'todos' | 'ativos' | 'inativos'>('todos')
const ordenacao = ref<'nome' | 'preco-asc' | 'preco-desc'>('nome')

const podeGerenciar = computed(() => possuiPermissao('ServicoGerenciar'))
const pageTutorialId = computed(() => (podeGerenciar.value ? 'first-service' : 'services'))

function onStartTutorial() {
  void startTutorial(pageTutorialId.value)
}
const ehVisaoProfissional = computed(() => ehProfissionalOperacional.value && !podeGerenciar.value)
const profissionalProprioId = computed(() => estabelecimentoAtivo.value?.profissionalId ?? null)
const temModuloProfissionais = computed(() => possuiModulo('Profissionais'))
const limiteServicos = computed(() => limites.value?.servicos ?? null)
const usoServicos = computed(() => servicos.value.length)
const limiteAtingido = computed(
  () => limiteServicos.value !== null && usoServicos.value >= limiteServicos.value,
)
const limiteTooltip = computed(() =>
  limiteAtingido.value
    ? 'Limite de serviços do plano atingido. Faça upgrade para cadastrar mais.'
    : undefined,
)

const servicosFiltrados = computed(() => {
  const termo = busca.value.trim().toLocaleLowerCase('pt-BR')
  const filtrados = servicos.value.filter((servico) => {
    const correspondeBusca = !termo || `${servico.nome} ${servico.descricao ?? ''}`
      .toLocaleLowerCase('pt-BR')
      .includes(termo)
    const correspondeStatus = status.value === 'todos'
      || (status.value === 'ativos' && servico.ativo)
      || (status.value === 'inativos' && !servico.ativo)
    return correspondeBusca && correspondeStatus
  })

  return [...filtrados].sort((a, b) => {
    if (ordenacao.value === 'preco-asc') return precoExibicao(a) - precoExibicao(b)
    if (ordenacao.value === 'preco-desc') return precoExibicao(b) - precoExibicao(a)
    return a.nome.localeCompare(b.nome, 'pt-BR')
  })
})

const totalPaginas = computed(() =>
  Math.max(1, Math.ceil(servicosFiltrados.value.length / SERVICOS_PAGE_SIZE)),
)

const servicosPaginados = computed(() => {
  const start = (pagina.value - 1) * SERVICOS_PAGE_SIZE
  return servicosFiltrados.value.slice(start, start + SERVICOS_PAGE_SIZE)
})

const filtrosAtivos = computed(() => Boolean(busca.value.trim()) || status.value !== 'todos')

function limparFiltros() {
  busca.value = ''
  status.value = 'todos'
  ordenacao.value = 'nome'
}

const pageTitle = computed(() => (ehVisaoProfissional.value ? 'Meus serviços' : 'Serviços'))

const pageSubtitle = computed(() => {
  if (podeGerenciar.value) {
    return 'Cadastre e gerencie os serviços oferecidos pelo estabelecimento.'
  }
  if (ehVisaoProfissional.value) {
    return 'Serviços vinculados a você neste estabelecimento.'
  }
  return 'Visualize os serviços oferecidos pelo estabelecimento.'
})

const emptyTitle = computed(() =>
  podeGerenciar.value ? 'Nenhum serviço cadastrado' : 'Nenhum serviço',
)

const emptyDescription = computed(() => {
  if (podeGerenciar.value) {
    return 'Cadastre o primeiro serviço para começar a receber agendamentos.'
  }
  if (ehVisaoProfissional.value) {
    return 'Nenhum serviço foi vinculado a você ainda.'
  }
  return 'Nenhum serviço cadastrado neste estabelecimento.'
})

function vinculoProprio(servico: Servico) {
  if (profissionalProprioId.value === null) return null
  return (
    servico.profissionais.find(
      (p) => p.profissionalId === profissionalProprioId.value && p.ativo,
    ) ?? null
  )
}

function precoExibicao(servico: Servico): number {
  return vinculoProprio(servico)?.preco ?? servico.precoBase
}

function duracaoExibicao(servico: Servico): number {
  return vinculoProprio(servico)?.duracaoMinutos ?? servico.duracaoMinutos
}

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  loadError.value = null
  try {
    servicos.value = await servicoService.listar(estabelecimentoId.value)
    if (pagina.value > totalPaginas.value) {
      pagina.value = totalPaginas.value
    }
  } catch (err) {
    loadError.value = resolveError(err, 'Não foi possível carregar os serviços.')
    notifications.push('error', loadError.value)
  } finally {
    loading.value = false
  }
}

async function handleToggleStatus(servico: Servico) {
  if (!estabelecimentoId.value || !podeGerenciar.value) return
  togglingId.value = servico.id
  try {
    const atualizado = await servicoService.alterarStatus(
      estabelecimentoId.value,
      servico.id,
      !servico.ativo,
    )
    servicos.value = servicos.value.map((s) => (s.id === servico.id ? atualizado : s))
    notifications.push('success', atualizado.ativo ? 'Serviço ativado.' : 'Serviço desativado.')
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    togglingId.value = null
  }
}

function irNovo() {
  if (limiteAtingido.value) return
  void router.push(ROUTE_PATHS.SERVICOS_NOVO)
}

function irEditar(id: number) {
  void router.push(servicoEditarPath(id))
}

function irProfissionais(id: number) {
  void router.push(servicoProfissionaisPath(id))
}

watch(
  ready,
  (isReady) => {
    if (isReady) void load()
  },
  { immediate: true },
)

watch([busca, status, ordenacao], () => {
  pagina.value = 1
})
</script>

<template>
  <div :class="SERVICOS_PAGE_CLASS" data-tour="servicos-page">
    <ServicoPageHeader :title="pageTitle" :subtitle="pageSubtitle">
      <template #actions>
        <GlowGuideLauncher class="max-sm:hidden" @click="onStartTutorial" />
        <GlowGuideLauncher class="sm:hidden" label="Ver tutorial" @click="onStartTutorial" />
        <template v-if="podeGerenciar">
          <span
            v-if="limiteServicos !== null"
            class="self-center font-urbanist text-xs text-glow-text-subtle"
          >
            {{ usoServicos }}/{{ formatLimite(limiteServicos) }}
          </span>
          <button
            type="button"
            class="servicos-btn-primary servicos-btn-primary--header"
            data-tour="servicos-novo"
            :disabled="limiteAtingido"
            :title="limiteTooltip"
            @click="irNovo"
          >
            <ServicoIcons name="plus" />
            Novo serviço
          </button>
        </template>
      </template>
    </ServicoPageHeader>

    <p v-if="contextError" class="font-urbanist text-sm text-red-600">{{ contextError }}</p>

    <div v-if="loadError" class="servicos-feedback servicos-feedback--error" role="alert">
      <div>
        <strong>Não foi possível carregar os serviços.</strong>
        <span>{{ loadError }}</span>
      </div>
      <button type="button" @click="load">Tentar novamente</button>
    </div>

    <div v-if="servicos.length > 0" class="servicos-toolbar" aria-label="Filtros de serviços">
      <div class="servicos-toolbar__search">
        <Search aria-hidden="true" />
        <input v-model="busca" type="search" aria-label="Buscar serviços" placeholder="Buscar por nome ou descrição" />
        <button v-if="busca" type="button" aria-label="Limpar busca" @click="busca = ''">
          <X aria-hidden="true" />
        </button>
      </div>
      <div class="servicos-toolbar__filters">
        <SlidersHorizontal aria-hidden="true" />
        <label>
          <span class="sr-only">Filtrar por status</span>
          <select v-model="status">
            <option value="todos">Todos os status</option>
            <option value="ativos">Ativos</option>
            <option value="inativos">Inativos</option>
          </select>
        </label>
        <label>
          <span class="sr-only">Ordenar serviços</span>
          <select v-model="ordenacao">
            <option value="nome">Nome (A–Z)</option>
            <option value="preco-asc">Menor preço</option>
            <option value="preco-desc">Maior preço</option>
          </select>
        </label>
      </div>
      <span class="servicos-toolbar__count">
        {{ servicosFiltrados.length }} {{ servicosFiltrados.length === 1 ? 'serviço' : 'serviços' }}
      </span>
    </div>

    <div v-if="loading && servicos.length === 0" class="servicos-cards-grid" aria-label="Carregando serviços">
      <div v-for="item in 6" :key="item" class="servico-card-skeleton" aria-hidden="true">
        <span /><span /><span /><span />
      </div>
    </div>

    <ServicoEmptyState
      v-if="!contextLoading && !loading && servicos.length === 0"
      :title="emptyTitle"
      :description="emptyDescription"
      :show-action="podeGerenciar"
      :action-disabled="limiteAtingido"
      :action-title="limiteTooltip"
      @action="irNovo"
    />

    <div v-else-if="servicos.length > 0 && servicosFiltrados.length === 0" class="servicos-feedback">
      <div>
        <strong>Nenhum serviço encontrado</strong>
        <span>Tente outro termo ou remova os filtros aplicados.</span>
      </div>
      <button v-if="filtrosAtivos" type="button" @click="limparFiltros">Limpar filtros</button>
    </div>

    <template v-else-if="servicosFiltrados.length > 0">
      <div class="servicos-cards-grid">
        <ServicoCard
          v-for="servico in servicosPaginados"
          :key="servico.id"
          :servico="servico"
          :preco="precoExibicao(servico)"
          :duracao="duracaoExibicao(servico)"
          :pode-gerenciar="podeGerenciar"
          :tem-modulo-profissionais="temModuloProfissionais"
          :toggling="togglingId === servico.id"
          @editar="irEditar(servico.id)"
          @profissionais="irProfissionais(servico.id)"
          @toggle-status="handleToggleStatus(servico)"
        />
      </div>

      <ServicoPagination
        v-model:pagina="pagina"
        :total-paginas="totalPaginas"
        :loading="loading"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ServicoIcons from '@/components/servicos/ServicoIcons.vue'
import ServicoPageHeader from '@/components/servicos/ServicoPageHeader.vue'
import ServicoProfissionalSelectModal from '@/components/servicos/ServicoProfissionalSelectModal.vue'
import ServicoProfissionalVinculoCard from '@/components/servicos/ServicoProfissionalVinculoCard.vue'
import { SERVICOS_PAGE_CLASS } from '@/constants/designTokens'
import { ROUTE_PATHS } from '@/constants/routes'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { equipeService } from '@/services/equipeService'
import { servicoService } from '@/services/servicoService'
import type { Servico } from '@/types/negocio/servico.types'
import type { ProfissionalEquipe } from '@/types/negocio/equipe.types'
import { formatCurrency } from '@/utils/formatters'
import { formatDuracaoMinutos } from '@/utils/servicoFormatters'

const route = useRoute()
const router = useRouter()
const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const servicoId = computed(() => {
  const id = Number(route.params.id)
  return Number.isFinite(id) ? id : null
})

const servico = ref<Servico | null>(null)
const equipe = ref<ProfissionalEquipe[]>([])
const vinculadosIds = ref<number[]>([])
const vinculadosIniciais = ref<number[]>([])
const selecionadosBulk = ref<number[]>([])
const loading = ref(false)
const saving = ref(false)
const notFound = ref(false)
const modalAberto = ref(false)
const modoSelecao = ref(false)

const temAlteracoes = computed(() => {
  const atuais = [...vinculadosIds.value].sort((a, b) => a - b)
  const iniciais = [...vinculadosIniciais.value].sort((a, b) => a - b)
  return JSON.stringify(atuais) !== JSON.stringify(iniciais)
})

const profissionaisDisponiveis = computed(() => equipe.value.filter((p) => p.ativo))

const profissionaisVinculados = computed(() =>
  profissionaisDisponiveis.value.filter((p) => vinculadosIds.value.includes(p.profissionalId)),
)

const todosSelecionadosBulk = computed(
  () =>
    profissionaisVinculados.value.length > 0 &&
    selecionadosBulk.value.length === profissionaisVinculados.value.length,
)

async function load() {
  if (!estabelecimentoId.value || !servicoId.value) return
  loading.value = true
  notFound.value = false
  try {
    const [servicos, equipeData] = await Promise.all([
      servicoService.listar(estabelecimentoId.value),
      equipeService.listarProfissionais(estabelecimentoId.value),
    ])
    const serv = servicos.find((s) => s.id === servicoId.value)
    if (!serv) {
      notFound.value = true
      return
    }
    servico.value = serv
    equipe.value = equipeData
    const ids = serv.profissionais.filter((p) => p.ativo).map((p) => p.profissionalId)
    vinculadosIds.value = [...ids]
    vinculadosIniciais.value = [...ids]
    selecionadosBulk.value = []
    modoSelecao.value = false
  } catch (err) {
    notifications.push('error', resolveError(err, 'Não foi possível carregar os vínculos.'))
  } finally {
    loading.value = false
  }
}

async function salvarVinculos() {
  if (!estabelecimentoId.value || !servicoId.value || !servico.value || !temAlteracoes.value) {
    return
  }

  saving.value = true
  try {
    const estId = estabelecimentoId.value
    const svcId = servicoId.value
    const atuais = new Set(vinculadosIds.value)
    const iniciais = new Set(vinculadosIniciais.value)
    const payload = {
      preco: servico.value.precoBase,
      duracaoMinutos: servico.value.duracaoMinutos,
    }

    const paraVincular = [...atuais].filter((id) => !iniciais.has(id))
    const paraDesvincular = [...iniciais].filter((id) => !atuais.has(id))

    await Promise.all([
      ...paraVincular.map((profId) =>
        servicoService.vincularProfissional(estId, svcId, profId, payload),
      ),
      ...paraDesvincular.map((profId) =>
        servicoService.desvincularProfissional(estId, svcId, profId),
      ),
    ])

    notifications.push('success', 'Vínculos atualizados.')
    await load()
  } catch (err) {
    notifications.push('error', resolveError(err, 'Não foi possível salvar os vínculos.'))
  } finally {
    saving.value = false
  }
}

function voltar() {
  void router.push(ROUTE_PATHS.SERVICOS)
}

function abrirModalAdicionar() {
  modalAberto.value = true
}

function aplicarProfissionais(ids: number[]) {
  vinculadosIds.value = ids
}

function removerProfissional(id: number) {
  vinculadosIds.value = vinculadosIds.value.filter((item) => item !== id)
}

function toggleModoSelecao() {
  modoSelecao.value = !modoSelecao.value
  if (!modoSelecao.value) {
    selecionadosBulk.value = []
  }
}

function toggleSelecionarTodosBulk() {
  if (todosSelecionadosBulk.value) {
    selecionadosBulk.value = []
    return
  }
  selecionadosBulk.value = profissionaisVinculados.value.map((p) => p.profissionalId)
}

function toggleSelecionadoBulk(id: number) {
  if (selecionadosBulk.value.includes(id)) {
    selecionadosBulk.value = selecionadosBulk.value.filter((item) => item !== id)
    return
  }
  selecionadosBulk.value = [...selecionadosBulk.value, id]
}

function excluirSelecionados() {
  if (selecionadosBulk.value.length === 0) return
  const remover = new Set(selecionadosBulk.value)
  vinculadosIds.value = vinculadosIds.value.filter((id) => !remover.has(id))
  selecionadosBulk.value = []
}

watch(
  ready,
  (isReady) => {
    if (isReady) void load()
  },
  { immediate: true },
)
</script>

<template>
  <div :class="SERVICOS_PAGE_CLASS">
    <ServicoPageHeader
      v-if="servico"
      :title="servico.nome"
      :meta-preco="formatCurrency(servico.precoBase)"
      :meta-duracao="formatDuracaoMinutos(servico.duracaoMinutos)"
    >
      <template #actions>
        <button
          type="button"
          class="servicos-btn-outline servicos-btn-outline--md"
          @click="abrirModalAdicionar"
        >
          <ServicoIcons name="profissionais" />
          Adicionar profissionais
        </button>
        <button
          type="button"
          class="servicos-btn-primary servicos-btn-primary--header"
          :disabled="!temAlteracoes || saving"
          @click="salvarVinculos"
        >
          {{ saving ? 'Salvando…' : 'Salvar alteração' }}
        </button>
      </template>
    </ServicoPageHeader>

    <ServicoPageHeader
      v-else-if="!loading && !contextLoading"
      title="Profissionais do serviço"
      subtitle="Gerencie os profissionais vinculados ao serviço."
    />

    <p v-if="contextError" class="font-urbanist text-sm text-red-600">{{ contextError }}</p>

    <div v-if="!contextLoading && !loading && notFound" class="servicos-form-panel">
      <h2 class="servicos-page__title">Serviço não encontrado</h2>
      <p class="servicos-page__subtitle">
        O serviço solicitado não existe ou foi removido.
      </p>
      <div class="servicos-form-actions">
        <button type="button" class="servicos-btn-form-secondary" @click="voltar">
          Voltar à listagem
        </button>
      </div>
    </div>

    <template v-else-if="!contextLoading && !loading && servico">
      <div class="servicos-prof-toolbar">
        <button
          type="button"
          class="servicos-prof-select-all servicos-prof-select-all--toolbar"
          @click="toggleModoSelecao"
        >
          <input
            type="checkbox"
            class="servico-prof-vinculo-card__checkbox"
            :checked="modoSelecao"
            tabindex="-1"
            aria-hidden="true"
            @click.prevent
          />
          Selecionar itens
        </button>

        <button
          v-if="modoSelecao"
          type="button"
          class="servicos-btn-delete"
          :disabled="selecionadosBulk.length === 0"
          @click="excluirSelecionados"
        >
          <ServicoIcons name="delete" />
          Excluir
        </button>

        <button
          v-if="modoSelecao && profissionaisVinculados.length > 0"
          type="button"
          class="servicos-prof-select-all"
          @click="toggleSelecionarTodosBulk"
        >
          <input
            type="checkbox"
            class="servico-prof-vinculo-card__checkbox"
            :checked="todosSelecionadosBulk"
            tabindex="-1"
            aria-hidden="true"
            @click.prevent
          />
          Selecionar todos
        </button>
      </div>

      <div class="servicos-prof-grid">
        <ServicoProfissionalVinculoCard
          v-for="prof in profissionaisVinculados"
          :key="prof.profissionalId"
          :nome="prof.nomePublico"
          :nota-media="prof.notaMedia"
          :total-avaliacoes="prof.totalAvaliacoes"
          :selectable="modoSelecao"
          :selected="selecionadosBulk.includes(prof.profissionalId)"
          :show-remove="!modoSelecao"
          @toggle="toggleSelecionadoBulk(prof.profissionalId)"
          @remove="removerProfissional(prof.profissionalId)"
        />

        <button
          v-if="!modoSelecao"
          type="button"
          class="servico-prof-add-btn"
          aria-label="Adicionar profissional"
          @click="abrirModalAdicionar"
        >
          <ServicoIcons name="plus" />
        </button>
      </div>

      <p
        v-if="profissionaisVinculados.length === 0"
        class="font-urbanist text-sm text-glow-text-subtle"
      >
        Nenhum profissional vinculado. Use o botão + ou "Adicionar profissionais" para começar.
      </p>
    </template>

    <ServicoProfissionalSelectModal
      v-model="modalAberto"
      :profissionais="profissionaisDisponiveis"
      :selected-ids="vinculadosIds"
      title="Adicionar profissionais"
      subtitle="Escolha quem poderá executar este serviço."
      @confirm="aplicarProfissionais"
    />
  </div>
</template>

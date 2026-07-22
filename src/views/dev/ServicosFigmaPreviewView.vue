<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CurrencyInput from '@/components/ui/CurrencyInput.vue'
import ServicoCard from '@/components/servicos/ServicoCard.vue'
import ServicoEmptyState from '@/components/servicos/ServicoEmptyState.vue'
import ServicoIcons from '@/components/servicos/ServicoIcons.vue'
import ServicoPageHeader from '@/components/servicos/ServicoPageHeader.vue'
import ServicoPagination from '@/components/servicos/ServicoPagination.vue'
import ServicoProfissionalChip from '@/components/servicos/ServicoProfissionalChip.vue'
import ServicoProfissionalSelectModal from '@/components/servicos/ServicoProfissionalSelectModal.vue'
import ServicoProfissionalVinculoCard from '@/components/servicos/ServicoProfissionalVinculoCard.vue'
import { SERVICOS_PAGE_CLASS } from '@/constants/designTokens'
import { ROUTE_PATHS } from '@/constants/routes'
import {
  MOCK_EQUIPE_FIGMA,
  MOCK_SERVICO_BUZZ_CUT,
  MOCK_SERVICOS_LISTAGEM,
} from '@/mocks/servicosFigmaMock'
import { formatCurrency } from '@/utils/formatters'
import { formatDuracaoMinutos } from '@/utils/servicoFormatters'

const TELAS = [
  { id: 'listagem', label: 'Listagem' },
  { id: 'empty', label: 'Empty state' },
  { id: 'form-novo', label: 'Form — novo' },
  { id: 'form-preenchido', label: 'Form — preenchido' },
  { id: 'profissionais', label: 'Profissionais' },
  { id: 'profissionais-selecao', label: 'Profissionais — seleção' },
  { id: 'modal', label: 'Modal' },
] as const

type TelaId = (typeof TELAS)[number]['id']

const route = useRoute()
const router = useRouter()

const telaAtiva = computed<TelaId>(() => {
  const tela = route.query.tela
  const id = typeof tela === 'string' ? tela : 'listagem'
  return TELAS.some((item) => item.id === id) ? (id as TelaId) : 'listagem'
})

const pagina = ref(1)
const modalAberto = ref(false)
const profissionaisModalIds = ref([1, 2, 3])

const formNovo = ref({
  nome: '',
  descricao: '',
  precoBase: 0,
  duracaoMinutos: 30,
})

const formPreenchido = ref({
  nome: 'Corte Buzz Cut com fade',
  descricao: 'Corte de cabelo curto e raspado à máquina',
  precoBase: 25,
  duracaoMinutos: 45,
})

const profissionaisVinculados = computed(() =>
  MOCK_EQUIPE_FIGMA.filter((p) => [1, 2, 3].includes(p.profissionalId)),
)

const profissionaisSelecionadosForm = computed(() =>
  MOCK_EQUIPE_FIGMA.filter((p) => [1, 2, 3].includes(p.profissionalId)),
)

const selecionadosBulk = ref([1, 2])

function irTela(id: TelaId) {
  void router.replace({ path: ROUTE_PATHS.DEV_SERVICOS_FIGMA, query: { tela: id } })
}

watch(
  telaAtiva,
  (tela) => {
    modalAberto.value = tela === 'modal'
  },
  { immediate: true },
)
</script>

<template>
  <div class="dev-servicos-preview">
    <nav class="dev-servicos-preview__nav" aria-label="Telas do preview Figma">
      <button
        v-for="tela in TELAS"
        :key="tela.id"
        type="button"
        class="dev-servicos-preview__nav-btn"
        :class="{ 'dev-servicos-preview__nav-btn--active': telaAtiva === tela.id }"
        @click="irTela(tela.id)"
      >
        {{ tela.label }}
      </button>
    </nav>

    <div class="dev-servicos-preview__stage">
      <!-- Listagem -->
      <div v-if="telaAtiva === 'listagem'" :class="SERVICOS_PAGE_CLASS">
        <ServicoPageHeader
          title="Serviços"
          subtitle="Cadastre e gerencie os serviços oferecidos pelo estabelecimento."
        >
          <template #actions>
            <button type="button" class="servicos-btn-primary servicos-btn-primary--header">
              <ServicoIcons name="plus" />
              Novo serviço
            </button>
          </template>
        </ServicoPageHeader>

        <div class="servicos-cards-grid">
          <ServicoCard
            v-for="servico in MOCK_SERVICOS_LISTAGEM"
            :key="servico.id"
            :servico="servico"
            :preco="servico.precoBase"
            :duracao="servico.duracaoMinutos"
            :pode-gerenciar="true"
            :tem-modulo-profissionais="true"
          />
        </div>

        <ServicoPagination v-model:pagina="pagina" :total-paginas="5" />
      </div>

      <!-- Empty state -->
      <div v-else-if="telaAtiva === 'empty'" :class="SERVICOS_PAGE_CLASS">
        <ServicoPageHeader
          title="Serviços"
          subtitle="Cadastre e gerencie os serviços oferecidos pelo estabelecimento."
        />
        <ServicoEmptyState
          title="Nenhum serviço cadastrado"
          description="Cadastre o primeiro serviço para começar a receber agendamentos."
          show-action
        />
      </div>

      <!-- Form novo -->
      <div v-else-if="telaAtiva === 'form-novo'" :class="SERVICOS_PAGE_CLASS">
        <ServicoPageHeader
          title="Novo serviço"
          subtitle="Cadastre um novo serviço oferecido pelo estabelecimento."
          :back-to="ROUTE_PATHS.DEV_SERVICOS_FIGMA"
          back-label="Voltar à listagem"
        />

        <form class="servicos-form-panel" @submit.prevent>
          <div class="servicos-form-panel__fields">
            <div class="servicos-form-field">
              <label class="servicos-form-label" for="preview-servico-nome">Serviço</label>
              <input
                id="preview-servico-nome"
                v-model="formNovo.nome"
                type="text"
                class="servicos-form-input"
                placeholder="Ex: Corte Buzz Cut com fade"
              />
            </div>

            <div class="servicos-form-panel__row">
              <div class="servicos-form-field servico-form-currency">
                <CurrencyInput v-model="formNovo.precoBase" label="Preço base" />
              </div>
              <div class="servicos-form-field">
                <label class="servicos-form-label" for="preview-duracao">Duração (em minutos)</label>
                <input
                  id="preview-duracao"
                  v-model.number="formNovo.duracaoMinutos"
                  type="number"
                  min="1"
                  class="servicos-form-input"
                  placeholder="Ex: 30"
                />
              </div>
            </div>

            <div class="servicos-form-field">
              <label class="servicos-form-label" for="preview-descricao">Descrição (opcional)</label>
              <input
                id="preview-descricao"
                v-model="formNovo.descricao"
                type="text"
                class="servicos-form-input"
                placeholder="Corte de cabelo curto e raspado à máquina"
              />
            </div>

            <div class="servicos-form-field">
              <div class="servicos-form-profissionais-header">
                <label class="servicos-form-label">Profissionais</label>
                <button type="button" class="servicos-btn-outline">
                  <ServicoIcons name="profissionais" />
                  Selecionar profissionais
                </button>
              </div>
              <div class="servicos-form-profissionais-box">
                <p class="servicos-form-profissionais-placeholder">
                  Nenhum profissional selecionado.
                </p>
              </div>
            </div>
          </div>

          <div class="servicos-form-actions">
            <button type="button" class="servicos-btn-form-primary">Salvar</button>
            <button type="button" class="servicos-btn-form-secondary">Cancelar</button>
          </div>
        </form>
      </div>

      <!-- Form preenchido -->
      <div v-else-if="telaAtiva === 'form-preenchido'" :class="SERVICOS_PAGE_CLASS">
        <ServicoPageHeader
          title="Novo serviço"
          subtitle="Cadastre um novo serviço oferecido pelo estabelecimento."
          :back-to="ROUTE_PATHS.DEV_SERVICOS_FIGMA"
          back-label="Voltar à listagem"
        />

        <form class="servicos-form-panel" @submit.prevent>
          <div class="servicos-form-panel__fields">
            <div class="servicos-form-field">
              <label class="servicos-form-label" for="preview-servico-nome-filled">Serviço</label>
              <input
                id="preview-servico-nome-filled"
                v-model="formPreenchido.nome"
                type="text"
                class="servicos-form-input"
              />
            </div>

            <div class="servicos-form-panel__row">
              <div class="servicos-form-field servico-form-currency">
                <CurrencyInput v-model="formPreenchido.precoBase" label="Preço base" />
              </div>
              <div class="servicos-form-field">
                <label class="servicos-form-label" for="preview-duracao-filled">
                  Duração (em minutos)
                </label>
                <input
                  id="preview-duracao-filled"
                  v-model.number="formPreenchido.duracaoMinutos"
                  type="number"
                  min="1"
                  class="servicos-form-input"
                />
              </div>
            </div>

            <div class="servicos-form-field">
              <label class="servicos-form-label" for="preview-descricao-filled">
                Descrição (opcional)
              </label>
              <input
                id="preview-descricao-filled"
                v-model="formPreenchido.descricao"
                type="text"
                class="servicos-form-input"
              />
            </div>

            <div class="servicos-form-field">
              <div class="servicos-form-profissionais-header">
                <label class="servicos-form-label">Profissionais</label>
                <button type="button" class="servicos-btn-outline">
                  <ServicoIcons name="profissionais" />
                  Selecionar profissionais
                </button>
              </div>
              <div
                class="servicos-form-profissionais-box servicos-form-profissionais-box--filled"
              >
                <ServicoProfissionalChip
                  v-for="prof in profissionaisSelecionadosForm"
                  :key="prof.profissionalId"
                  :nome="prof.nomePublico"
                  removable
                />
              </div>
            </div>
          </div>

          <div class="servicos-form-actions">
            <button type="button" class="servicos-btn-form-primary">Salvar</button>
            <button type="button" class="servicos-btn-form-secondary">Cancelar</button>
          </div>
        </form>
      </div>

      <!-- Profissionais vinculados -->
      <div v-else-if="telaAtiva === 'profissionais'" :class="SERVICOS_PAGE_CLASS">
        <ServicoPageHeader
          :title="MOCK_SERVICO_BUZZ_CUT.nome"
          :meta-preco="formatCurrency(MOCK_SERVICO_BUZZ_CUT.precoBase)"
          :meta-duracao="formatDuracaoMinutos(MOCK_SERVICO_BUZZ_CUT.duracaoMinutos)"
        >
          <template #actions>
            <button type="button" class="servicos-btn-outline servicos-btn-outline--md">
              <ServicoIcons name="profissionais" />
              Adicionar profissionais
            </button>
            <button type="button" class="servicos-btn-primary servicos-btn-primary--header">
              Salvar alteração
            </button>
          </template>
        </ServicoPageHeader>

        <div class="servicos-prof-toolbar">
          <button type="button" class="servicos-prof-select-all servicos-prof-select-all--toolbar">
            <input
              type="checkbox"
              class="servico-prof-vinculo-card__checkbox"
              tabindex="-1"
              aria-hidden="true"
            />
            Selecionar itens
          </button>
        </div>

        <div class="servicos-prof-grid">
          <ServicoProfissionalVinculoCard
            v-for="prof in profissionaisVinculados"
            :key="prof.profissionalId"
            :nome="prof.nomePublico"
            :nota-media="prof.notaMedia"
            :total-avaliacoes="prof.totalAvaliacoes"
            show-remove
          />
          <button type="button" class="servico-prof-add-btn" aria-label="Adicionar profissional">
            <ServicoIcons name="plus" class="size-10" />
          </button>
        </div>
      </div>

      <!-- Profissionais — modo seleção -->
      <div v-else-if="telaAtiva === 'profissionais-selecao'" :class="SERVICOS_PAGE_CLASS">
        <ServicoPageHeader
          :title="MOCK_SERVICO_BUZZ_CUT.nome"
          :meta-preco="formatCurrency(MOCK_SERVICO_BUZZ_CUT.precoBase)"
          :meta-duracao="formatDuracaoMinutos(MOCK_SERVICO_BUZZ_CUT.duracaoMinutos)"
        >
          <template #actions>
            <button type="button" class="servicos-btn-outline servicos-btn-outline--md">
              <ServicoIcons name="profissionais" />
              Adicionar profissionais
            </button>
            <button type="button" class="servicos-btn-primary servicos-btn-primary--header">
              Salvar alteração
            </button>
          </template>
        </ServicoPageHeader>

        <div class="servicos-prof-toolbar">
          <button type="button" class="servicos-prof-select-all servicos-prof-select-all--toolbar">
            <input
              type="checkbox"
              class="servico-prof-vinculo-card__checkbox"
              checked
              tabindex="-1"
              aria-hidden="true"
            />
            Selecionar itens
          </button>
          <button type="button" class="servicos-btn-delete">
            <ServicoIcons name="delete" />
            Excluir
          </button>
          <button type="button" class="servicos-prof-select-all">
            <input
              type="checkbox"
              class="servico-prof-vinculo-card__checkbox"
              tabindex="-1"
              aria-hidden="true"
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
            selectable
            :selected="selecionadosBulk.includes(prof.profissionalId)"
          />
        </div>
      </div>

      <!-- Modal -->
      <div v-else-if="telaAtiva === 'modal'" :class="SERVICOS_PAGE_CLASS">
        <ServicoPageHeader
          title="Novo serviço"
          subtitle="Cadastre um novo serviço oferecido pelo estabelecimento."
          :back-to="ROUTE_PATHS.DEV_SERVICOS_FIGMA"
          back-label="Voltar à listagem"
        />

        <form class="servicos-form-panel opacity-40" @submit.prevent>
          <div class="servicos-form-panel__fields">
            <div class="servicos-form-field">
              <label class="servicos-form-label">Serviço</label>
              <input type="text" class="servicos-form-input" value="Corte Buzz Cut com fade" readonly />
            </div>
          </div>
        </form>

        <p class="mt-4 font-urbanist text-sm text-glow-text-subtle">
          O modal abre automaticamente nesta tela. Use os botões do rodapé para testar interação.
        </p>

        <button
          type="button"
          class="servicos-btn-outline mt-4"
          @click="modalAberto = true"
        >
          Reabrir modal
        </button>

        <ServicoProfissionalSelectModal
          v-model="modalAberto"
          :profissionais="MOCK_EQUIPE_FIGMA"
          :selected-ids="profissionaisModalIds"
          @confirm="profissionaisModalIds = $event"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.dev-servicos-preview__nav {
  position: sticky;
  top: 33px;
  z-index: 40;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  border-bottom: 1px solid var(--glow-border-soft);
  background: var(--glow-surface);
  padding: 0.75rem 1rem;
}

.dev-servicos-preview__nav-btn {
  border-radius: 0.5rem;
  border: 1px solid var(--glow-border-soft);
  background: var(--glow-hover-surface);
  padding: 0.375rem 0.75rem;
  font-family: Urbanist, sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--glow-text);
  transition: background 0.15s;
}

.dev-servicos-preview__nav-btn:hover {
  filter: brightness(0.98);
}

.dev-servicos-preview__nav-btn--active {
  border-color: var(--glow-gold);
  background: rgba(255, 191, 0, 0.15);
  font-weight: 600;
}

.dev-servicos-preview__stage {
  width: 100%;
  max-width: 100rem;
  margin: 0 auto;
  padding: 1rem 1rem 2rem;
}

@media (min-width: 1024px) {
  .dev-servicos-preview__stage {
    padding: 1.5rem 1.5rem 2.5rem;
  }
}
</style>

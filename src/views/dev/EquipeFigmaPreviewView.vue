<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EquipeAdicionarModal from '@/components/equipe/EquipeAdicionarModal.vue'
import EquipeEmptySlotCard from '@/components/equipe/EquipeEmptySlotCard.vue'
import EquipeIcons from '@/components/equipe/EquipeIcons.vue'
import EquipeMemberCard from '@/components/equipe/EquipeMemberCard.vue'
import EquipeMembroDetalheModal from '@/components/equipe/EquipeMembroDetalheModal.vue'
import EquipePageHeader from '@/components/equipe/EquipePageHeader.vue'
import { EQUIPE_PAGE_CLASS } from '@/constants/designTokens'
import { EQUIPE_ADICIONAR_ACOES } from '@/constants/equipeAdicionarAcoes'
import { ROUTE_PATHS } from '@/constants/routes'
import { MOCK_MEMBROS_EQUIPE_FIGMA } from '@/mocks/equipeFigmaMock'
import type { MembroEquipeItem } from '@/types/negocio/equipe.types'
import type { ModoCadastro } from '@/composables/useEquipeAdicionarForm'

const TELAS = [
  { id: 'listagem', label: 'Listagem' },
  { id: 'empty', label: 'Empty state' },
  { id: 'detalhe', label: 'Detalhe do membro' },
  { id: 'convites-empty', label: 'Links enviados — vazio' },
  { id: 'modal-convite', label: 'Modal — Gerar convite' },
  { id: 'modal-link', label: 'Modal — Copiar link' },
  { id: 'modal-criar', label: 'Modal — Cadastrar manualmente' },
] as const

type TelaId = (typeof TELAS)[number]['id']

const route = useRoute()
const router = useRouter()

const telaAtiva = computed<TelaId>(() => {
  const tela = route.query.tela
  const id = typeof tela === 'string' ? tela : 'listagem'
  return TELAS.some((item) => item.id === id) ? (id as TelaId) : 'listagem'
})

const menuAberto = ref(false)
const modalAberto = ref(false)
const modalModo = ref<ModoCadastro>('convite')

const detalheAberto = ref(false)
const slotsVazios = 3

const membroDetalheMock = computed<MembroEquipeItem>(() => ({
  id: 'usuario-1',
  tipo: 'usuario',
  nome: MOCK_MEMBROS_EQUIPE_FIGMA[0]!.nome,
  cargo: MOCK_MEMBROS_EQUIPE_FIGMA[0]!.cargo,
  role: 'Owner',
  email: MOCK_MEMBROS_EQUIPE_FIGMA[0]!.email,
  telefone: MOCK_MEMBROS_EQUIPE_FIGMA[0]!.telefone,
  ativo: true,
  usuarioId: 1,
}))

function irTela(id: TelaId) {
  void router.replace({ path: ROUTE_PATHS.DEV_EQUIPE_FIGMA, query: { tela: id } })
}

function abrirModal(modo: ModoCadastro) {
  modalModo.value = modo
  modalAberto.value = true
  menuAberto.value = false
}

watch(
  telaAtiva,
  (tela) => {
    if (tela === 'modal-convite') {
      modalModo.value = 'convite'
      modalAberto.value = true
    } else if (tela === 'modal-criar') {
      modalModo.value = 'criar'
      modalAberto.value = true
    } else if (tela === 'modal-link') {
      modalModo.value = 'convite'
      modalAberto.value = true
    } else if (tela === 'detalhe') {
      detalheAberto.value = true
      modalAberto.value = false
    } else {
      modalAberto.value = false
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="dev-equipe-preview">
    <nav class="dev-equipe-preview__nav" aria-label="Telas do preview Figma">
      <button
        v-for="tela in TELAS"
        :key="tela.id"
        type="button"
        class="dev-equipe-preview__nav-btn"
        :class="{ 'dev-equipe-preview__nav-btn--active': telaAtiva === tela.id }"
        @click="irTela(tela.id)"
      >
        {{ tela.label }}
      </button>
    </nav>

    <div class="dev-equipe-preview__stage">
      <!-- Listagem -->
      <div v-if="telaAtiva === 'listagem'" :class="EQUIPE_PAGE_CLASS">
        <EquipePageHeader
          title="Equipe"
          subtitle="Pessoas que fazem parte do negócio."
        >
          <template #actions>
            <div class="relative" data-equipe-add-menu>
              <button
                type="button"
                class="equipe-btn-primary equipe-btn-primary--add"
                @click.stop="menuAberto = !menuAberto"
              >
                <EquipeIcons name="plus" />
                Adicionar membros
              </button>
              <div v-if="menuAberto" class="equipe-add-menu">
                <button
                  v-for="acao in EQUIPE_ADICIONAR_ACOES"
                  :key="acao.modo"
                  type="button"
                  class="equipe-add-menu__item"
                  @click="abrirModal(acao.modo)"
                >
                  <span class="equipe-add-menu__title">{{ acao.titulo }}</span>
                  <span class="equipe-add-menu__desc">{{ acao.descricao }}</span>
                </button>
              </div>
            </div>
            <button type="button" class="equipe-btn-outline equipe-btn-outline--links">
              <EquipeIcons name="link" />
              Links enviados
            </button>
          </template>
        </EquipePageHeader>

        <div class="equipe-members-grid">
          <EquipeMemberCard
            v-for="membro in MOCK_MEMBROS_EQUIPE_FIGMA"
            :key="membro.id"
            :nome="membro.nome"
            :cargo="membro.cargo"
            :email="membro.email"
            :telefone="membro.telefone"
          />
          <EquipeEmptySlotCard v-for="n in slotsVazios" :key="`slot-${n}`" />
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="telaAtiva === 'empty'" :class="EQUIPE_PAGE_CLASS">
        <EquipePageHeader
          title="Equipe"
          subtitle="Pessoas que fazem parte do negócio."
        >
          <template #actions>
            <button type="button" class="equipe-btn-primary equipe-btn-primary--add">
              <EquipeIcons name="plus" />
              Adicionar membros
            </button>
            <button type="button" class="equipe-btn-outline equipe-btn-outline--links">
              <EquipeIcons name="link" />
              Links enviados
            </button>
          </template>
        </EquipePageHeader>

        <div class="equipe-empty-state">
          <h2 class="equipe-empty-state__title">Ninguém na equipe ainda</h2>
          <p class="equipe-empty-state__description">
            Adicione quem faz parte do negócio para começar a organizar a operação.
          </p>
          <button type="button" class="equipe-btn-primary equipe-btn-primary--add">
            <EquipeIcons name="plus" />
            Adicionar membros
          </button>
        </div>
      </div>

      <!-- Links enviados vazio -->
      <div v-else-if="telaAtiva === 'convites-empty'" :class="EQUIPE_PAGE_CLASS">
        <EquipePageHeader
          title="Links enviados"
          subtitle="Pessoas que ainda não entraram na equipe. Aguardando aceitar o link."
        >
          <template #actions>
            <button type="button" class="equipe-btn-primary equipe-btn-primary--add">
              Gerar convite
            </button>
            <button type="button" class="equipe-btn-outline equipe-btn-outline--links">
              Voltar à equipe
            </button>
          </template>
        </EquipePageHeader>

        <div class="equipe-empty-state">
          <h2 class="equipe-empty-state__title">Nenhum convite pendente</h2>
          <p class="equipe-empty-state__description">
            Envie um convite pela equipe para ver a listagem aqui.
          </p>
        </div>
      </div>

      <!-- Detalhe do membro -->
      <div v-else-if="telaAtiva === 'detalhe'" :class="EQUIPE_PAGE_CLASS" class="opacity-60">
        <EquipePageHeader title="Equipe" subtitle="Pessoas que fazem parte do negócio." />
        <div class="equipe-members-grid">
          <EquipeMemberCard
            v-for="membro in MOCK_MEMBROS_EQUIPE_FIGMA"
            :key="membro.id"
            :nome="membro.nome"
            :cargo="membro.cargo"
            :email="membro.email"
            :telefone="membro.telefone"
            interactive
          />
        </div>
        <button type="button" class="equipe-btn-outline mt-4" @click="detalheAberto = true">
          Reabrir detalhe
        </button>
        <EquipeMembroDetalheModal
          v-model="detalheAberto"
          :membro="membroDetalheMock"
          :estabelecimento-id="1"
          :pode-gerenciar-equipe="true"
          :pode-gerenciar-profissional="true"
          :usuario-atual-id="2"
        />
      </div>

      <!-- Modais (listagem de fundo + overlay) -->
      <div
        v-else-if="telaAtiva === 'modal-convite' || telaAtiva === 'modal-link' || telaAtiva === 'modal-criar'"
        :class="EQUIPE_PAGE_CLASS"
        class="opacity-60"
      >
        <EquipePageHeader
          title="Equipe"
          subtitle="Pessoas que fazem parte do negócio."
        />
        <div class="equipe-members-grid">
          <EquipeMemberCard
            v-for="membro in MOCK_MEMBROS_EQUIPE_FIGMA"
            :key="membro.id"
            :nome="membro.nome"
            :cargo="membro.cargo"
            :email="membro.email"
            :telefone="membro.telefone"
          />
          <EquipeEmptySlotCard v-for="n in slotsVazios" :key="`slot-${n}`" />
        </div>

        <p class="mt-4 font-urbanist text-sm text-glow-text-subtle">
          O modal abre automaticamente nesta tela. Use os botões abaixo para reabrir.
        </p>
        <button
          type="button"
          class="equipe-btn-outline mt-4"
          @click="modalAberto = true"
        >
          Reabrir modal
        </button>
      </div>
    </div>

    <EquipeAdicionarModal
      v-if="telaAtiva !== 'modal-link'"
      v-model="modalAberto"
      :modo="modalModo"
    />

    <!-- Estado "Copiar link" — preview estático sem API -->
    <Teleport v-if="telaAtiva === 'modal-link' && modalAberto" to="body">
      <div class="equipe-modal-overlay" @click.self="modalAberto = false">
        <div class="equipe-modal" role="dialog" aria-modal="true">
          <div class="equipe-modal__header">
            <div class="equipe-modal__header-top">
              <h2 class="equipe-modal__title">Gerar convite</h2>
              <button
                type="button"
                class="equipe-modal__close-icon"
                aria-label="Fechar"
                @click="modalAberto = false"
              >
                <EquipeIcons name="close" />
              </button>
            </div>
            <p class="equipe-modal__subtitle">
              O usuário recebe um link de convite. Se já possui conta, faz login e aceita. Caso
              contrário, realiza o cadastro e, em seguida, aceita o convite.
            </p>
          </div>

          <div class="equipe-modal__body">
            <div class="equipe-link-success">
              <p class="equipe-link-success__title">Link pronto!</p>
              <p class="equipe-link-success__text">
                Envie o link abaixo para o usuário para que ele possa aceitar. Lembre-se de colar o
                link em outra aba do navegador.
              </p>
              <p class="equipe-link-success__text">
                Também há a possibilidade do usuário aceitar o convite pelo e-mail; o destino é o
                mesmo.
              </p>
              <div class="equipe-link-success__url-box">
                <p class="equipe-link-success__url">
                  https://glow-up-connect-app-staging.up.railway.app/convites/Q8wvMM2RBBHxcxoWtHzJpNJPY88xrDty5pUFodc6um7z5qJ9XmSzT1taUSgPYP11uJpZmJj77m8EPkYuyepCvg
                </p>
                <button type="button" class="equipe-modal__confirm equipe-modal__confirm--copy">
                  Copiar link
                </button>
              </div>
            </div>
          </div>

          <div class="equipe-modal__footer">
            <button type="button" class="equipe-modal__dismiss" @click="modalAberto = false">
              Fechar
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.dev-equipe-preview__nav {
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

.dev-equipe-preview__nav-btn {
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

.dev-equipe-preview__nav-btn:hover {
  filter: brightness(0.98);
}

.dev-equipe-preview__nav-btn--active {
  border-color: #ffbf00;
  background: rgba(255, 191, 0, 0.15);
  font-weight: 600;
}

.dev-equipe-preview__stage {
  width: 100%;
  max-width: 100rem;
  margin: 0 auto;
  padding: 1rem 1rem 2rem;
}
</style>

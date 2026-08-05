<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import ContentAlert from '@/components/feedback/ContentAlert.vue'
import EquipeAdicionarModal from '@/components/equipe/EquipeAdicionarModal.vue'
import EquipeEmptySlotCard from '@/components/equipe/EquipeEmptySlotCard.vue'
import EquipeIcons from '@/components/equipe/EquipeIcons.vue'
import EquipeMemberCard from '@/components/equipe/EquipeMemberCard.vue'
import EquipeMembroDetalheModal from '@/components/equipe/EquipeMembroDetalheModal.vue'
import EquipePageHeader from '@/components/equipe/EquipePageHeader.vue'
import { EQUIPE_PAGE_CLASS } from '@/constants/designTokens'
import { EQUIPE_ADICIONAR_ACOES, normalizarModoAcao } from '@/constants/equipeAdicionarAcoes'
import { establishmentRoleLabel } from '@/constants/establishmentRoles'
import { ROUTE_PATHS } from '@/constants/routes'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useApiError } from '@/composables/useApiError'
import { equipeService } from '@/services/equipeService'
import { useUserStore } from '@/stores/user.store'
import type { ModoCadastro } from '@/composables/useEquipeAdicionarForm'
import type {
  EstablishmentUserRole,
  MembroEquipeItem,
  ProfissionalEquipe,
  UsuarioEquipe,
} from '@/types/negocio/equipe.types'
import { formatTelefone } from '@/utils/formatters'

const ROLE_ORDER: Record<EstablishmentUserRole | 'Profissional', number> = {
  Owner: 0,
  Admin: 1,
  Manager: 2,
  Receptionist: 3,
  Profissional: 4,
}

const route = useRoute()
const router = useRouter()
const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const { possuiPermissao } = useNegocioContext()
const { profile } = storeToRefs(useUserStore())
const { resolveError } = useApiError()

const usuarios = ref<UsuarioEquipe[]>([])
const profissionais = ref<ProfissionalEquipe[]>([])
const loading = ref(false)
const loadError = ref<string | null>(null)
const menuAberto = ref(false)
const modalAberto = ref(false)
const modalModo = ref<ModoCadastro>('convite')
const modalInitialRole = ref<EstablishmentUserRole | undefined>()
const detalheAberto = ref(false)
const membroSelecionado = ref<MembroEquipeItem | null>(null)

const podeGerenciarEquipe = computed(() => possuiPermissao('EquipeGerenciar'))
const podeGerenciarProfissional = computed(() => possuiPermissao('ProfissionalGerenciar'))
const podeAbrirDetalhe = computed(() => podeGerenciarEquipe.value || podeGerenciarProfissional.value)

const membros = computed<MembroEquipeItem[]>(() => {
  const items: MembroEquipeItem[] = []
  const usuarioIds = new Set<number>()
  const profissionalPorUsuarioId = new Map<number, ProfissionalEquipe>()

  for (const p of profissionais.value) {
    if (p.usuarioId) profissionalPorUsuarioId.set(p.usuarioId, p)
  }

  for (const u of usuarios.value) {
    usuarioIds.add(u.usuarioId)
    const prof = profissionalPorUsuarioId.get(u.usuarioId)
    items.push({
      id: `usuario-${u.id}`,
      tipo: 'usuario',
      nome: u.nome,
      cargo: establishmentRoleLabel(u.role),
      role: u.role,
      email: u.email || undefined,
      telefone: u.telefone ? formatTelefone(u.telefone) : undefined,
      ativo: u.ativo,
      usuarioId: u.usuarioId,
      profissionalId: prof?.profissionalId,
      podeReceberAgendamento: prof?.podeReceberAgendamento,
    })
  }

  for (const p of profissionais.value) {
    if (usuarioIds.has(p.usuarioId)) continue
    items.push({
      id: `profissional-${p.id}`,
      tipo: 'profissional',
      nome: p.nomePublico,
      cargo: establishmentRoleLabel('Profissional'),
      role: 'Profissional',
      email: p.email || undefined,
      telefone: p.telefone ? formatTelefone(p.telefone) : undefined,
      ativo: p.ativo,
      usuarioId: p.usuarioId,
      profissionalId: p.profissionalId,
      podeReceberAgendamento: p.podeReceberAgendamento,
    })
  }

  return items.sort((a, b) => {
    const byRole = ROLE_ORDER[a.role] - ROLE_ORDER[b.role]
    if (byRole !== 0) return byRole
    return a.nome.localeCompare(b.nome, 'pt-BR')
  })
})

const slotsVazios = computed(() => {
  const total = membros.value.length
  if (total === 0) return 0
  const resto = total % 3
  const completarLinha = resto === 0 ? 0 : 3 - resto
  return completarLinha + 3
})

function abrirModal(modo: ModoCadastro) {
  modalModo.value = modo
  modalAberto.value = true
  menuAberto.value = false
}

function abrirDetalhe(membro: MembroEquipeItem) {
  if (!podeAbrirDetalhe.value) return
  membroSelecionado.value = membro
  detalheAberto.value = true
}

function fecharMenuAoClicarFora(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (!target?.closest('[data-equipe-add-menu]')) {
    menuAberto.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', fecharMenuAoClicarFora)
  abrirModalPorQuery()
})

onUnmounted(() => {
  document.removeEventListener('click', fecharMenuAoClicarFora)
})

function parseAcaoQuery(): ModoCadastro | null {
  return normalizarModoAcao(route.query.acao ?? route.query.modo)
}

function parseRoleQuery(): EstablishmentUserRole | undefined {
  return route.query.role === 'Profissional' ? 'Profissional' : undefined
}

function abrirModalPorQuery() {
  const acao = parseAcaoQuery()
  if (!acao || !ready.value) return
  modalInitialRole.value = parseRoleQuery()
  abrirModal(acao)
  void router.replace({ path: ROUTE_PATHS.CONFIG_EQUIPE, query: {} })
}

watch(ready, (isReady) => {
  if (isReady) abrirModalPorQuery()
})

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  loadError.value = null
  try {
    const [u, p] = await Promise.all([
      equipeService.listarUsuarios(estabelecimentoId.value),
      equipeService.listarProfissionais(estabelecimentoId.value),
    ])
    usuarios.value = u
    profissionais.value = p
  } catch (err) {
    loadError.value = resolveError(err, 'Não foi possível carregar a equipe.')
  } finally {
    loading.value = false
  }
}

watch(ready, (isReady) => {
  if (isReady) void load()
}, { immediate: true })
</script>

<template>
  <div :class="EQUIPE_PAGE_CLASS">
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
        <RouterLink :to="ROUTE_PATHS.CONFIG_EQUIPE_CONVITES" class="equipe-btn-outline equipe-btn-outline--links">
          <EquipeIcons name="link" />
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

    <div
      v-if="!contextLoading && !loading && membros.length === 0"
      class="equipe-empty-state"
    >
      <h2 class="equipe-empty-state__title">Ninguém na equipe ainda</h2>
      <p class="equipe-empty-state__description">
        Adicione quem faz parte do negócio para começar a organizar a operação.
      </p>
      <button type="button" class="equipe-btn-primary equipe-btn-primary--add" @click="abrirModal('convite')">
        <EquipeIcons name="plus" />
        Adicionar membros
      </button>
    </div>

    <div v-else class="equipe-members-grid">
      <EquipeMemberCard
        v-for="membro in membros"
        :key="membro.id"
        :nome="membro.nome"
        :cargo="membro.cargo"
        :email="membro.email"
        :telefone="membro.telefone"
        :ativo="membro.ativo"
        :interactive="podeAbrirDetalhe"
        @click="abrirDetalhe(membro)"
      />
      <EquipeEmptySlotCard v-for="n in slotsVazios" :key="`slot-${n}`" />
    </div>

    <EquipeAdicionarModal
      v-model="modalAberto"
      :modo="modalModo"
      :initial-role="modalInitialRole"
      @vinculado="load"
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

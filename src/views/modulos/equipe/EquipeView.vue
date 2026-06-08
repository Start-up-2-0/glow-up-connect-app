<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import ContentAlert from '@/components/feedback/ContentAlert.vue'
import EquipeAdicionarModal from '@/components/equipe/EquipeAdicionarModal.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useApiError } from '@/composables/useApiError'
import { equipeService } from '@/services/equipeService'
import type { ProfissionalEquipe, UsuarioEquipe } from '@/types/negocio/equipe.types'
import type { ModoCadastro } from '@/composables/useEquipeAdicionarForm'
import { EQUIPE_ADICIONAR_ACOES, normalizarModoAcao } from '@/constants/equipeAdicionarAcoes'
import { ROUTE_PATHS } from '@/constants/routes'
import { establishmentRoleLabel } from '@/constants/establishmentRoles'
import { formatTelefone } from '@/utils/formatters'

const route = useRoute()
const router = useRouter()
const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const { resolveError } = useApiError()

const aba = ref<'usuarios' | 'profissionais'>('usuarios')
const usuarios = ref<UsuarioEquipe[]>([])
const profissionais = ref<ProfissionalEquipe[]>([])
const loading = ref(false)
const loadError = ref<string | null>(null)
const menuAberto = ref(false)
const modalAberto = ref(false)
const modalModo = ref<ModoCadastro>('convite')

function abrirModal(modo: ModoCadastro) {
  modalModo.value = modo
  modalAberto.value = true
  menuAberto.value = false
}

async function aoVincular() {
  await load()
}

function parseAcaoQuery(): ModoCadastro | null {
  return normalizarModoAcao(route.query.acao ?? route.query.modo)
}

function abrirModalPorQuery() {
  const acao = parseAcaoQuery()
  if (!acao || !ready.value) return

  if (route.query.role === 'Profissional') {
    aba.value = 'profissionais'
  }

  abrirModal(acao)
  void router.replace({ path: ROUTE_PATHS.CONFIG_EQUIPE, query: {} })
}

onMounted(() => {
  abrirModalPorQuery()
})

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

watch(ready, (isReady) => { if (isReady) void load() }, { immediate: true })
</script>

<template>
  <div class="space-y-4 lg:space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="font-satoshi text-xl font-bold leading-tight text-glow-text lg:text-2xl">
          Equipe
        </h1>
        <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
          Pessoas que trabalham com você no negócio.
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <div class="relative">
          <BaseButton
            variant="primary"
            size="sm"
            @click="menuAberto = !menuAberto"
          >
            Adicionar pessoa
          </BaseButton>
          <div
            v-if="menuAberto"
            class="absolute right-0 z-20 mt-1 w-[min(100vw-2rem,18rem)] rounded-lg border border-glow-border-soft bg-glow-surface py-1 shadow-lg"
          >
            <button
              v-for="acao in EQUIPE_ADICIONAR_ACOES"
              :key="acao.modo"
              type="button"
              class="block w-full px-4 py-3 text-left transition hover:bg-glow-hover-surface"
              @click="abrirModal(acao.modo)"
            >
              <span class="block font-urbanist text-sm font-semibold text-glow-text">
                {{ acao.titulo }}
              </span>
              <span class="mt-0.5 block font-urbanist text-xs leading-snug text-glow-text-subtle">
                {{ acao.descricao }}
              </span>
            </button>
          </div>
        </div>
        <RouterLink :to="ROUTE_PATHS.CONFIG_EQUIPE_CONVITES">
          <BaseButton variant="secondary" size="sm">Links enviados</BaseButton>
        </RouterLink>
      </div>
    </div>

    <ContentAlert v-if="contextError" variant="error" title="Não foi possível continuar">
      {{ contextError }}
    </ContentAlert>

    <div class="flex gap-2 border-b border-glow-border-soft">
      <button
        type="button"
        class="border-b-2 px-4 py-2 font-urbanist text-sm font-medium transition-colors"
        :class="
          aba === 'usuarios'
            ? 'border-glow-gold text-glow-text'
            : 'border-transparent text-glow-text-subtle hover:text-glow-text'
        "
        @click="aba = 'usuarios'"
      >
        Usuários
      </button>
      <button
        type="button"
        class="border-b-2 px-4 py-2 font-urbanist text-sm font-medium transition-colors"
        :class="
          aba === 'profissionais'
            ? 'border-glow-gold text-glow-text'
            : 'border-transparent text-glow-text-subtle hover:text-glow-text'
        "
        @click="aba = 'profissionais'"
      >
        Profissionais
      </button>
    </div>

    <ContentAlert
      v-if="loadError"
      variant="error"
      title="Erro ao carregar dados"
      compact
    >
      {{ loadError }}
    </ContentAlert>

    <LoadingSpinner v-if="contextLoading || loading" />

    <template v-else-if="aba === 'usuarios'">
      <BaseCard v-if="usuarios.length === 0">
        <EmptyState title="Ninguém na equipe ainda" description="Adicione quem vai ajudar no dia a dia do negócio.">
          <template #action>
            <BaseButton variant="primary" size="sm" class="mt-3" @click="abrirModal('convite')">
              Adicionar pessoa
            </BaseButton>
          </template>
        </EmptyState>
      </BaseCard>
      <div v-else class="space-y-2">
        <div
          v-for="u in usuarios"
          :key="u.id"
          class="rounded-lg border border-glow-border-soft bg-glow-surface p-4"
        >
          <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="font-urbanist text-sm font-semibold text-glow-text">{{ u.nome }}</p>
            <span class="font-urbanist text-xs text-glow-text-subtle">
              {{ establishmentRoleLabel(u.role) }}
            </span>
          </div>
          <p class="mt-1 font-urbanist text-xs text-glow-text-subtle">{{ u.email }}</p>
          <p class="font-urbanist text-xs text-glow-text-subtle">
            {{ formatTelefone(u.telefone) }}
          </p>
        </div>
      </div>
    </template>

    <template v-else>
      <BaseCard v-if="profissionais.length === 0">
        <EmptyState title="Nenhum profissional ainda" description="Adicione quem atende os clientes no salão ou barbearia.">
          <template #action>
            <BaseButton variant="primary" size="sm" class="mt-3" @click="abrirModal('convite')">
              Chamar profissional
            </BaseButton>
          </template>
        </EmptyState>
      </BaseCard>
      <div v-else class="space-y-2">
        <div
          v-for="p in profissionais"
          :key="p.id"
          class="rounded-lg border border-glow-border-soft bg-glow-surface p-4"
        >
          <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="font-urbanist text-sm font-semibold text-glow-text">{{ p.nomePublico }}</p>
            <span
              class="inline-flex rounded-full px-2 py-0.5 font-urbanist text-xs"
              :class="p.ativo ? 'bg-green-100 text-green-800' : 'bg-glow-canvas text-glow-text-subtle'"
            >
              {{ p.ativo ? 'Ativo' : 'Inativo' }}
            </span>
          </div>
          <p class="mt-1 font-urbanist text-xs text-glow-text-subtle">{{ p.email }}</p>
          <p class="font-urbanist text-xs text-glow-text-subtle">
            {{ p.podeReceberAgendamento ? 'Recebe agendamentos' : 'Não recebe agendamentos' }}
          </p>
        </div>
      </div>
    </template>

    <EquipeAdicionarModal
      v-model="modalAberto"
      :modo="modalModo"
      :initial-role="aba === 'profissionais' ? 'Profissional' : undefined"
      @vinculado="aoVincular"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import ContentAlert from '@/components/feedback/ContentAlert.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useApiError } from '@/composables/useApiError'
import { equipeService } from '@/services/equipeService'
import type { ProfissionalEquipe, UsuarioEquipe } from '@/types/negocio/equipe.types'
import { ROUTE_PATHS } from '@/constants/routes'
import { establishmentRoleLabel } from '@/constants/establishmentRoles'
import { formatTelefone } from '@/utils/formatters'

const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const { resolveError } = useApiError()

const aba = ref<'usuarios' | 'profissionais'>('usuarios')
const usuarios = ref<UsuarioEquipe[]>([])
const profissionais = ref<ProfissionalEquipe[]>([])
const loading = ref(false)
const loadError = ref<string | null>(null)

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
          Usuários e profissionais vinculados ao estabelecimento.
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <RouterLink v-if="aba === 'usuarios'" :to="ROUTE_PATHS.CONFIG_EQUIPE_USUARIO_NOVO">
          <BaseButton variant="primary" size="sm">Enviar convite</BaseButton>
        </RouterLink>
        <RouterLink :to="ROUTE_PATHS.CONFIG_EQUIPE_CONVITES">
          <BaseButton variant="secondary" size="sm">Convites</BaseButton>
        </RouterLink>
        <RouterLink
          v-if="aba === 'profissionais'"
          :to="{ path: ROUTE_PATHS.CONFIG_EQUIPE_USUARIO_NOVO, query: { role: 'Profissional' } }"
        >
          <BaseButton variant="primary" size="sm">Enviar convite</BaseButton>
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
        <EmptyState title="Nenhum usuário" description="Cadastre usuários da equipe.">
          <template #action>
            <RouterLink :to="ROUTE_PATHS.CONFIG_EQUIPE_USUARIO_NOVO" class="mt-3 inline-block">
              <BaseButton variant="primary" size="sm">Adicionar usuário</BaseButton>
            </RouterLink>
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
        <EmptyState title="Nenhum profissional" description="Convide profissionais para a equipe." />
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
  </div>
</template>

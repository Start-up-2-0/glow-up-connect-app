<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import CurrencyInput from '@/components/ui/CurrencyInput.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { servicoService } from '@/services/servicoService'
import { equipeService } from '@/services/equipeService'
import {
  ROUTE_PATHS,
  servicoEditarPath,
} from '@/constants/routes'
import type { Servico, ServicoProfissionalResumo } from '@/types/negocio/servico.types'
import type { ProfissionalEquipe } from '@/types/negocio/equipe.types'
import { formatCurrency, isValidCurrencyValue } from '@/utils/formatters'

interface ProfissionalVinculoState {
  profissionalId: number
  nomePublico: string
  vinculado: boolean
  preco: number
  duracaoMinutos: number
  vinculoExistente: ServicoProfissionalResumo | null
  dirty: boolean
}

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
const profissionais = ref<ProfissionalVinculoState[]>([])
const loading = ref(false)
const saving = ref(false)
const notFound = ref(false)

const temAlteracoes = computed(() => profissionais.value.some((p) => p.dirty))

function buildState(equipe: ProfissionalEquipe[], serv: Servico): ProfissionalVinculoState[] {
  return equipe
    .filter((p) => p.ativo)
    .map((p) => {
      const vinculo =
        serv.profissionais.find((v) => v.profissionalId === p.profissionalId && v.ativo) ?? null
      return {
        profissionalId: p.profissionalId,
        nomePublico: p.nomePublico,
        vinculado: vinculo !== null,
        preco: vinculo?.preco ?? serv.precoBase,
        duracaoMinutos: vinculo?.duracaoMinutos ?? serv.duracaoMinutos,
        vinculoExistente: vinculo,
        dirty: false,
      }
    })
}

function marcarDirty(item: ProfissionalVinculoState) {
  item.dirty = true
}

function onToggleVinculo(item: ProfissionalVinculoState) {
  if (item.vinculado && !item.vinculoExistente) {
    item.preco = servico.value?.precoBase ?? 0
    item.duracaoMinutos = servico.value?.duracaoMinutos ?? 30
  }
  marcarDirty(item)
}

async function load() {
  if (!estabelecimentoId.value || !servicoId.value) return
  loading.value = true
  notFound.value = false
  try {
    const [servicos, equipe] = await Promise.all([
      servicoService.listar(estabelecimentoId.value),
      equipeService.listarProfissionais(estabelecimentoId.value),
    ])
    const serv = servicos.find((s) => s.id === servicoId.value)
    if (!serv) {
      notFound.value = true
      return
    }
    servico.value = serv
    profissionais.value = buildState(equipe, serv)
  } catch (err) {
    notifications.push('error', resolveError(err, 'Não foi possível carregar os vínculos.'))
  } finally {
    loading.value = false
  }
}

function validarItem(item: ProfissionalVinculoState): string | null {
  if (!item.vinculado) return null
  if (!isValidCurrencyValue(item.preco)) return 'Preço inválido.'
  if (!Number.isFinite(item.duracaoMinutos) || item.duracaoMinutos < 1) {
    return 'Duração inválida.'
  }
  return null
}

async function salvarItem(item: ProfissionalVinculoState): Promise<void> {
  if (!estabelecimentoId.value || !servicoId.value) return
  const erro = validarItem(item)
  if (erro) throw new Error(erro)

  const estId = estabelecimentoId.value
  const svcId = servicoId.value
  const profId = item.profissionalId

  if (item.vinculado) {
    if (item.vinculoExistente) {
      await servicoService.atualizarVinculoProfissional(estId, svcId, profId, {
        preco: item.preco,
        duracaoMinutos: item.duracaoMinutos,
      })
    } else {
      await servicoService.vincularProfissional(estId, svcId, profId, {
        preco: item.preco,
        duracaoMinutos: item.duracaoMinutos,
      })
    }
  } else if (item.vinculoExistente) {
    await servicoService.desvincularProfissional(estId, svcId, profId)
  }
}

async function handleSalvar() {
  if (!estabelecimentoId.value || !servicoId.value) return
  const dirtyItems = profissionais.value.filter((p) => p.dirty)
  if (dirtyItems.length === 0) return

  for (const item of dirtyItems) {
    const erro = item.vinculado ? validarItem(item) : null
    if (erro) {
      notifications.push('error', `${item.nomePublico}: ${erro}`)
      return
    }
  }

  saving.value = true
  try {
    const results = await Promise.allSettled(dirtyItems.map((item) => salvarItem(item)))
    const falhas = results.filter((r) => r.status === 'rejected')
    if (falhas.length > 0) {
      const msg =
        falhas[0].status === 'rejected'
          ? resolveError(falhas[0].reason, 'Não foi possível salvar alguns vínculos.')
          : 'Não foi possível salvar alguns vínculos.'
      notifications.push('error', msg)
    }
    if (falhas.length < results.length) {
      notifications.push('success', 'Vínculos atualizados.')
    }
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

function editarServico() {
  if (!servicoId.value) return
  void router.push(servicoEditarPath(servicoId.value))
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
  <div class="space-y-4 lg:space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="font-satoshi text-xl font-bold leading-tight text-glow-text lg:text-2xl">
          Profissionais do serviço
        </h1>
        <p v-if="servico" class="mt-1 font-urbanist text-sm text-glow-text-subtle">
          {{ servico.nome }} · {{ formatCurrency(servico.precoBase) }} ·
          {{ servico.duracaoMinutos }} min
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <BaseButton variant="secondary" size="sm" @click="voltar">Voltar</BaseButton>
        <BaseButton v-if="servico" variant="secondary" size="sm" @click="editarServico">
          Editar serviço
        </BaseButton>
        <BaseButton
          variant="primary"
          size="sm"
          :loading="saving"
          :disabled="!temAlteracoes"
          @click="handleSalvar"
        >
          Salvar alterações
        </BaseButton>
      </div>
    </div>

    <p v-if="contextError" class="font-urbanist text-sm text-red-600">{{ contextError }}</p>

    <LoadingSpinner v-if="contextLoading || loading" />

    <BaseCard v-else-if="notFound" title="Serviço não encontrado">
      <p class="font-urbanist text-sm text-glow-text-subtle">
        O serviço solicitado não existe ou foi removido.
      </p>
      <div class="mt-4">
        <BaseButton variant="secondary" @click="voltar">Voltar à listagem</BaseButton>
      </div>
    </BaseCard>

    <BaseCard v-else-if="profissionais.length === 0">
      <EmptyState
        title="Nenhum profissional na equipe"
        description="Convide profissionais em Equipe antes de vincular serviços."
      />
    </BaseCard>

    <div v-else class="space-y-3">
      <div
        v-for="item in profissionais"
        :key="item.profissionalId"
        class="rounded-lg border border-glow-border-soft bg-glow-surface p-4"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <label class="flex cursor-pointer items-center gap-2">
            <input
              v-model="item.vinculado"
              type="checkbox"
              class="h-4 w-4 rounded border-glow-border-soft text-glow-gold focus:ring-glow-gold"
              @change="onToggleVinculo(item)"
            />
            <span class="font-urbanist text-base font-semibold text-glow-text">
              {{ item.nomePublico }}
            </span>
          </label>
          <span
            v-if="item.vinculoExistente && item.vinculado"
            class="font-urbanist text-xs text-glow-text-subtle"
          >
            Vinculado
          </span>
        </div>

        <div
          v-if="item.vinculado"
          class="mt-4 grid gap-4 border-t border-glow-border-soft pt-4 sm:grid-cols-2"
        >
          <CurrencyInput
            :model-value="item.preco"
            label="Preço neste profissional"
            hint="Deixe o valor do serviço ou personalize."
            @update:model-value="
              (v) => {
                item.preco = v
                marcarDirty(item)
              }
            "
          />
          <BaseInput
            :model-value="String(item.duracaoMinutos)"
            label="Duração (minutos)"
            type="number"
            min="1"
            @update:model-value="
              (v) => {
                item.duracaoMinutos = Number(v)
                marcarDirty(item)
              }
            "
          />
        </div>
      </div>
    </div>
  </div>
</template>

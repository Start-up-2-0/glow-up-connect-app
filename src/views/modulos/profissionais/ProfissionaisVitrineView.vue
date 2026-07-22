<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { profissionalVitrineService } from '@/services/profissionalVitrineService'
import type { ProfissionalVitrine } from '@/types/negocio/profissionalVitrine.types'

const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const profissionais = ref<ProfissionalVitrine[]>([])
const loading = ref(false)
const saving = ref(false)
const togglingId = ref<number | null>(null)
const showForm = ref(false)
const editingId = ref<number | null>(null)

const nomePublico = ref('')
const biografia = ref('')
const logo = ref('')

function resetForm() {
  nomePublico.value = ''
  biografia.value = ''
  logo.value = ''
  editingId.value = null
  showForm.value = false
}

function iniciarEdicao(p: ProfissionalVitrine) {
  editingId.value = p.profissionalId
  nomePublico.value = p.nomePublico
  biografia.value = p.biografia
  logo.value = p.logo
  showForm.value = true
}

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  try {
    profissionais.value = await profissionalVitrineService.listar(estabelecimentoId.value)
  } catch (err) {
    notifications.push('error', resolveError(err, 'Não foi possível carregar os profissionais.'))
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  if (!estabelecimentoId.value) return
  const nome = nomePublico.value.trim()
  if (!nome) {
    notifications.push('error', 'Informe o nome público do profissional.')
    return
  }

  saving.value = true
  try {
    const payload = {
      nomePublico: nome,
      biografia: biografia.value.trim() || undefined,
      logo: logo.value.trim() || undefined,
    }

    if (editingId.value) {
      const atualizado = await profissionalVitrineService.atualizar(
        estabelecimentoId.value,
        editingId.value,
        payload,
      )
      profissionais.value = profissionais.value.map((p) =>
        p.profissionalId === atualizado.profissionalId ? atualizado : p,
      )
      notifications.push('success', 'Profissional atualizado.')
    } else {
      const criado = await profissionalVitrineService.cadastrar(estabelecimentoId.value, payload)
      profissionais.value = [...profissionais.value, criado]
      notifications.push('success', 'Profissional cadastrado na vitrine.')
    }
    resetForm()
  } catch (err) {
    notifications.push('error', resolveError(err, 'Não foi possível salvar o profissional.'))
  } finally {
    saving.value = false
  }
}

async function handleToggleStatus(p: ProfissionalVitrine) {
  if (!estabelecimentoId.value) return
  togglingId.value = p.profissionalId
  try {
    const atualizado = await profissionalVitrineService.atualizarStatus(
      estabelecimentoId.value,
      p.profissionalId,
      { ativo: !p.ativo },
    )
    profissionais.value = profissionais.value.map((item) =>
      item.profissionalId === atualizado.profissionalId ? atualizado : item,
    )
    notifications.push('success', atualizado.ativo ? 'Profissional ativado.' : 'Profissional inativado.')
  } catch (err) {
    notifications.push('error', resolveError(err, 'Não foi possível alterar o status.'))
  } finally {
    togglingId.value = null
  }
}

watch(ready, (isReady) => { if (isReady) void load() }, { immediate: true })
</script>

<template>
  <div class="space-y-4 lg:space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="font-satoshi text-xl font-bold leading-tight text-glow-text lg:text-2xl">
          Profissionais
        </h1>
        <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
          Profissional aparece na vitrine da loja. Você pode agendar por ele na agenda interna.
          Ele não acessa o app.
        </p>
      </div>
      <BaseButton
        v-if="ready && !showForm"
        variant="primary"
        size="sm"
        @click="showForm = true"
      >
        Adicionar profissional
      </BaseButton>
    </div>

    <p v-if="contextError" class="font-urbanist text-sm text-red-600">{{ contextError }}</p>

    <BaseCard v-if="showForm" :title="editingId ? 'Editar profissional' : 'Novo profissional'">
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <BaseInput
          v-model="nomePublico"
          label="Nome público"
          required
          placeholder="Como aparece para os clientes"
        />
        <BaseInput
          v-model="biografia"
          label="Biografia"
          placeholder="Opcional — breve descrição"
        />
        <BaseInput
          v-model="logo"
          label="URL da foto"
          placeholder="Opcional — link da imagem"
        />
        <div class="flex flex-wrap gap-3">
          <BaseButton type="submit" :loading="saving">
            {{ editingId ? 'Salvar' : 'Cadastrar' }}
          </BaseButton>
          <BaseButton type="button" variant="secondary" @click="resetForm">Cancelar</BaseButton>
        </div>
      </form>
    </BaseCard>

    <LoadingSpinner v-if="contextLoading || loading" />

    <template v-else-if="ready">
      <BaseCard v-if="profissionais.length === 0 && !showForm">
        <EmptyState
          title="Nenhum profissional na vitrine"
          description="Cadastre um profissional para exibir na página pública da loja."
        />
      </BaseCard>

      <div v-else class="space-y-3">
        <div
          v-for="p in profissionais"
          :key="p.id"
          class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-glow-border-soft bg-glow-surface px-4 py-3"
        >
          <div class="flex min-w-0 items-center gap-3">
            <div
              class="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-glow-canvas"
            >
              <img
                v-if="p.logo"
                :src="p.logo"
                :alt="p.nomePublico"
                class="size-full object-cover"
              />
              <span v-else class="font-satoshi text-lg font-bold text-glow-text-subtle">
                {{ p.nomePublico.charAt(0) }}
              </span>
            </div>
            <div class="min-w-0">
              <p class="font-urbanist text-sm font-medium text-glow-text">{{ p.nomePublico }}</p>
              <p v-if="p.biografia" class="truncate font-urbanist text-xs text-glow-text-subtle">
                {{ p.biografia }}
              </p>
              <span
                class="mt-1 inline-flex rounded-full px-2 py-0.5 font-urbanist text-xs"
                :class="p.ativo ? 'bg-green-100 text-green-800' : 'bg-glow-canvas text-glow-text-subtle'"
              >
                {{ p.ativo ? 'Ativo' : 'Inativo' }}
              </span>
            </div>
          </div>
          <div class="flex gap-2">
            <BaseButton variant="secondary" size="sm" @click="iniciarEdicao(p)">
              Editar
            </BaseButton>
            <BaseButton
              variant="secondary"
              size="sm"
              :loading="togglingId === p.profissionalId"
              @click="handleToggleStatus(p)"
            >
              {{ p.ativo ? 'Inativar' : 'Ativar' }}
            </BaseButton>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

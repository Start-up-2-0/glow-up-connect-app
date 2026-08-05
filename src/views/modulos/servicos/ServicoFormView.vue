<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CurrencyInput from '@/components/ui/CurrencyInput.vue'
import ServicoIcons from '@/components/servicos/ServicoIcons.vue'
import ServicoPageHeader from '@/components/servicos/ServicoPageHeader.vue'
import ServicoProfissionalChip from '@/components/servicos/ServicoProfissionalChip.vue'
import ServicoProfissionalSelectModal from '@/components/servicos/ServicoProfissionalSelectModal.vue'
import { SERVICOS_PAGE_CLASS } from '@/constants/designTokens'
import { ROUTE_NAMES, ROUTE_PATHS } from '@/constants/routes'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { equipeService } from '@/services/equipeService'
import { servicoService } from '@/services/servicoService'
import type { ProfissionalEquipe } from '@/types/negocio/equipe.types'
import { isValidCurrencyValue } from '@/utils/formatters'

const route = useRoute()
const router = useRouter()
const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const { possuiModulo } = useNegocioContext()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const isNovo = computed(() => route.name === ROUTE_NAMES.SERVICOS_NOVO)
const servicoId = computed(() => {
  if (isNovo.value) return null
  const id = Number(route.params.id)
  return Number.isFinite(id) ? id : null
})

const loading = ref(false)
const saving = ref(false)
const notFound = ref(false)
const modalProfissionaisAberto = ref(false)
const equipe = ref<ProfissionalEquipe[]>([])

const form = ref({
  nome: '',
  descricao: '',
  precoBase: 0,
  duracaoMinutos: 30,
})

const profissionaisSelecionados = ref<number[]>([])
const profissionaisIniciais = ref<number[]>([])

const errors = ref<{ nome?: string; precoBase?: string; duracaoMinutos?: string }>({})

const temModuloProfissionais = computed(() => possuiModulo('Profissionais'))
const pageTitle = computed(() => (isNovo.value ? 'Novo serviço' : 'Editar serviço'))
const pageSubtitle = computed(() =>
  isNovo.value
    ? 'Cadastre um novo serviço oferecido pelo estabelecimento.'
    : 'Atualize as informações do serviço.',
)

const profissionaisDisponiveis = computed(() =>
  equipe.value.filter((p) => p.ativo),
)

const profissionaisSelecionadosDetalhe = computed(() =>
  profissionaisDisponiveis.value.filter((p) =>
    profissionaisSelecionados.value.includes(p.profissionalId),
  ),
)

function validate(): boolean {
  const next: typeof errors.value = {}
  if (!form.value.nome.trim()) {
    next.nome = 'Nome é obrigatório.'
  }
  if (!isValidCurrencyValue(form.value.precoBase)) {
    next.precoBase = 'Informe um valor válido.'
  }
  const duracao = Number(form.value.duracaoMinutos)
  if (!Number.isFinite(duracao) || duracao < 1) {
    next.duracaoMinutos = 'Duração mínima de 1 minuto.'
  }
  errors.value = next
  return Object.keys(next).length === 0
}

async function loadEquipe() {
  if (!estabelecimentoId.value || !temModuloProfissionais.value) return
  try {
    equipe.value = await equipeService.listarProfissionais(estabelecimentoId.value)
  } catch (err) {
    notifications.push('error', resolveError(err, 'Não foi possível carregar a equipe.'))
  }
}

async function loadServico() {
  if (!estabelecimentoId.value || !servicoId.value) return
  loading.value = true
  notFound.value = false
  try {
    const servicos = await servicoService.listar(estabelecimentoId.value)
    const servico = servicos.find((s) => s.id === servicoId.value)
    if (!servico) {
      notFound.value = true
      return
    }
    form.value = {
      nome: servico.nome,
      descricao: servico.descricao ?? '',
      precoBase: servico.precoBase,
      duracaoMinutos: servico.duracaoMinutos,
    }
    const vinculados = servico.profissionais.filter((p) => p.ativo).map((p) => p.profissionalId)
    profissionaisSelecionados.value = [...vinculados]
    profissionaisIniciais.value = [...vinculados]
  } catch (err) {
    notifications.push('error', resolveError(err, 'Não foi possível carregar o serviço.'))
  } finally {
    loading.value = false
  }
}

async function sincronizarProfissionais(estId: number, svcId: number) {
  if (!temModuloProfissionais.value) return

  const atuais = new Set(profissionaisSelecionados.value)
  const iniciais = new Set(profissionaisIniciais.value)
  const payloadBase = {
    preco: form.value.precoBase,
    duracaoMinutos: Number(form.value.duracaoMinutos),
  }

  const paraVincular = [...atuais].filter((id) => !iniciais.has(id))
  const paraDesvincular = [...iniciais].filter((id) => !atuais.has(id))

  await Promise.all([
    ...paraVincular.map((profId) =>
      servicoService.vincularProfissional(estId, svcId, profId, payloadBase),
    ),
    ...paraDesvincular.map((profId) =>
      servicoService.desvincularProfissional(estId, svcId, profId),
    ),
  ])
}

async function handleSubmit() {
  if (!estabelecimentoId.value || !validate()) return
  saving.value = true
  try {
    const payload = {
      nome: form.value.nome.trim(),
      descricao: form.value.descricao?.trim() || undefined,
      precoBase: form.value.precoBase,
      duracaoMinutos: Number(form.value.duracaoMinutos),
    }

    let svcId = servicoId.value
    if (isNovo.value) {
      const criado = await servicoService.criar(estabelecimentoId.value, payload)
      svcId = criado.id
      notifications.push('success', 'Serviço criado.')
    } else if (svcId) {
      await servicoService.atualizar(estabelecimentoId.value, svcId, payload)
      notifications.push('success', 'Serviço atualizado.')
    }

    if (svcId) {
      await sincronizarProfissionais(estabelecimentoId.value, svcId)
    }

    await router.push(ROUTE_PATHS.SERVICOS)
  } catch (err) {
    notifications.push('error', resolveError(err, 'Não foi possível salvar o serviço.'))
  } finally {
    saving.value = false
  }
}

function voltar() {
  void router.push(ROUTE_PATHS.SERVICOS)
}

function removerProfissional(id: number) {
  profissionaisSelecionados.value = profissionaisSelecionados.value.filter((item) => item !== id)
}

function aplicarProfissionais(ids: number[]) {
  profissionaisSelecionados.value = ids
}

watch(
  ready,
  (isReady) => {
    if (!isReady) return
    void loadEquipe()
    if (!isNovo.value) {
      void loadServico()
    }
  },
  { immediate: true },
)
</script>

<template>
  <div :class="SERVICOS_PAGE_CLASS">
    <ServicoPageHeader
      :title="pageTitle"
      :subtitle="pageSubtitle"
      :back-to="ROUTE_PATHS.SERVICOS"
      back-label="Voltar à listagem"
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

    <form v-else-if="!contextLoading && !loading" class="servicos-form-panel" @submit.prevent="handleSubmit">
      <div class="servicos-form-panel__fields">
        <div class="servicos-form-field">
          <label class="servicos-form-label" for="servico-nome">Serviço</label>
          <input
            id="servico-nome"
            v-model="form.nome"
            type="text"
            class="servicos-form-input"
            :class="{ 'servicos-form-input--error': !!errors.nome }"
            placeholder="Ex: Corte Buzz Cut com fade"
            required
          />
          <p v-if="errors.nome" class="servicos-form-field__error">{{ errors.nome }}</p>
        </div>

        <div class="servicos-form-panel__row">
          <div class="servicos-form-field servico-form-currency">
            <CurrencyInput
              v-model="form.precoBase"
              label="Preço base"
              required
              :error="errors.precoBase"
            />
          </div>

          <div class="servicos-form-field">
            <label class="servicos-form-label" for="servico-duracao">Duração (em minutos)</label>
            <input
              id="servico-duracao"
              :value="String(form.duracaoMinutos)"
              type="number"
              min="1"
              class="servicos-form-input"
              :class="{ 'servicos-form-input--error': !!errors.duracaoMinutos }"
              placeholder="Ex: 30"
              @input="form.duracaoMinutos = Number(($event.target as HTMLInputElement).value)"
            />
            <p v-if="errors.duracaoMinutos" class="servicos-form-field__error">
              {{ errors.duracaoMinutos }}
            </p>
          </div>
        </div>

        <div class="servicos-form-field">
          <label class="servicos-form-label" for="servico-descricao">Descrição (opcional)</label>
          <input
            id="servico-descricao"
            v-model="form.descricao"
            type="text"
            class="servicos-form-input"
            placeholder="Corte de cabelo curto e raspado à máquina"
          />
        </div>

        <div v-if="temModuloProfissionais" class="servicos-form-field">
          <div class="servicos-form-profissionais-header">
            <label class="servicos-form-label">Profissionais</label>
            <button
              type="button"
              class="servicos-btn-outline"
              @click="modalProfissionaisAberto = true"
            >
              <ServicoIcons name="profissionais" />
              Selecionar profissionais
            </button>
          </div>

          <div
            class="servicos-form-profissionais-box"
            :class="{
              'servicos-form-profissionais-box--filled': profissionaisSelecionadosDetalhe.length > 0,
            }"
          >
            <p
              v-if="profissionaisSelecionadosDetalhe.length === 0"
              class="servicos-form-profissionais-placeholder"
            >
              Nenhum profissional selecionado.
            </p>
            <ServicoProfissionalChip
              v-for="prof in profissionaisSelecionadosDetalhe"
              :key="prof.profissionalId"
              :nome="prof.nomePublico"
              removable
              @remove="removerProfissional(prof.profissionalId)"
            />
          </div>
        </div>
      </div>

      <div class="servicos-form-actions">
        <button type="submit" class="servicos-btn-form-primary" :disabled="saving">
          {{ saving ? 'Salvando…' : 'Salvar' }}
        </button>
        <button type="button" class="servicos-btn-form-secondary" :disabled="saving" @click="voltar">
          Cancelar
        </button>
      </div>
    </form>

    <ServicoProfissionalSelectModal
      v-if="temModuloProfissionais"
      v-model="modalProfissionaisAberto"
      :profissionais="profissionaisDisponiveis"
      :selected-ids="profissionaisSelecionados"
      @confirm="aplicarProfissionais"
    />
  </div>
</template>

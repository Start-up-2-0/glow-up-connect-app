<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import BaseAlert from '@/components/feedback/BaseAlert.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import AgendarWizardStepper from '@/components/agendar/AgendarWizardStepper.vue'
import AgendarProfissionalCard from '@/components/agendar/AgendarProfissionalCard.vue'
import AgendarOpcaoCard from '@/components/agendar/AgendarOpcaoCard.vue'
import AgendarServicoCard from '@/components/agendar/AgendarServicoCard.vue'
import AgendarResumoFooter from '@/components/agendar/AgendarResumoFooter.vue'
import AgendarCalendario from '@/components/agendar/AgendarCalendario.vue'
import AgendarRevisaoStep from '@/components/agendar/AgendarRevisaoStep.vue'
import AgendarSucessoConfirmacao from '@/components/agendar/AgendarSucessoConfirmacao.vue'
import ClientePageHeader from '@/components/cliente/ClientePageHeader.vue'
import { useAgendarWizard } from '@/composables/useAgendarWizard'
import { useApiError } from '@/composables/useApiError'
import { useNotificationsStore } from '@/stores/notifications.store'
import { resolveAgendarFigmaStep } from '@/constants/agendarWizardSteps'
import { agendamentoDetalhePath, lojaDetalhePath, ROUTE_PATHS } from '@/constants/routes'
import {
  AGENDAR_BTN_CONTINUE_CLASS,
  AGENDAR_INTERNO_CONTENT_CLASS,
  AGENDAR_WIZARD_CONTENT_CLASS,
  GLOW_BUTTON_PRIMARY_CLASS,
  GLOW_INPUT_CLASS,
  GLOW_LABEL_CLASS,
} from '@/constants/designTokens'
import { authRouteWithRedirect } from '@/utils/authRedirect'
import {
  formatAgendaTime,
  formatCurrency,
  formatDateOnlyLong,
  formatDateOnlyMedium,
  toDateOnlyFromIsoUtc,
} from '@/utils/formatters'

const route = useRoute()
const router = useRouter()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const publicGuid = computed(() => String(route.params.publicGuid))
const profissionalPublicGuid = computed(() => {
  const fromQuery = route.query.profissional
  return typeof fromQuery === 'string' ? fromQuery : ''
})

const wizard = useAgendarWizard(publicGuid.value, profissionalPublicGuid.value)

const {
  step,
  modoIdentidade,
  modoProfissional,
  loading,
  submitting,
  error,
  contextoInvalido,
  agendamentoCriado,
  sucessoCadastroPendente,
  isVisitante,
  isModoInterno,
  profissionais,
  profissionalSelecionadoNome,
  estabelecimentoNome,
  activeProfissionalGuid,
  servicos,
  slotsDoDia,
  selectedServicoIds,
  selectedDate,
  selectedSlot,
  observacao,
  clienteNome,
  clienteEmail,
  clienteTelefone,
  cadastroSenha,
  selectedServicos,
  valorEstimado,
  duracaoTotal,
  toggleServico,
  escolherIdentidade,
  escolherModoProfissional,
  selecionarProfissional,
  continuarDeProfissional,
  voltarParaIdentidade,
  voltarDeProfissional,
  voltarDeServicos,
  voltarDeData,
  voltarDeHorario,
  voltarDeConfirmar,
  continuarDeContato,
  datasAtendimento,
  minSelectableDate,
  maxSelectableDate,
  selecionarData,
  goToData,
  goToHorario,
  goToConfirmar,
  confirmar,
  init,
  persistDraft,
} = wizard

const figmaStep = computed(() => resolveAgendarFigmaStep(step.value, isModoInterno.value))

const wizardContentClass = computed(() =>
  isModoInterno.value ? AGENDAR_INTERNO_CONTENT_CLASS : AGENDAR_WIZARD_CONTENT_CLASS,
)

const loginComRedirect = computed(() =>
  authRouteWithRedirect(ROUTE_PATHS.LOGIN, route.fullPath),
)

const showBack = computed(() => {
  if (step.value === 'identidade' || step.value === 'sucesso' || step.value === 'sucesso_cadastro') {
    return false
  }
  return true
})

const contatoValido = computed(
  () =>
    clienteNome.value.trim().length > 0
    && clienteEmail.value.trim().length > 0
    && clienteTelefone.value.trim().length > 0,
)

const showResumoFooter = computed(
  () => step.value === 'servicos' && selectedServicoIds.value.length > 0,
)

const isSuccessStep = computed(
  () => step.value === 'sucesso' || step.value === 'sucesso_cadastro',
)

const wizardAtivo = computed(
  () =>
    !contextoInvalido.value
    && (step.value === 'profissional'
      || step.value === 'identidade'
      || step.value === 'contato'
      || step.value === 'servicos'
      || step.value === 'data'
      || step.value === 'horario'
      || step.value === 'confirmar'
      || isSuccessStep.value),
)

const podeContinuarProfissional = computed(() => {
  if (modoProfissional.value === 'sem_preferencia') return true
  if (modoProfissional.value === 'especifico') return activeProfissionalGuid.value.length > 0
  return false
})

const sucessoProfissionalNome = computed(() => profissionalSelecionadoNome.value)

const sucessoServicosLabel = computed(() =>
  selectedServicos.value.map((servico) => servico.nome).join(', ') || '—',
)

const sucessoDataLabel = computed(() => {
  if (!agendamentoCriado.value) return '—'
  const isoDate = selectedDate.value || toDateOnlyFromIsoUtc(agendamentoCriado.value.inicio)
  return formatDateOnlyLong(isoDate)
})

const sucessoHorarioLabel = computed(() =>
  agendamentoCriado.value ? formatAgendaTime(agendamentoCriado.value.inicio) : '—',
)

const revisaoDataLabel = computed(() => formatDateOnlyLong(selectedDate.value))

const revisaoHorarioLabel = computed(() =>
  selectedSlot.value ? formatAgendaTime(selectedSlot.value.inicio) : '—',
)

const revisaoValorTotalLabel = computed(() => formatCurrency(valorEstimado.value))

const showRevisaoCliente = computed(
  () => isVisitante.value && (modoIdentidade.value === 'guest' || modoIdentidade.value === 'register'),
)

function profissionalIniciais(nome: string): string {
  const parts = nome.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

onMounted(async () => {
  try {
    await init()
  } catch (err) {
    error.value = resolveError(err)
  }
})

function handleBack() {
  if (step.value === 'contato') voltarParaIdentidade()
  else if (step.value === 'profissional') voltarDeProfissional()
  else if (step.value === 'servicos') voltarDeServicos()
  else if (step.value === 'data') voltarDeData()
  else if (step.value === 'horario') voltarDeHorario()
  else if (step.value === 'confirmar') voltarDeConfirmar()
}

function handleEscolherLogin() {
  persistDraft()
  router.push(loginComRedirect.value)
}

function handleEscolherRegister() {
  escolherIdentidade('register')
}

function handleEscolherGuest() {
  escolherIdentidade('guest')
}

async function handleContinuarDeContato() {
  try {
    await continuarDeContato()
  } catch (err) {
    error.value = resolveError(err)
  }
}

async function handleContinuarDeProfissional() {
  try {
    await continuarDeProfissional()
  } catch (err) {
    error.value = resolveError(err)
  }
}

async function handleNextFromServicos() {
  try {
    await goToData()
  } catch (err) {
    error.value = resolveError(err)
  }
}

function onSelecionarData(data: string) {
  void selecionarData(data, false)
}

async function handleContinuarDeData() {
  try {
    await goToHorario()
  } catch (err) {
    error.value = resolveError(err)
  }
}

async function handleConfirmar() {
  try {
    const agendamento = await confirmar()
    notifications.push('success', 'Agendamento criado com sucesso!')
    if (!isVisitante.value) {
      await router.push(agendamentoDetalhePath(agendamento.id))
    }
  } catch (err) {
    error.value = resolveError(err, 'Não foi possível criar o agendamento.')
  }
}
</script>

<template>
  <div class="space-y-6">
    <ClientePageHeader
      v-if="isModoInterno && !isSuccessStep"
      :back-to="lojaDetalhePath(publicGuid)"
      back-label="Voltar para detalhe da loja"
    />

    <div :class="isSuccessStep ? 'mx-auto w-full' : wizardContentClass">
      <BaseAlert v-if="contextoInvalido" variant="error" class="mb-6">
        Link de agendamento inválido. Solicite um novo link ao profissional.
      </BaseAlert>

      <BaseAlert v-else-if="error" variant="error" class="mb-6">{{ error }}</BaseAlert>

      <LoadingSpinner v-if="loading && step === 'profissional' && profissionais.length === 0" />

      <template v-else-if="wizardAtivo">
        <AgendarWizardStepper
          v-if="figmaStep.showStepper"
          :step-index="figmaStep.index"
          :step-label="figmaStep.label"
          :show-back="showBack"
          @back="handleBack"
        />

        <!-- Identificação -->
        <div v-if="step === 'identidade'" class="space-y-6">
          <div>
            <h1 class="agendar-section-title--identidade">Como deseja continuar?</h1>
            <p class="agendar-section-subtitle mt-2">
              Escolha a opção que melhor se encaixa para você.
            </p>
          </div>

          <div class="space-y-3">
            <AgendarOpcaoCard
              title="Entrar com a minha conta"
              description="Já possuo uma conta e desejo utilizá-la para realizar o meu agendamento."
              action-label="Entrar"
              @action="handleEscolherLogin"
            >
              <template #icon>
                <svg class="size-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <rect x="3" y="8" width="14" height="9" rx="1.5" stroke="currentColor" stroke-width="1.2" />
                  <path d="M7 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" stroke-width="1.2" />
                </svg>
              </template>
            </AgendarOpcaoCard>

            <AgendarOpcaoCard
              title="Criar conta e agendar"
              description="Crie sua conta gratuitamente e acompanhe seus agendamentos."
              action-label="Criar conta"
              @action="handleEscolherRegister"
            >
              <template #icon>
                <svg class="size-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <circle cx="8" cy="7" r="3" stroke="currentColor" stroke-width="1.2" />
                  <path d="M3 17c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" stroke-width="1.2" />
                  <path d="M15 6v4M13 8h4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
                </svg>
              </template>
            </AgendarOpcaoCard>

            <AgendarOpcaoCard
              title="Agendar sem conta"
              description="Faça seu agendamento rapidamente sem criar uma conta."
              action-label="Continuar sem conta"
              @action="handleEscolherGuest"
            >
              <template #icon>
                <svg class="size-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <circle cx="10" cy="7" r="3" stroke="currentColor" stroke-width="1.2" />
                  <path d="M4 17c0-2.8 2.7-5 6-5s6 2.2 6 5" stroke="currentColor" stroke-width="1.2" />
                </svg>
              </template>
            </AgendarOpcaoCard>
          </div>
        </div>

        <!-- Contato (guest) -->
        <div v-else-if="step === 'contato'" class="space-y-6">
          <h1 class="agendar-section-title">
            Preencha seus dados para continuar o agendamento
          </h1>

          <div class="space-y-6">
            <div>
              <label :class="GLOW_LABEL_CLASS" for="agendar-nome">Nome completo</label>
              <input
                id="agendar-nome"
                v-model="clienteNome"
                type="text"
                autocomplete="name"
                placeholder="Seu nome completo"
                :class="[GLOW_INPUT_CLASS, 'mt-2']"
              />
            </div>
            <div>
              <label :class="GLOW_LABEL_CLASS" for="agendar-email">E-mail</label>
              <input
                id="agendar-email"
                v-model="clienteEmail"
                type="email"
                autocomplete="email"
                placeholder="ex: usuario01@exemplo.com"
                :class="[GLOW_INPUT_CLASS, 'mt-2']"
              />
            </div>
            <div>
              <label :class="GLOW_LABEL_CLASS" for="agendar-telefone">Telefone</label>
              <input
                id="agendar-telefone"
                v-model="clienteTelefone"
                type="tel"
                autocomplete="tel"
                placeholder="(00) 0 0000-0000"
                :class="[GLOW_INPUT_CLASS, 'mt-2']"
              />
            </div>
          </div>

          <button
            type="button"
            :class="GLOW_BUTTON_PRIMARY_CLASS"
            :disabled="!contatoValido"
            @click="handleContinuarDeContato"
          >
            Continuar o agendamento
          </button>
        </div>

        <!-- Profissional -->
        <div v-else-if="step === 'profissional'" class="space-y-6">
          <p class="text-center font-urbanist text-base text-glow-text-subtle">
            Escolha um profissional ou deixe com a loja.
          </p>

          <div class="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              class="agendar-prof-modo-card"
              :class="{ 'agendar-prof-modo-card--selected': modoProfissional === 'especifico' }"
              @click="escolherModoProfissional('especifico')"
            >
              <div
                class="flex size-10 shrink-0 items-center justify-center rounded bg-glow-hover-surface text-glow-text"
                aria-hidden="true"
              >
                <svg class="size-6" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.2" />
                  <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="currentColor" stroke-width="1.2" />
                </svg>
              </div>
              <div class="min-w-0 text-left">
                <p class="font-urbanist text-sm font-semibold text-glow-text">Barbeiro específico</p>
                <p class="mt-1 font-urbanist text-xs text-glow-text-subtle">
                  Quero escolher quem vai me atender.
                </p>
              </div>
            </button>

            <button
              type="button"
              class="agendar-prof-modo-card"
              :class="{ 'agendar-prof-modo-card--selected': modoProfissional === 'sem_preferencia' }"
              @click="escolherModoProfissional('sem_preferencia')"
            >
              <div
                class="flex size-10 shrink-0 items-center justify-center rounded bg-glow-hover-surface text-glow-text"
                aria-hidden="true"
              >
                <svg class="size-6" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.2" />
                  <path d="M8 12h8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
                </svg>
              </div>
              <div class="min-w-0 text-left">
                <p class="font-urbanist text-sm font-semibold text-glow-text">Sem preferência</p>
                <p class="mt-1 font-urbanist text-xs text-glow-text-subtle">
                  A loja quem escolhe o profissional disponível.
                </p>
              </div>
            </button>
          </div>

          <div
            v-if="modoProfissional === 'especifico'"
            class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            <button
              v-for="prof in profissionais"
              :key="prof.publicGuid"
              type="button"
              class="agendar-prof-pick-card"
              :class="{ 'agendar-prof-pick-card--selected': activeProfissionalGuid === prof.publicGuid }"
              @click="selecionarProfissional(prof.publicGuid)"
            >
              <div
                class="flex size-10 shrink-0 items-center justify-center rounded-full bg-glow-text/10 font-urbanist text-sm font-semibold text-glow-text"
                aria-hidden="true"
              >
                {{ profissionalIniciais(prof.nomePublico) }}
              </div>
              <span class="font-urbanist text-sm font-medium text-glow-text">{{ prof.nomePublico }}</span>
            </button>
          </div>

          <p
            v-if="modoProfissional === 'especifico' && profissionais.length === 0"
            class="font-urbanist text-sm text-glow-text-subtle"
          >
            Nenhum profissional disponível para agendamento nesta loja.
          </p>

          <button
            type="button"
            :class="AGENDAR_BTN_CONTINUE_CLASS"
            :disabled="!podeContinuarProfissional || loading"
            @click="handleContinuarDeProfissional"
          >
            Continuar
          </button>
        </div>

        <!-- Serviços -->
        <div v-else-if="step === 'servicos'" class="space-y-5" :class="{ 'pb-36': showResumoFooter }">
          <AgendarProfissionalCard
            v-if="profissionalSelecionadoNome !== '—'"
            :nome="profissionalSelecionadoNome"
            :estabelecimento-nome="estabelecimentoNome"
          />

          <LoadingSpinner v-if="loading" />

          <template v-else>
            <h2 class="agendar-section-title">Selecione os serviços</h2>

            <p v-if="servicos.length === 0" class="font-urbanist text-sm text-glow-text-subtle">
              Nenhum serviço disponível no momento.
            </p>

            <div class="max-h-[420px] space-y-3 overflow-y-auto pr-1">
              <AgendarServicoCard
                v-for="servico in servicos"
                :key="servico.id"
                :nome="servico.nome"
                :descricao="servico.descricao"
                :duracao-minutos="servico.duracaoMinutosEstimada"
                :preco-minimo="servico.precoMinimo"
                :preco-maximo="servico.precoMaximo"
                :selected="selectedServicoIds.includes(servico.id)"
                @toggle="toggleServico(servico.id)"
              />
            </div>
          </template>

          <AgendarResumoFooter
            v-if="showResumoFooter"
            :servicos-count="selectedServicoIds.length"
            :duracao-total="duracaoTotal"
            :valor-total="valorEstimado"
            :loading="loading"
            @continuar="handleNextFromServicos"
          />
        </div>

        <!-- Data -->
        <div v-else-if="step === 'data'" class="space-y-6">
          <h2 class="agendar-section-title">
            Selecione um dia disponível para seu atendimento.
          </h2>

          <LoadingSpinner v-if="loading" />

          <p
            v-else-if="datasAtendimento.length === 0"
            class="font-urbanist text-sm text-glow-text-subtle"
          >
            Não há dias de atendimento disponíveis com os serviços selecionados.
          </p>

          <AgendarCalendario
            v-else
            :selected-date="selectedDate"
            :datas-permitidas="datasAtendimento"
            :min-date="minSelectableDate"
            :max-date="maxSelectableDate"
            :loading="loading"
            @select="onSelecionarData"
            @continuar="handleContinuarDeData"
          />
        </div>

        <!-- Horário -->
        <div v-else-if="step === 'horario'" class="space-y-6">
          <div>
            <h2 class="agendar-section-title">Selecione o horário desejado</h2>
            <p class="agendar-section-date mt-2">
              {{ formatDateOnlyMedium(selectedDate) }}
            </p>
          </div>

          <LoadingSpinner v-if="loading" />

          <p
            v-else-if="slotsDoDia.length === 0"
            class="font-urbanist text-sm text-glow-text-subtle"
          >
            Nenhum horário livre nesta data. Escolha outro dia disponível.
          </p>

          <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <button
              v-for="(slot, index) in slotsDoDia"
              :key="`${slot.inicio}-${index}`"
              type="button"
              class="agendar-slot-btn"
              :class="{ 'agendar-slot-btn--selected': selectedSlot?.inicio === slot.inicio }"
              @click="selectedSlot = slot"
            >
              {{ formatAgendaTime(slot.inicio) }}
            </button>
          </div>

          <button
            type="button"
            :class="AGENDAR_BTN_CONTINUE_CLASS"
            :disabled="!selectedSlot"
            @click="goToConfirmar()"
          >
            Continuar
          </button>
        </div>

        <!-- Revisão -->
        <AgendarRevisaoStep
          v-else-if="step === 'confirmar'"
          :show-cliente="showRevisaoCliente"
          :cliente-nome="clienteNome"
          :cliente-email="clienteEmail"
          :cliente-telefone="clienteTelefone"
          :profissional-nome="profissionalSelecionadoNome"
          :estabelecimento-nome="estabelecimentoNome"
          :servicos="selectedServicos"
          :data-label="revisaoDataLabel"
          :horario-label="revisaoHorarioLabel"
          :duracao-total="duracaoTotal"
          :valor-total-label="revisaoValorTotalLabel"
          :show-register-password="isVisitante && modoIdentidade === 'register'"
          :submitting="submitting"
          v-model:cadastro-senha="cadastroSenha"
          v-model:observacao="observacao"
          @confirm="handleConfirmar"
        />

        <!-- Sucesso cadastro -->
        <AgendarSucessoConfirmacao
          v-else-if="step === 'sucesso_cadastro' && agendamentoCriado"
          title="Conta e agendamento criados!"
          subtitle="Enviamos um e-mail de confirmação. Confirme sua conta para acompanhar seus agendamentos."
          :agendamento-id="agendamentoCriado.id"
          :profissional-nome="sucessoProfissionalNome"
          :servicos-label="sucessoServicosLabel"
          :data-label="sucessoDataLabel"
          :horario-label="sucessoHorarioLabel"
        >
          <RouterLink :to="ROUTE_PATHS.CONFIRM_EMAIL" class="w-full">
            <button type="button" :class="AGENDAR_BTN_CONTINUE_CLASS">
              Ir para confirmação de e-mail
            </button>
          </RouterLink>
        </AgendarSucessoConfirmacao>

        <!-- Sucesso -->
        <AgendarSucessoConfirmacao
          v-else-if="agendamentoCriado"
          title="Agendamento confirmado!"
          subtitle="Seu agendamento foi realizado com sucesso."
          :agendamento-id="agendamentoCriado.id"
          :profissional-nome="sucessoProfissionalNome"
          :servicos-label="sucessoServicosLabel"
          :data-label="sucessoDataLabel"
          :horario-label="sucessoHorarioLabel"
        >
          <template v-if="isVisitante && !sucessoCadastroPendente">
            <RouterLink :to="authRouteWithRedirect(ROUTE_PATHS.REGISTER, route.fullPath)" class="w-full">
              <button type="button" :class="AGENDAR_BTN_CONTINUE_CLASS">
                Criar conta
              </button>
            </RouterLink>
            <RouterLink :to="loginComRedirect" class="w-full">
              <button type="button" class="agendar-success__btn-secondary">
                Entrar
              </button>
            </RouterLink>
          </template>
          <RouterLink v-else :to="ROUTE_PATHS.MEUS_AGENDAMENTOS" class="w-full">
            <button type="button" :class="AGENDAR_BTN_CONTINUE_CLASS">
              Ver meus agendamentos
            </button>
          </RouterLink>
        </AgendarSucessoConfirmacao>
      </template>
    </div>
  </div>
</template>

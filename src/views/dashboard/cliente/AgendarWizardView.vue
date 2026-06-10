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
import { useAgendarWizard } from '@/composables/useAgendarWizard'
import { useApiError } from '@/composables/useApiError'
import { useNotificationsStore } from '@/stores/notifications.store'
import { resolveAgendarFigmaStep } from '@/constants/agendarWizardSteps'
import { agendamentoDetalhePath, ROUTE_PATHS } from '@/constants/routes'
import {
  AGENDAR_BTN_CONTINUE_CLASS,
  AGENDAR_WIZARD_CONTENT_CLASS,
  GLOW_BUTTON_PRIMARY_CLASS,
  GLOW_INPUT_CLASS,
  GLOW_LABEL_CLASS,
} from '@/constants/designTokens'
import { authRouteWithRedirect } from '@/utils/authRedirect'
import {
  formatCurrency,
  formatDateOnlyLong,
  formatDateOnlyMedium,
  formatDateTime,
  formatPrecoRange,
  formatTime,
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
  loading,
  submitting,
  error,
  contexto,
  contextoInvalido,
  agendamentoCriado,
  sucessoCadastroPendente,
  isVisitante,
  servicos,
  slots,
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
  voltarParaIdentidade,
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

const figmaStep = computed(() => resolveAgendarFigmaStep(step.value))

const loginComRedirect = computed(() =>
  authRouteWithRedirect(ROUTE_PATHS.LOGIN, route.fullPath),
)

const showBack = computed(() => {
  if (step.value === 'identidade' || step.value === 'sucesso' || step.value === 'sucesso_cadastro') {
    return false
  }
  if (step.value === 'servicos' && !isVisitante.value) return false
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

onMounted(async () => {
  try {
    await init()
  } catch (err) {
    error.value = resolveError(err)
  }
})

function handleBack() {
  if (step.value === 'contato') voltarParaIdentidade()
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
  <div :class="AGENDAR_WIZARD_CONTENT_CLASS">
    <BaseAlert v-if="contextoInvalido" variant="error" class="mb-6">
      Link de agendamento inválido. Solicite um novo link ao profissional.
    </BaseAlert>

    <BaseAlert v-else-if="error" variant="error" class="mb-6">{{ error }}</BaseAlert>

    <LoadingSpinner v-if="loading && !contexto && !contextoInvalido" />

    <template v-else-if="contexto || step === 'sucesso' || step === 'sucesso_cadastro'">
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
          <h1 class="agendar-section-title">Como deseja continuar?</h1>
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

      <!-- Serviços -->
      <div v-else-if="step === 'servicos'" class="space-y-5" :class="{ 'pb-28': showResumoFooter }">
        <AgendarProfissionalCard
          v-if="contexto"
          :nome="contexto.profissional.nomePublico"
          :estabelecimento-nome="contexto.estabelecimento.nome"
        />

        <LoadingSpinner v-if="loading" />

        <template v-else>
          <h2 class="agendar-section-title">Selecione os serviços</h2>

          <p v-if="servicos.length === 0" class="font-urbanist text-sm text-glow-text-subtle">
            Nenhum serviço disponível para este profissional no momento.
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
          Não há dias de atendimento disponíveis para este profissional com os serviços selecionados.
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
          <p class="mt-2 font-satoshi text-base text-glow-text-muted">
            {{ formatDateOnlyMedium(selectedDate) }}
          </p>
        </div>

        <LoadingSpinner v-if="loading" />

        <p
          v-else-if="slots.length === 0"
          class="font-urbanist text-sm text-glow-text-subtle"
        >
          Nenhum horário livre nesta data. Escolha outro dia da agenda do profissional.
        </p>

        <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          <button
            v-for="(slot, index) in slots"
            :key="`${slot.inicio}-${index}`"
            type="button"
            class="agendar-slot-btn"
            :class="{ 'agendar-slot-btn--selected': selectedSlot?.inicio === slot.inicio }"
            @click="selectedSlot = slot"
          >
            {{ formatTime(slot.inicio) }}
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
      <div v-else-if="step === 'confirmar'" class="space-y-4">
        <div
          v-if="isVisitante && (modoIdentidade === 'guest' || modoIdentidade === 'register')"
          class="agendar-review-card"
        >
          <p class="agendar-review-card__title">Cliente</p>
          <div class="grid gap-4 sm:grid-cols-3">
            <div>
              <p class="font-urbanist text-xs text-glow-text-subtle">Nome</p>
              <p class="font-urbanist text-sm text-glow-text">{{ clienteNome }}</p>
            </div>
            <div>
              <p class="font-urbanist text-xs text-glow-text-subtle">E-mail</p>
              <p class="font-urbanist text-sm text-glow-text">{{ clienteEmail }}</p>
            </div>
            <div>
              <p class="font-urbanist text-xs text-glow-text-subtle">Telefone</p>
              <p class="font-urbanist text-sm text-glow-text">{{ clienteTelefone }}</p>
            </div>
          </div>
        </div>

        <AgendarProfissionalCard
          v-if="contexto"
          compact
          :nome="contexto.profissional.nomePublico"
          :estabelecimento-nome="contexto.estabelecimento.nome"
        />

        <div class="agendar-review-card">
          <p class="agendar-review-card__title">Serviços</p>
          <div class="space-y-4">
            <div
              v-for="(servico, index) in selectedServicos"
              :key="servico.id"
              class="flex items-start justify-between gap-4"
              :class="index > 0 ? 'border-t border-glow-text/25 pt-4' : ''"
            >
              <div>
                <p class="font-urbanist text-sm text-glow-text">{{ servico.nome }}</p>
                <p class="font-urbanist text-xs text-glow-text-subtle">
                  {{ servico.duracaoMinutosEstimada }} minutos
                </p>
              </div>
              <span class="inline-flex rounded-full bg-[rgba(84,128,78,0.2)] px-4 py-1 font-urbanist text-sm font-bold text-[#54804e]">
                {{ formatPrecoRange(servico.precoMinimo, servico.precoMaximo) }}
              </span>
            </div>
          </div>
        </div>

        <div class="agendar-review-card">
          <p class="agendar-review-card__title">Data e Horário</p>
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <p class="font-urbanist text-xs text-glow-text-subtle">Data</p>
              <p class="font-urbanist text-sm text-glow-text">
                {{ formatDateOnlyLong(selectedDate) }}
              </p>
            </div>
            <div>
              <p class="font-urbanist text-xs text-glow-text-subtle">Horário</p>
              <p class="font-urbanist text-sm text-glow-text">
                {{ selectedSlot ? formatTime(selectedSlot.inicio) : '—' }}
              </p>
            </div>
          </div>
        </div>

        <div class="agendar-review-card">
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <p class="font-urbanist text-base font-semibold text-glow-text">Tempo Total</p>
              <p class="font-urbanist text-sm text-glow-text">{{ duracaoTotal }} minutos</p>
            </div>
            <div>
              <p class="font-urbanist text-base font-semibold text-glow-text">Valor Total</p>
              <p class="font-urbanist text-sm font-bold text-[#54804e]">
                {{ formatCurrency(valorEstimado) }}
              </p>
            </div>
          </div>
        </div>

        <div
          v-if="isVisitante && modoIdentidade === 'register'"
          class="agendar-review-card space-y-4"
        >
          <p class="font-urbanist text-sm text-glow-text-subtle">
            Defina uma senha para criar sua conta e vincular este agendamento.
          </p>
          <div>
            <label :class="GLOW_LABEL_CLASS" for="agendar-senha">Senha</label>
            <input
              id="agendar-senha"
              v-model="cadastroSenha"
              type="password"
              autocomplete="new-password"
              :class="[GLOW_INPUT_CLASS, 'mt-2']"
            />
          </div>
        </div>

        <div>
          <label :class="GLOW_LABEL_CLASS" for="agendar-obs">Observação (opcional)</label>
          <textarea
            id="agendar-obs"
            v-model="observacao"
            rows="2"
            class="mt-2 w-full rounded-lg border-[0.3px] border-glow-text/40 px-4 py-3 font-satoshi text-sm text-glow-text outline-none focus:border-glow-gold focus:ring-1 focus:ring-glow-gold"
          />
        </div>

        <button
          type="button"
          :class="AGENDAR_BTN_CONTINUE_CLASS"
          :disabled="submitting"
          @click="handleConfirmar"
        >
          {{ submitting ? 'Confirmando…' : 'Confirmar Agendamento' }}
        </button>
      </div>

      <!-- Sucesso cadastro -->
      <div v-else-if="step === 'sucesso_cadastro'" class="space-y-6 text-center">
        <div class="mx-auto flex size-16 items-center justify-center rounded-full bg-[rgba(84,128,78,0.15)]">
          <svg class="size-8 text-[#54804e]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>
        <h1 class="font-satoshi text-2xl font-normal text-glow-text">Conta e agendamento criados</h1>
        <BaseAlert variant="success">
          Enviamos um e-mail de confirmação. Após confirmar sua conta, você poderá acompanhar este
          agendamento em "Meus agendamentos".
        </BaseAlert>
        <dl v-if="agendamentoCriado" class="space-y-2 text-left font-urbanist text-sm">
          <div class="flex justify-between gap-4">
            <dt class="text-glow-text-subtle">Horário</dt>
            <dd>{{ formatDateTime(agendamentoCriado.inicio) }}</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-glow-text-subtle">Valor estimado</dt>
            <dd class="font-semibold">{{ formatCurrency(agendamentoCriado.valorTotal) }}</dd>
          </div>
        </dl>
        <RouterLink :to="ROUTE_PATHS.CONFIRM_EMAIL">
          <button type="button" :class="GLOW_BUTTON_PRIMARY_CLASS">
            Ir para confirmação de e-mail
          </button>
        </RouterLink>
      </div>

      <!-- Sucesso -->
      <div v-else class="space-y-6 text-center">
        <div class="mx-auto flex size-16 items-center justify-center rounded-full bg-[rgba(84,128,78,0.15)]">
          <svg class="size-8 text-[#54804e]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>
        <h1 class="font-satoshi text-2xl font-normal text-glow-text">Agendamento confirmado</h1>
        <BaseAlert variant="success">
          {{
            modoIdentidade === 'guest'
              ? 'Seu horário foi reservado. Enviaremos alertas para o e-mail informado quando houver novidades.'
              : 'Seu horário foi reservado. A loja pode entrar em contato para confirmar os detalhes.'
          }}
        </BaseAlert>
        <dl v-if="agendamentoCriado" class="space-y-2 text-left font-urbanist text-sm">
          <div class="flex justify-between gap-4">
            <dt class="text-glow-text-subtle">Serviços</dt>
            <dd class="text-right">{{ selectedServicos.map((s) => s.nome).join(', ') }}</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-glow-text-subtle">Horário</dt>
            <dd>{{ formatDateTime(agendamentoCriado.inicio) }}</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-glow-text-subtle">Valor estimado</dt>
            <dd class="font-semibold">{{ formatCurrency(agendamentoCriado.valorTotal) }}</dd>
          </div>
        </dl>
        <div v-if="isVisitante && !sucessoCadastroPendente" class="flex flex-wrap justify-center gap-3">
          <RouterLink :to="authRouteWithRedirect(ROUTE_PATHS.REGISTER, route.fullPath)">
            <button type="button" :class="[AGENDAR_BTN_CONTINUE_CLASS, 'min-w-[160px]']">
              Criar conta
            </button>
          </RouterLink>
          <RouterLink :to="loginComRedirect">
            <button type="button" class="agendar-slot-btn min-w-[160px] px-6">
              Entrar
            </button>
          </RouterLink>
        </div>
        <RouterLink
          v-else-if="agendamentoCriado && !isVisitante"
          :to="agendamentoDetalhePath(agendamentoCriado.id)"
        >
          <button type="button" :class="AGENDAR_BTN_CONTINUE_CLASS">
            Ver agendamento
          </button>
        </RouterLink>
      </div>
    </template>
  </div>
</template>

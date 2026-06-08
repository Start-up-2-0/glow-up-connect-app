<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseAlert from '@/components/feedback/BaseAlert.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import { useAgendarWizard } from '@/composables/useAgendarWizard'
import { useApiError } from '@/composables/useApiError'
import { useNotificationsStore } from '@/stores/notifications.store'
import { agendamentoDetalhePath, ROUTE_PATHS } from '@/constants/routes'
import { authRouteWithRedirect } from '@/utils/authRedirect'
import {
  formatCurrency,
  formatDateOnlyLabel,
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
  toggleServico,
  escolherIdentidade,
  datasAtendimento,
  selecionarData,
  goToHorario,
  goToConfirmar,
  confirmar,
  init,
  persistDraft,
} = wizard

const steps = computed(() => {
  const base = [
    { id: 'servicos', label: 'Serviços' },
    { id: 'horario', label: 'Horário' },
    { id: 'confirmar', label: 'Confirmar' },
  ]
  if (isVisitante.value) {
    return [{ id: 'identidade', label: 'Identificação' }, ...base]
  }
  return base
})

const loginComRedirect = computed(() =>
  authRouteWithRedirect(ROUTE_PATHS.LOGIN, route.fullPath),
)
const registerComRedirect = computed(() =>
  authRouteWithRedirect(ROUTE_PATHS.REGISTER, route.fullPath),
)

onMounted(async () => {
  try {
    await init()
  } catch (err) {
    error.value = resolveError(err)
  }
})

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

async function handleNextFromServicos() {
  try {
    await goToHorario()
  } catch (err) {
    error.value = resolveError(err)
  }
}

async function onSelecionarData(data: string) {
  try {
    await selecionarData(data)
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
  <div class="space-y-4 lg:space-y-6">
    <div v-if="contexto">
      <p class="font-urbanist text-sm text-glow-text-subtle">{{ contexto.estabelecimento.nome }}</p>
      <h1 class="font-satoshi text-xl font-bold text-glow-text lg:text-2xl">
        Agendar com {{ contexto.profissional.nomePublico }}
      </h1>
      <nav
        v-if="step !== 'sucesso' && step !== 'sucesso_cadastro'"
        class="mt-3 flex flex-wrap gap-2"
        aria-label="Etapas"
      >
        <span
          v-for="(s, index) in steps"
          :key="s.id"
          class="rounded-full px-3 py-1 font-urbanist text-xs"
          :class="
            step === s.id
              ? 'bg-glow-gold-selected font-medium text-glow-text'
              : 'bg-glow-surface text-glow-text-subtle'
          "
        >
          {{ index + 1 }}. {{ s.label }}
        </span>
      </nav>
    </div>

    <BaseAlert v-if="contextoInvalido" variant="error">
      Link de agendamento inválido. Solicite um novo link ao profissional.
    </BaseAlert>

    <BaseAlert v-else-if="error" variant="error">{{ error }}</BaseAlert>

    <LoadingSpinner v-if="loading && !contexto && !contextoInvalido" />

    <BaseCard v-else-if="step === 'identidade'" title="Como deseja continuar?">
      <p class="mb-4 font-urbanist text-sm text-glow-text-subtle">
        Escolha uma opção para concluir seu agendamento com
        <strong class="text-glow-text">{{ contexto?.profissional.nomePublico }}</strong>.
      </p>
      <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <BaseButton @click="handleEscolherLogin">Entrar com minha conta</BaseButton>
        <BaseButton variant="secondary" @click="handleEscolherRegister">Criar conta e agendar</BaseButton>
        <BaseButton variant="ghost" @click="handleEscolherGuest">Agendar sem conta</BaseButton>
      </div>
    </BaseCard>

    <LoadingSpinner v-else-if="loading && step === 'servicos'" />

    <BaseCard v-else-if="step === 'servicos'" title="Escolha os serviços">
      <p
        v-if="servicos.length === 0"
        class="mb-4 font-urbanist text-sm text-glow-text-subtle"
      >
        Nenhum serviço disponível para este profissional no momento.
      </p>
      <div class="space-y-2">
        <label
          v-for="servico in servicos"
          :key="servico.id"
          class="flex cursor-pointer items-start gap-3 rounded-lg border border-glow-border-soft p-3 transition-colors hover:bg-glow-hover-surface"
        >
          <input
            type="checkbox"
            class="mt-1 size-4"
            :checked="selectedServicoIds.includes(servico.id)"
            @change="toggleServico(servico.id)"
          />
          <div class="min-w-0 flex-1">
            <p class="font-urbanist text-sm font-medium text-glow-text">{{ servico.nome }}</p>
            <p v-if="servico.descricao" class="mt-0.5 font-urbanist text-xs text-glow-text-subtle">
              {{ servico.descricao }}
            </p>
            <p class="mt-1 font-urbanist text-xs text-glow-text-subtle">
              {{ formatPrecoRange(servico.precoMinimo, servico.precoMaximo) }}
              · {{ servico.duracaoMinutosEstimada }} min
            </p>
          </div>
        </label>
      </div>
      <div class="mt-4 flex gap-2">
        <BaseButton v-if="isVisitante" variant="secondary" @click="step = 'identidade'">Voltar</BaseButton>
        <BaseButton :disabled="servicos.length === 0" @click="handleNextFromServicos">
          Continuar
        </BaseButton>
      </div>
    </BaseCard>

    <BaseCard v-else-if="step === 'horario'" title="Escolha data e horário">
      <div class="space-y-4">
        <div>
          <p class="mb-2 font-urbanist text-sm font-medium text-glow-text">Dia do atendimento</p>
          <p v-if="datasAtendimento.length > 0" class="mb-3 font-urbanist text-xs text-glow-text-subtle">
            {{ datasAtendimento.length }}
            {{ datasAtendimento.length === 1 ? 'dia disponível' : 'dias disponíveis' }}
            na agenda de {{ contexto?.profissional.nomePublico }} nos próximos 31 dias.
          </p>
          <p
            v-else-if="!loading"
            class="mb-3 font-urbanist text-xs text-glow-text-subtle"
          >
            Não há dias de atendimento para os serviços selecionados.
          </p>
          <div
            v-if="datasAtendimento.length > 0"
            class="flex flex-wrap gap-2"
            role="listbox"
            aria-label="Dias disponíveis para agendamento"
          >
            <button
              v-for="data in datasAtendimento"
              :key="data"
              type="button"
              role="option"
              :aria-selected="selectedDate === data"
              class="rounded-lg border px-3 py-2 font-urbanist text-sm transition-colors"
              :class="
                selectedDate === data
                  ? 'border-glow-gold-dark bg-glow-gold-selected font-medium text-glow-text'
                  : 'border-glow-border-soft text-glow-text hover:bg-glow-hover-surface'
              "
              @click="onSelecionarData(data)"
            >
              {{ formatDateOnlyLabel(data) }}
            </button>
          </div>
        </div>

        <LoadingSpinner v-if="loading" />

        <div
          v-else-if="datasAtendimento.length === 0"
          class="font-urbanist text-sm text-glow-text-subtle"
        >
          Não há dias de atendimento disponíveis para este profissional com os serviços selecionados.
        </div>

        <div v-else-if="slots.length === 0" class="font-urbanist text-sm text-glow-text-subtle">
          Nenhum horário livre nesta data. Escolha outro dia da agenda do profissional.
        </div>

        <div v-else class="grid grid-cols-3 gap-2 sm:grid-cols-4">
          <button
            v-for="(slot, index) in slots"
            :key="`${slot.inicio}-${index}`"
            type="button"
            class="rounded-lg border px-2 py-2 font-urbanist text-sm transition-colors"
            :class="
              selectedSlot?.inicio === slot.inicio
                ? 'border-glow-gold-dark bg-glow-gold-selected font-medium'
                : 'border-glow-border-soft hover:bg-glow-hover-surface'
            "
            @click="selectedSlot = slot"
          >
            {{ formatTime(slot.inicio) }}
          </button>
        </div>
      </div>
      <div class="mt-4 flex gap-2">
        <BaseButton variant="secondary" @click="step = 'servicos'">Voltar</BaseButton>
        <BaseButton :disabled="!selectedSlot" @click="goToConfirmar()">Continuar</BaseButton>
      </div>
    </BaseCard>

    <BaseCard v-else-if="step === 'confirmar'" title="Confirmar agendamento">
      <dl class="space-y-2 font-urbanist text-sm">
        <div class="flex justify-between gap-4">
          <dt class="text-glow-text-subtle">Profissional</dt>
          <dd class="text-right text-glow-text">{{ contexto?.profissional.nomePublico }}</dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-glow-text-subtle">Serviços</dt>
          <dd class="text-right text-glow-text">
            {{ selectedServicos.map((s) => s.nome).join(', ') }}
          </dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-glow-text-subtle">Horário</dt>
          <dd class="text-glow-text">
            {{ selectedSlot ? formatDateTime(selectedSlot.inicio) : '—' }}
          </dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-glow-text-subtle">Valor estimado</dt>
          <dd class="font-medium text-glow-text">{{ formatCurrency(valorEstimado) }}</dd>
        </div>
      </dl>

      <div
        v-if="isVisitante && modoIdentidade === 'register'"
        class="mt-4 space-y-3"
      >
        <p class="font-urbanist text-sm text-glow-text-subtle">
          Crie sua conta para vincular este agendamento ao seu histórico.
        </p>
        <div>
          <label class="mb-1 block font-urbanist text-sm font-medium text-glow-text">Nome</label>
          <input v-model="clienteNome" type="text" autocomplete="name" class="w-full rounded border border-glow-border-soft bg-glow-surface px-3 py-2 font-urbanist text-sm" />
        </div>
        <div>
          <label class="mb-1 block font-urbanist text-sm font-medium text-glow-text">E-mail</label>
          <input v-model="clienteEmail" type="email" autocomplete="email" class="w-full rounded border border-glow-border-soft bg-glow-surface px-3 py-2 font-urbanist text-sm" />
        </div>
        <div>
          <label class="mb-1 block font-urbanist text-sm font-medium text-glow-text">Telefone</label>
          <input v-model="clienteTelefone" type="tel" autocomplete="tel" class="w-full rounded border border-glow-border-soft bg-glow-surface px-3 py-2 font-urbanist text-sm" />
        </div>
        <div>
          <label class="mb-1 block font-urbanist text-sm font-medium text-glow-text">Senha</label>
          <input v-model="cadastroSenha" type="password" autocomplete="new-password" class="w-full rounded border border-glow-border-soft bg-glow-surface px-3 py-2 font-urbanist text-sm" />
        </div>
      </div>

      <div v-else-if="isVisitante && modoIdentidade === 'guest'" class="mt-4 space-y-3">
        <p class="font-urbanist text-sm text-glow-text-subtle">
          Informe seus dados de contato para a loja confirmar o agendamento.
        </p>
        <div>
          <label class="mb-1 block font-urbanist text-sm font-medium text-glow-text">Nome</label>
          <input v-model="clienteNome" type="text" autocomplete="name" class="w-full rounded border border-glow-border-soft bg-glow-surface px-3 py-2 font-urbanist text-sm" />
        </div>
        <div>
          <label class="mb-1 block font-urbanist text-sm font-medium text-glow-text">E-mail</label>
          <input v-model="clienteEmail" type="email" autocomplete="email" class="w-full rounded border border-glow-border-soft bg-glow-surface px-3 py-2 font-urbanist text-sm" />
        </div>
        <div>
          <label class="mb-1 block font-urbanist text-sm font-medium text-glow-text">Telefone</label>
          <input v-model="clienteTelefone" type="tel" autocomplete="tel" class="w-full rounded border border-glow-border-soft bg-glow-surface px-3 py-2 font-urbanist text-sm" />
        </div>
      </div>

      <div class="mt-4">
        <label class="mb-1 block font-urbanist text-sm font-medium text-glow-text">
          Observação (opcional)
        </label>
        <textarea
          v-model="observacao"
          rows="2"
          class="w-full rounded border border-glow-border-soft bg-glow-surface px-3 py-2 font-urbanist text-sm"
        />
      </div>

      <div class="mt-4 flex gap-2">
        <BaseButton variant="secondary" @click="step = 'horario'">Voltar</BaseButton>
        <BaseButton :loading="submitting" @click="handleConfirmar">Confirmar agendamento</BaseButton>
      </div>
    </BaseCard>

    <BaseCard v-else-if="step === 'sucesso_cadastro'" title="Conta e agendamento criados">
      <BaseAlert variant="success">
        Enviamos um e-mail de confirmação. Após confirmar sua conta, você poderá acompanhar este
        agendamento em "Meus agendamentos".
      </BaseAlert>

      <dl v-if="agendamentoCriado" class="mt-4 space-y-2 font-urbanist text-sm">
        <div class="flex justify-between gap-4">
          <dt class="text-glow-text-subtle">Horário</dt>
          <dd class="text-glow-text">{{ formatDateTime(agendamentoCriado.inicio) }}</dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-glow-text-subtle">Valor estimado</dt>
          <dd class="font-medium text-glow-text">{{ formatCurrency(agendamentoCriado.valorTotal) }}</dd>
        </div>
      </dl>

      <RouterLink :to="ROUTE_PATHS.CONFIRM_EMAIL" class="mt-4 inline-block">
        <BaseButton>Ir para confirmação de e-mail</BaseButton>
      </RouterLink>
    </BaseCard>

    <BaseCard v-else title="Agendamento confirmado">
      <BaseAlert variant="success">
        Seu horário foi reservado. A loja pode entrar em contato para confirmar os detalhes.
      </BaseAlert>

      <dl v-if="agendamentoCriado" class="mt-4 space-y-2 font-urbanist text-sm">
        <div class="flex justify-between gap-4">
          <dt class="text-glow-text-subtle">Serviços</dt>
          <dd class="text-right text-glow-text">
            {{ selectedServicos.map((s) => s.nome).join(', ') }}
          </dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-glow-text-subtle">Horário</dt>
          <dd class="text-glow-text">{{ formatDateTime(agendamentoCriado.inicio) }}</dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-glow-text-subtle">Valor estimado</dt>
          <dd class="font-medium text-glow-text">{{ formatCurrency(agendamentoCriado.valorTotal) }}</dd>
        </div>
      </dl>

      <p v-if="isVisitante && !sucessoCadastroPendente" class="mt-4 font-urbanist text-sm text-glow-text-subtle">
        Crie uma conta ou entre para acompanhar seus agendamentos em um só lugar.
      </p>

      <div class="mt-4 flex flex-wrap gap-2">
        <RouterLink v-if="isVisitante && !sucessoCadastroPendente" :to="registerComRedirect">
          <BaseButton>Criar conta</BaseButton>
        </RouterLink>
        <RouterLink v-if="isVisitante && !sucessoCadastroPendente" :to="loginComRedirect">
          <BaseButton variant="secondary">Entrar</BaseButton>
        </RouterLink>
        <RouterLink
          v-else-if="agendamentoCriado && !isVisitante"
          :to="agendamentoDetalhePath(agendamentoCriado.id)"
        >
          <BaseButton>Ver agendamento</BaseButton>
        </RouterLink>
      </div>
    </BaseCard>
  </div>
</template>

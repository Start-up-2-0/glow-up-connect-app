<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseAlert from '@/components/feedback/BaseAlert.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import { useAgendarWizard } from '@/composables/useAgendarWizard'
import { useApiError } from '@/composables/useApiError'
import { useNotificationsStore } from '@/stores/notifications.store'
import { agendamentoDetalhePath } from '@/constants/routes'
import { formatCurrency, formatDateTime, formatPrecoRange, formatTime } from '@/utils/formatters'

const route = useRoute()
const router = useRouter()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const publicGuid = computed(() => String(route.params.publicGuid))

const wizard = useAgendarWizard(publicGuid.value)

const {
  step,
  loading,
  submitting,
  error,
  servicos,
  profissionais,
  slots,
  selectedServicoIds,
  selectedProfissionalGuid,
  selectedDate,
  selectedSlot,
  observacao,
  selectedServicos,
  valorEstimado,
  toggleServico,
  loadDisponibilidade,
  goToProfissional,
  goToHorario,
  goToConfirmar,
  confirmar,
  init,
} = wizard

const steps = [
  { id: 'servicos', label: 'Serviços' },
  { id: 'profissional', label: 'Profissional' },
  { id: 'horario', label: 'Horário' },
  { id: 'confirmar', label: 'Confirmar' },
] as const

onMounted(async () => {
  try {
    await init()
  } catch (err) {
    error.value = resolveError(err)
  }
})

async function handleNextFromServicos() {
  try {
    await goToProfissional()
  } catch (err) {
    error.value = resolveError(err)
  }
}

async function handleNextFromProfissional() {
  try {
    await goToHorario()
  } catch (err) {
    error.value = resolveError(err)
  }
}

async function handleDateChange() {
  try {
    await loadDisponibilidade()
  } catch (err) {
    error.value = resolveError(err)
  }
}

async function handleConfirmar() {
  try {
    const agendamento = await confirmar()
    notifications.push('success', 'Agendamento criado com sucesso!')
    await router.push(agendamentoDetalhePath(agendamento.id))
  } catch (err) {
    error.value = resolveError(err, 'Não foi possível criar o agendamento.')
  }
}
</script>

<template>
  <div class="space-y-4 lg:space-y-6">
    <div>
      <h1 class="font-satoshi text-xl font-bold text-glow-text lg:text-2xl">Agendar serviço</h1>
      <nav class="mt-3 flex flex-wrap gap-2" aria-label="Etapas">
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

    <BaseAlert v-if="error" variant="error">{{ error }}</BaseAlert>

    <LoadingSpinner v-if="loading && step === 'servicos'" />

    <BaseCard v-else-if="step === 'servicos'" title="Escolha os serviços">
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
      <BaseButton class="mt-4" @click="handleNextFromServicos">Continuar</BaseButton>
    </BaseCard>

    <BaseCard v-else-if="step === 'profissional'" title="Escolha o profissional">
      <LoadingSpinner v-if="loading" />
      <div v-else class="space-y-2">
        <label
          class="flex cursor-pointer items-center gap-3 rounded-lg border border-glow-border-soft p-3"
        >
          <input v-model="selectedProfissionalGuid" type="radio" class="size-4" value="" name="profissional" />
          <span class="font-urbanist text-sm text-glow-text">Qualquer profissional disponível</span>
        </label>
        <label
          v-for="prof in profissionais"
          :key="prof.publicGuid"
          class="flex cursor-pointer items-center gap-3 rounded-lg border border-glow-border-soft p-3"
        >
          <input
            v-model="selectedProfissionalGuid"
            type="radio"
            class="size-4"
            :value="prof.publicGuid"
            name="profissional"
          />
          <span class="font-urbanist text-sm text-glow-text">{{ prof.nomePublico }}</span>
        </label>
      </div>
      <div class="mt-4 flex gap-2">
        <BaseButton variant="secondary" @click="step = 'servicos'">Voltar</BaseButton>
        <BaseButton @click="handleNextFromProfissional">Continuar</BaseButton>
      </div>
    </BaseCard>

    <BaseCard v-else-if="step === 'horario'" title="Escolha data e horário">
      <div class="space-y-4">
        <div>
          <label class="mb-1 block font-urbanist text-sm font-medium text-glow-text">Data</label>
          <input
            v-model="selectedDate"
            type="date"
            class="rounded border border-glow-border-soft bg-glow-surface px-3 py-2 font-urbanist text-sm"
            @change="handleDateChange"
          />
        </div>

        <LoadingSpinner v-if="loading" />

        <div v-else-if="slots.length === 0" class="font-urbanist text-sm text-glow-text-subtle">
          Nenhum horário disponível nesta data.
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
        <BaseButton variant="secondary" @click="step = 'profissional'">Voltar</BaseButton>
        <BaseButton @click="goToConfirmar()">Continuar</BaseButton>
      </div>
    </BaseCard>

    <BaseCard v-else title="Confirmar agendamento">
      <dl class="space-y-2 font-urbanist text-sm">
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseAlert from '@/components/feedback/BaseAlert.vue'
import { publicoService } from '@/services/publicoService'
import { useApiError } from '@/composables/useApiError'
import { useNotificationsStore } from '@/stores/notifications.store'
import type { PropostaRemarcacao } from '@/types/agendamento.types'
import { formatAgendaDateTime } from '@/utils/formatters'

const route = useRoute()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const token = computed(() => String(route.params.token))
const proposta = ref<PropostaRemarcacao | null>(null)
const loading = ref(false)
const submitting = ref(false)
const responded = ref<'aceita' | 'recusada' | null>(null)
const error = ref<string | null>(null)

const horarioSugerido = computed(() => {
  if (!proposta.value) return '—'
  return `${proposta.value.dataSugerida} ${proposta.value.horarioInicioSugerido}`
})

onMounted(async () => {
  loading.value = true
  try {
    proposta.value = await publicoService.obterPropostaRemarcacao(token.value)
  } catch (err) {
    error.value = resolveError(err, 'Proposta não encontrada ou expirada.')
  } finally {
    loading.value = false
  }
})

async function responder(acao: 'aceitar' | 'recusar') {
  submitting.value = true
  error.value = null
  try {
    if (acao === 'aceitar') {
      await publicoService.aceitarPropostaRemarcacao(token.value)
      responded.value = 'aceita'
      notifications.push('success', 'Novo horário confirmado!')
    } else {
      await publicoService.recusarPropostaRemarcacao(token.value)
      responded.value = 'recusada'
      notifications.push('success', 'Sugestão recusada.')
    }
  } catch (err) {
    error.value = resolveError(err, 'Não foi possível registrar sua resposta.')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-lg space-y-4">
    <h1 class="font-satoshi text-xl font-bold text-glow-text">Sugestão de reagendamento</h1>

    <BaseAlert v-if="error" variant="error">{{ error }}</BaseAlert>

    <BaseCard v-if="!loading && proposta && !responded">
      <dl class="space-y-2 font-urbanist text-sm">
        <div v-if="proposta.estabelecimentoNome" class="flex justify-between gap-4">
          <dt class="text-glow-text-subtle">Loja</dt>
          <dd class="text-glow-text">{{ proposta.estabelecimentoNome }}</dd>
        </div>
        <div v-if="proposta.profissionalNome" class="flex justify-between gap-4">
          <dt class="text-glow-text-subtle">Profissional</dt>
          <dd class="text-glow-text">{{ proposta.profissionalNome }}</dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-glow-text-subtle">Horário atual</dt>
          <dd class="text-glow-text">
            {{ proposta.inicioAtual ? formatAgendaDateTime(proposta.inicioAtual) : '—' }}
          </dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-glow-text-subtle">Novo horário sugerido</dt>
          <dd class="font-medium text-glow-text">{{ horarioSugerido }}</dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-glow-text-subtle">Motivo</dt>
          <dd class="text-right text-glow-text">{{ proposta.motivo }}</dd>
        </div>
      </dl>

      <p class="mt-4 font-urbanist text-sm text-glow-text-subtle">
        O novo horário só será confirmado após sua aceitação.
      </p>

      <div class="mt-4 flex flex-wrap gap-2">
        <BaseButton :loading="submitting" @click="responder('aceitar')">Aceitar novo horário</BaseButton>
        <BaseButton variant="secondary" :loading="submitting" @click="responder('recusar')">
          Recusar
        </BaseButton>
      </div>
    </BaseCard>

    <BaseCard v-else-if="responded === 'aceita'">
      <BaseAlert variant="success">Horário atualizado com sucesso.</BaseAlert>
    </BaseCard>

    <BaseCard v-else-if="responded === 'recusada'">
      <BaseAlert variant="info">
        Sua recusa foi registrada. A loja pode entrar em contato para combinar outro horário.
      </BaseAlert>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseAlert from '@/components/feedback/BaseAlert.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import StarRating from '@/components/avaliacao/StarRating.vue'
import { avaliacaoService } from '@/services/avaliacaoService'
import { useApiError } from '@/composables/useApiError'
import { useNotificationsStore } from '@/stores/notifications.store'
import type { AvaliacaoContexto } from '@/types/avaliacao.types'
import { agendamentoDetalhePath } from '@/constants/routes'
import { formatAgendaDateTime } from '@/utils/formatters'

const props = defineProps<{
  mode: 'token' | 'agendamento'
}>()

const route = useRoute()
const router = useRouter()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const contexto = ref<AvaliacaoContexto | null>(null)
const loading = ref(false)
const submitting = ref(false)
const error = ref<string | null>(null)

const notaEstabelecimento = ref<number | null>(null)
const notaProfissional = ref<number | null>(null)
const comentarioEstabelecimento = ref('')
const comentarioProfissional = ref('')

const token = computed(() => (props.mode === 'token' ? String(route.params.token) : ''))
const agendamentoId = computed(() =>
  props.mode === 'agendamento' ? Number(route.params.id) : 0,
)

const readonly = computed(() => contexto.value?.status === 'Realizada')
const indisponivel = computed(() => contexto.value?.status === 'Indisponivel')

async function load() {
  loading.value = true
  error.value = null
  try {
    contexto.value =
      props.mode === 'token'
        ? await avaliacaoService.obterContextoPorToken(token.value)
        : await avaliacaoService.obterContextoMeuAgendamento(agendamentoId.value)

    if (contexto.value.avaliacao) {
      notaEstabelecimento.value = contexto.value.avaliacao.notaEstabelecimento
      notaProfissional.value = contexto.value.avaliacao.notaProfissional
    }
  } catch (err) {
    error.value = resolveError(err, 'Não foi possível carregar a avaliação.')
  } finally {
    loading.value = false
  }
}

async function enviar() {
  if (notaEstabelecimento.value == null || notaProfissional.value == null) {
    error.value = 'Selecione a nota da loja e do profissional (0 a 5).'
    return
  }

  submitting.value = true
  error.value = null
  try {
    const payload = {
      notaEstabelecimento: notaEstabelecimento.value,
      comentarioEstabelecimento: comentarioEstabelecimento.value.trim() || null,
      notaProfissional: notaProfissional.value,
      comentarioProfissional: comentarioProfissional.value.trim() || null,
    }

    contexto.value =
      props.mode === 'token'
        ? await avaliacaoService.criarPorToken(token.value, payload)
        : await avaliacaoService.criarMeuAgendamento(agendamentoId.value, payload)

    notifications.push('success', 'Avaliação enviada com sucesso!')
  } catch (err) {
    error.value = resolveError(err, 'Não foi possível enviar a avaliação.')
  } finally {
    submitting.value = false
  }
}

function voltarHistorico() {
  if (props.mode === 'agendamento') {
    router.push(agendamentoDetalhePath(agendamentoId.value))
  } else {
    router.push('/auth/login')
  }
}

onMounted(load)
</script>

<template>
  <div class="mx-auto max-w-lg space-y-4">
    <h1 class="font-satoshi text-xl font-bold text-glow-text">Avaliar atendimento</h1>

    <BaseAlert v-if="error" variant="error">{{ error }}</BaseAlert>
    <LoadingSpinner v-if="loading" />

    <template v-else-if="contexto">
      <BaseCard>
        <div class="flex items-center gap-3">
          <img
            v-if="contexto.estabelecimentoLogo"
            :src="contexto.estabelecimentoLogo"
            :alt="contexto.estabelecimentoNome"
            class="size-12 rounded-lg object-cover"
          />
          <div>
            <p class="font-satoshi font-semibold text-glow-text">{{ contexto.estabelecimentoNome }}</p>
            <p class="text-sm text-glow-text-subtle">
              {{ contexto.profissionalNome }} · {{ formatAgendaDateTime(contexto.atendimentoInicio) }}
            </p>
          </div>
        </div>
      </BaseCard>

      <BaseAlert v-if="indisponivel" variant="warning">
        Este agendamento não está disponível para avaliação.
      </BaseAlert>

      <BaseAlert v-else-if="readonly" variant="success">
        Você já avaliou este atendimento.
      </BaseAlert>

      <BaseCard v-if="!indisponivel">
        <div class="space-y-6">
          <section class="space-y-3">
            <h2 class="font-satoshi text-base font-semibold text-glow-text">Avaliar loja</h2>
            <StarRating v-model="notaEstabelecimento" label="Nota da loja" :readonly="readonly" />
            <textarea
              v-model="comentarioEstabelecimento"
              class="w-full rounded-lg border border-glow-border-soft bg-transparent p-3 text-sm text-glow-text"
              rows="3"
              placeholder="Comentário sobre a loja (opcional)"
              :readonly="readonly"
            />
          </section>

          <section class="space-y-3">
            <h2 class="font-satoshi text-base font-semibold text-glow-text">Avaliar profissional</h2>
            <StarRating v-model="notaProfissional" label="Nota do profissional" :readonly="readonly" />
            <textarea
              v-model="comentarioProfissional"
              class="w-full rounded-lg border border-glow-border-soft bg-transparent p-3 text-sm text-glow-text"
              rows="3"
              placeholder="Comentário sobre o profissional (opcional)"
              :readonly="readonly"
            />
          </section>

          <div class="flex flex-wrap gap-2">
            <BaseButton v-if="!readonly" :loading="submitting" @click="enviar">
              Enviar avaliação
            </BaseButton>
            <BaseButton variant="secondary" @click="voltarHistorico">
              {{ mode === 'agendamento' ? 'Voltar ao agendamento' : 'Ir para login' }}
            </BaseButton>
          </div>
        </div>
      </BaseCard>
    </template>
  </div>
</template>

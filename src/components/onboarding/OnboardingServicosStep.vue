<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ServicoForm from '@/components/servicos/ServicoForm.vue'
import { servicoService } from '@/services/servicoService'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import type { Servico } from '@/types/negocio/servico.types'
import { formatCurrency } from '@/utils/formatters'
import { ONBOARDING_CONTRATAR_CARD_CLASS } from '@/constants/designTokens'

const props = withDefaults(
  defineProps<{
    estabelecimentoId: number
    modoAutonomo?: boolean
    continueLabel?: string
  }>(),
  { modoAutonomo: false, continueLabel: 'Continuar' },
)

const emit = defineEmits<{
  continue: []
  skip: []
}>()

const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const servicos = ref<Servico[]>([])
const loading = ref(false)
const showForm = ref(false)

async function load() {
  loading.value = true
  try {
    servicos.value = await servicoService.listar(props.estabelecimentoId)
  } catch (err) {
    notifications.push('error', resolveError(err, 'Não foi possível carregar os serviços.'))
  } finally {
    loading.value = false
  }
}

async function onSaved() {
  showForm.value = false
  await load()
}

watch(
  () => props.estabelecimentoId,
  (id) => {
    if (id) void load()
  },
  { immediate: true },
)
</script>

<template>
  <div class="space-y-4">
    <div :class="ONBOARDING_CONTRATAR_CARD_CLASS">
      <h2 class="font-urbanist text-lg font-semibold text-glow-text">Serviços</h2>
      <p class="mt-1 text-sm text-glow-text-subtle">
        {{
          modoAutonomo
            ? 'Cadastre o que você oferece agora ou configure depois no painel.'
            : 'Cadastre os serviços da loja agora ou configure depois.'
        }}
      </p>

      <BaseButton
        v-if="!showForm"
        class="mt-4"
        variant="primary"
        size="sm"
        @click="showForm = true"
      >
        Adicionar serviço
      </BaseButton>

      <ul v-if="servicos.length > 0" class="mt-4 space-y-2">
        <li
          v-for="s in servicos"
          :key="s.id"
          class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-glow-border-soft px-3 py-2 text-sm"
        >
          <span class="font-medium text-glow-text">{{ s.nome }}</span>
          <span class="text-glow-text-subtle">
            {{ formatCurrency(s.precoBase) }} · {{ s.duracaoMinutos }} min
          </span>
        </li>
      </ul>
      <p v-else-if="!loading && !showForm" class="mt-4 text-sm text-glow-text-subtle">
        Nenhum serviço cadastrado ainda.
      </p>
    </div>

    <div v-if="showForm" :class="ONBOARDING_CONTRATAR_CARD_CLASS">
      <ServicoForm
        :estabelecimento-id="estabelecimentoId"
        :show-profissionais="!modoAutonomo"
        submit-label="Salvar serviço"
        cancel-label="Cancelar"
        @saved="onSaved"
        @cancel="showForm = false"
      />
    </div>

    <div class="flex flex-wrap justify-end gap-2">
      <BaseButton variant="primary" @click="emit('continue')">{{ continueLabel }}</BaseButton>
    </div>
  </div>
</template>

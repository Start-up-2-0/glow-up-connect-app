<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import EquipeAdicionarForm from '@/components/equipe/EquipeAdicionarForm.vue'
import type { ModoCadastro } from '@/composables/useEquipeAdicionarForm'
import { equipeService } from '@/services/equipeService'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import type { MembroEquipeApiItem } from '@/types/negocio/equipe.types'
import {
  ONBOARDING_CONTRATAR_CARD_CLASS,
} from '@/constants/designTokens'

const props = defineProps<{
  estabelecimentoId: number
}>()

const emit = defineEmits<{
  continue: []
  skip: []
}>()

const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const membros = ref<MembroEquipeApiItem[]>([])
const loading = ref(false)
const showForm = ref(false)
const modo = ref<ModoCadastro>('convite')

const profissionais = computed(() =>
  membros.value.filter((m) => m.ativo && m.role !== 'Owner'),
)

async function load() {
  loading.value = true
  try {
    const page = await equipeService.listarMembros(props.estabelecimentoId, {
      tamanhoPagina: 50,
    })
    membros.value = page.itens
  } catch (err) {
    notifications.push('error', resolveError(err, 'Não foi possível carregar a equipe.'))
  } finally {
    loading.value = false
  }
}

function abrir(m: ModoCadastro) {
  modo.value = m
  showForm.value = true
}

async function onVinculado() {
  showForm.value = false
  await load()
  notifications.push('success', 'Membro adicionado à equipe.')
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
      <h2 class="font-urbanist text-lg font-semibold text-glow-text">Equipe da loja</h2>
      <p class="mt-1 text-sm text-glow-text-subtle">
        Quer configurar agora? Você pode deixar a loja pronta ou fazer isso depois no dashboard.
      </p>

      <div class="mt-4 flex flex-wrap gap-2">
        <BaseButton variant="primary" size="sm" @click="abrir('convite')">
          Convidar profissional
        </BaseButton>
        <BaseButton variant="secondary" size="sm" @click="abrir('criar')">
          Criar usuário
        </BaseButton>
      </div>

      <ul v-if="profissionais.length > 0" class="mt-4 space-y-2">
        <li
          v-for="m in profissionais"
          :key="m.id"
          class="rounded-lg border border-glow-border-soft px-3 py-2 text-sm text-glow-text"
        >
          {{ m.nome }}
          <span class="text-glow-text-subtle"> · {{ m.role }}</span>
        </li>
      </ul>
      <p v-else-if="!loading" class="mt-4 text-sm text-glow-text-subtle">
        Nenhum profissional cadastrado ainda.
      </p>
    </div>

    <div v-if="showForm" :class="ONBOARDING_CONTRATAR_CARD_CLASS">
      <EquipeAdicionarForm
        :modo="modo"
        initial-role="Profissional"
        :navigate-on-vinculo="false"
        embedded
        @cancel="showForm = false"
        @vinculado="onVinculado"
      />
    </div>

    <div class="flex flex-wrap justify-between gap-2">
      <BaseButton variant="ghost" @click="emit('skip')">Fazer depois</BaseButton>
      <BaseButton variant="primary" @click="emit('continue')">Continuar</BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { equipeService } from '@/services/equipeService'
import { ROUTE_PATHS } from '@/constants/routes'

const router = useRouter()
const { estabelecimentoId, ready, error: contextError } = useEstabelecimentoView()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const profissionalId = ref('')
const podeReceberAgendamento = ref(true)
const saving = ref(false)

async function handleSubmit() {
  if (!estabelecimentoId.value || !profissionalId.value.trim()) return
  const id = Number.parseInt(profissionalId.value, 10)
  if (!Number.isFinite(id)) {
    notifications.push('error', 'Informe um ID de profissional válido.')
    return
  }
  saving.value = true
  try {
    await equipeService.convidarProfissional(estabelecimentoId.value, {
      profissionalId: id,
      podeReceberAgendamento: podeReceberAgendamento.value,
    })
    notifications.push('success', 'Convite enviado ao profissional.')
    await router.push(ROUTE_PATHS.CONFIG_EQUIPE)
  } catch (err) {
    notifications.push('error', resolveError(err, 'Não foi possível enviar o convite.'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-lg space-y-4 lg:space-y-6">
    <div>
      <h1 class="font-satoshi text-xl font-bold leading-tight text-glow-text lg:text-2xl">
        Convidar profissional
      </h1>
      <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
        Informe o ID do usuário profissional para enviar o convite.
      </p>
    </div>

    <p v-if="contextError" class="font-urbanist text-sm text-red-600">{{ contextError }}</p>

    <BaseCard v-if="ready">
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <BaseInput
          v-model="profissionalId"
          label="ID do profissional"
          type="number"
          placeholder="Ex.: 42"
          required
          hint="ID do usuário profissional já cadastrado na plataforma."
        />
        <label class="flex cursor-pointer items-center gap-3 font-urbanist text-sm text-glow-text">
          <input v-model="podeReceberAgendamento" type="checkbox" class="rounded border-glow-border-soft" />
          Pode receber agendamentos
        </label>
        <div class="flex flex-wrap gap-3">
          <BaseButton type="submit" :loading="saving">Enviar convite</BaseButton>
          <RouterLink :to="ROUTE_PATHS.CONFIG_EQUIPE">
            <BaseButton variant="secondary">Cancelar</BaseButton>
          </RouterLink>
        </div>
      </form>
    </BaseCard>
  </div>
</template>

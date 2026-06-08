<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { conviteService } from '@/services/conviteService'
import { ROUTE_PATHS } from '@/constants/routes'

const router = useRouter()
const { estabelecimentoId, ready, error: contextError } = useEstabelecimentoView()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const email = ref('')
const telefone = ref('')
const nomePublico = ref('')
const podeReceberAgendamento = ref(true)
const saving = ref(false)

async function handleSubmit() {
  if (!estabelecimentoId.value || !email.value.trim()) return
  saving.value = true
  try {
    await conviteService.criarConviteProfissional(estabelecimentoId.value, {
      email: email.value.trim(),
      telefone: telefone.value.trim() || undefined,
      nomePublico: nomePublico.value.trim() || undefined,
      podeReceberAgendamento: podeReceberAgendamento.value,
    })
    notifications.push('success', 'Convite enviado por e-mail ao profissional.')
    await router.push(ROUTE_PATHS.CONFIG_EQUIPE_CONVITES)
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
        O profissional receberá um e-mail com link para aceitar o convite e integrar a equipe.
      </p>
    </div>

    <p v-if="contextError" class="font-urbanist text-sm text-red-600">{{ contextError }}</p>

    <BaseCard v-if="ready">
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <BaseInput
          v-model="email"
          label="E-mail"
          type="email"
          placeholder="profissional@exemplo.com"
          required
        />
        <BaseInput
          v-model="telefone"
          label="Telefone"
          type="tel"
          placeholder="Opcional"
        />
        <BaseInput
          v-model="nomePublico"
          label="Nome público"
          placeholder="Como aparecerá para os clientes"
        />
        <label class="flex cursor-pointer items-center gap-3 font-urbanist text-sm text-glow-text">
          <input
            v-model="podeReceberAgendamento"
            type="checkbox"
            class="rounded border-glow-border-soft"
          />
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

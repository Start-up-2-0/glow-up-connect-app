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
import type { EstablishmentUserRole } from '@/types/negocio/equipe.types'

const ROLES_CADASTRO: { value: EstablishmentUserRole; label: string }[] = [
  { value: 'Admin', label: 'Administrador' },
  { value: 'Manager', label: 'Gerente' },
  { value: 'Receptionist', label: 'Recepcionista' },
]

const router = useRouter()
const { estabelecimentoId, ready, error: contextError } = useEstabelecimentoView()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const email = ref('')
const telefone = ref('')
const role = ref<EstablishmentUserRole>('Receptionist')
const saving = ref(false)

async function handleSubmit() {
  if (!estabelecimentoId.value) return
  const emailTrim = email.value.trim()
  const telefoneTrim = telefone.value.trim()
  if (!emailTrim && !telefoneTrim) {
    notifications.push('error', 'Informe o e-mail ou o telefone do usuário.')
    return
  }
  saving.value = true
  try {
    await equipeService.cadastrarUsuario(estabelecimentoId.value, {
      email: emailTrim || undefined,
      telefone: telefoneTrim || undefined,
      role: role.value,
    })
    notifications.push('success', 'Usuário adicionado à equipe.')
    await router.push(ROUTE_PATHS.CONFIG_EQUIPE)
  } catch (err) {
    notifications.push(
      'error',
      resolveError(err, 'Não foi possível adicionar o usuário. Verifique se ele já possui conta na plataforma.'),
    )
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-lg space-y-4 lg:space-y-6">
    <div>
      <h1 class="font-satoshi text-xl font-bold leading-tight text-glow-text lg:text-2xl">
        Adicionar usuário
      </h1>
      <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
        Vincule um usuário já cadastrado na plataforma à equipe do estabelecimento.
      </p>
    </div>

    <p v-if="contextError" class="font-urbanist text-sm text-red-600">{{ contextError }}</p>

    <BaseCard v-if="ready">
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <BaseInput
          v-model="email"
          label="E-mail"
          type="email"
          placeholder="usuario@exemplo.com"
          hint="Informe e-mail ou telefone (pelo menos um)."
        />
        <BaseInput
          v-model="telefone"
          label="Telefone"
          type="tel"
          placeholder="(11) 99999-9999"
        />
        <div>
          <label class="mb-1 block font-urbanist text-sm font-medium text-glow-text">Função</label>
          <select
            v-model="role"
            class="w-full rounded-lg border border-glow-border-soft bg-glow-surface px-3 py-2 font-urbanist text-sm text-glow-text"
            required
          >
            <option v-for="r in ROLES_CADASTRO" :key="r.value" :value="r.value">
              {{ r.label }}
            </option>
          </select>
        </div>
        <div class="flex flex-wrap gap-3">
          <BaseButton type="submit" :loading="saving">Adicionar</BaseButton>
          <RouterLink :to="ROUTE_PATHS.CONFIG_EQUIPE">
            <BaseButton variant="secondary">Cancelar</BaseButton>
          </RouterLink>
        </div>
      </form>
    </BaseCard>
  </div>
</template>

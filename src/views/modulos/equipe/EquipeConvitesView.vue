<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { conviteService } from '@/services/conviteService'
import { ROUTE_PATHS } from '@/constants/routes'
import { establishmentRoleLabel } from '@/constants/establishmentRoles'
import type { ConviteNegocio } from '@/types/convite.types'

const { estabelecimentoId, ready, error: contextError } = useEstabelecimentoView()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const convites = ref<ConviteNegocio[]>([])
const loading = ref(false)
const cancelandoId = ref<number | null>(null)

function formatarData(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function tipoConviteLabel(tipo: string): string {
  return tipo === 'Profissional' ? 'Profissional' : 'Usuário da equipe'
}

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  try {
    convites.value = await conviteService.listarConvites(estabelecimentoId.value, 'Pendente')
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    loading.value = false
  }
}

async function cancelar(convite: ConviteNegocio) {
  if (!estabelecimentoId.value) return
  cancelandoId.value = convite.id
  try {
    await conviteService.cancelarConvite(estabelecimentoId.value, convite.id)
    convites.value = convites.value.filter((c) => c.id !== convite.id)
    notifications.push('success', 'Convite cancelado.')
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    cancelandoId.value = null
  }
}

watch(ready, (isReady) => { if (isReady) void load() }, { immediate: true })
</script>

<template>
  <div class="space-y-4 lg:space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="font-satoshi text-xl font-bold leading-tight text-glow-text lg:text-2xl">
          Convites da equipe
        </h1>
        <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
          Convites pendentes enviados por e-mail ou link copiável.
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <RouterLink :to="{ path: ROUTE_PATHS.CONFIG_EQUIPE, query: { acao: 'convite' } }">
          <BaseButton variant="primary" size="sm">Enviar convite</BaseButton>
        </RouterLink>
        <RouterLink :to="ROUTE_PATHS.CONFIG_EQUIPE">
          <BaseButton variant="secondary" size="sm">Voltar à equipe</BaseButton>
        </RouterLink>
      </div>
    </div>

    <p v-if="contextError" class="font-urbanist text-sm text-red-600">{{ contextError }}</p>

    <LoadingSpinner v-if="loading" />

    <EmptyState
      v-else-if="ready && convites.length === 0"
      title="Nenhum convite pendente"
      description="Envie um convite pela equipe para ver a listagem aqui."
    />

    <BaseCard v-else-if="ready && convites.length > 0">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[640px] text-left font-urbanist text-sm">
          <thead>
            <tr class="border-b border-glow-border-soft text-glow-text-subtle">
              <th class="pb-2 pr-4 font-medium">E-mail</th>
              <th class="pb-2 pr-4 font-medium">Função</th>
              <th class="pb-2 pr-4 font-medium">Tipo</th>
              <th class="pb-2 pr-4 font-medium">Expira em</th>
              <th class="pb-2 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="convite in convites"
              :key="convite.id"
              class="border-b border-glow-border-soft last:border-0"
            >
              <td class="py-3 pr-4 text-glow-text">{{ convite.email }}</td>
              <td class="py-3 pr-4 text-glow-text">
                {{ establishmentRoleLabel(convite.roleSugerida) }}
              </td>
              <td class="py-3 pr-4 text-glow-text-subtle">
                {{ tipoConviteLabel(convite.tipoConvite) }}
              </td>
              <td class="py-3 pr-4 text-glow-text-subtle">
                {{ formatarData(convite.expiraEm) }}
              </td>
              <td class="py-3">
                <BaseButton
                  variant="secondary"
                  size="sm"
                  :loading="cancelandoId === convite.id"
                  @click="cancelar(convite)"
                >
                  Cancelar
                </BaseButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </BaseCard>
  </div>
</template>

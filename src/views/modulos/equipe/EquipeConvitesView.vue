<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import ContentAlert from '@/components/feedback/ContentAlert.vue'
import EquipePageHeader from '@/components/equipe/EquipePageHeader.vue'
import { EQUIPE_PAGE_CLASS } from '@/constants/designTokens'
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

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    Ativo: 'Ativo',
    Expirado: 'Expirado',
    Esgotado: 'Esgotado',
    Cancelado: 'Cancelado',
  }
  return map[status] ?? status
}

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  try {
    convites.value = await conviteService.listarConvites(estabelecimentoId.value)
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
    await load()
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
  <div :class="EQUIPE_PAGE_CLASS">
    <EquipePageHeader
      title="Links enviados"
      subtitle="Links de convite da loja: usos, limite, função e validade."
    >
      <template #actions>
        <RouterLink
          :to="{ path: ROUTE_PATHS.CONFIG_EQUIPE, query: { acao: 'convite' } }"
          class="equipe-btn-primary equipe-btn-primary--add"
        >
          Gerar link
        </RouterLink>
        <RouterLink :to="ROUTE_PATHS.CONFIG_EQUIPE" class="equipe-btn-outline equipe-btn-outline--links">
          Voltar à equipe
        </RouterLink>
      </template>
    </EquipePageHeader>

    <ContentAlert v-if="contextError" variant="error" title="Não foi possível continuar">
      {{ contextError }}
    </ContentAlert>

    <div v-if="!loading && ready && convites.length === 0" class="equipe-empty-state">
      <h2 class="equipe-empty-state__title">Nenhum link criado</h2>
      <p class="equipe-empty-state__description">
        Gere um link de convite pela equipe para ver a listagem aqui.
      </p>
    </div>

    <template v-else-if="ready && convites.length > 0">
      <div class="equipe-convites-table-wrap hidden md:block">
        <table class="equipe-convites-table">
          <thead>
            <tr class="equipe-convites-table__head-row">
              <th class="equipe-convites-table__th">Função</th>
              <th class="equipe-convites-table__th">Usos</th>
              <th class="equipe-convites-table__th">Status</th>
              <th class="equipe-convites-table__th">Criado em</th>
              <th class="equipe-convites-table__th">Expira em</th>
              <th class="equipe-convites-table__th">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="convite in convites"
              :key="convite.id"
              class="equipe-convites-table__row"
            >
              <td class="equipe-convites-table__td">
                {{ establishmentRoleLabel(convite.roleSugerida) }}
              </td>
              <td class="equipe-convites-table__td">
                {{ convite.quantidadeUtilizacoes }}/{{ convite.limiteUsuarios }}
              </td>
              <td class="equipe-convites-table__td">{{ statusLabel(convite.status) }}</td>
              <td class="equipe-convites-table__td equipe-convites-table__td--muted">
                {{ formatarData(convite.criadoEm) }}
              </td>
              <td class="equipe-convites-table__td equipe-convites-table__td--muted">
                {{ formatarData(convite.expiraEm) }}
              </td>
              <td class="equipe-convites-table__td">
                <button
                  v-if="convite.status === 'Ativo'"
                  type="button"
                  class="equipe-btn-outline h-9 px-3 text-xs"
                  :disabled="cancelandoId === convite.id"
                  @click="cancelar(convite)"
                >
                  {{ cancelandoId === convite.id ? 'Cancelando…' : 'Cancelar' }}
                </button>
                <span v-else class="font-urbanist text-xs text-glow-text-subtle">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="space-y-3 md:hidden">
        <div
          v-for="convite in convites"
          :key="convite.id"
          class="equipe-convites__row-card"
        >
          <p class="font-urbanist font-medium text-glow-text">
            {{ establishmentRoleLabel(convite.roleSugerida) }}
          </p>
          <div class="financeiro-table__row-meta">
            <div class="financeiro-table__row-meta-item">
              <span class="financeiro-table__row-meta-label">Usos</span>
              <span class="financeiro-table__row-meta-value">
                {{ convite.quantidadeUtilizacoes }}/{{ convite.limiteUsuarios }}
              </span>
            </div>
            <div class="financeiro-table__row-meta-item">
              <span class="financeiro-table__row-meta-label">Status</span>
              <span class="financeiro-table__row-meta-value">{{ statusLabel(convite.status) }}</span>
            </div>
            <div class="financeiro-table__row-meta-item">
              <span class="financeiro-table__row-meta-label">Expira em</span>
              <span class="financeiro-table__row-meta-value">{{ formatarData(convite.expiraEm) }}</span>
            </div>
          </div>
          <div v-if="convite.status === 'Ativo'" class="financeiro-table__row-actions">
            <button
              type="button"
              class="equipe-btn-outline min-h-11 w-full px-3 text-sm sm:w-auto"
              :disabled="cancelandoId === convite.id"
              @click="cancelar(convite)"
            >
              {{ cancelandoId === convite.id ? 'Cancelando…' : 'Cancelar convite' }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

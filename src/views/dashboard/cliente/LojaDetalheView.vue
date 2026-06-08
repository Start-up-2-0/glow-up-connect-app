<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseAlert from '@/components/feedback/BaseAlert.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import { publicoService } from '@/services/publicoService'
import { useGeolocation } from '@/composables/useGeolocation'
import { useApiError } from '@/composables/useApiError'
import { lojaAgendarPath } from '@/constants/routes'
import type { EstabelecimentoPublico } from '@/types/estabelecimento.types'
import type { ProfissionalVitrinePublico } from '@/types/negocio/profissionalVitrine.types'
import { formatDistanciaKm, formatEnderecoResumo } from '@/utils/formatters'

const route = useRoute()
const publicGuid = computed(() => String(route.params.publicGuid))
const { coords, request } = useGeolocation()
const { resolveError } = useApiError()

const loja = ref<EstabelecimentoPublico | null>(null)
const equipeVitrine = ref<ProfissionalVitrinePublico[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    await request()
    const [detalhe, vitrine] = await Promise.all([
      publicoService.obterEstabelecimento(publicGuid.value, {
        latitude: coords.value?.latitude,
        longitude: coords.value?.longitude,
      }),
      publicoService.listarProfissionaisVitrine(publicGuid.value).catch(() => []),
    ])
    loja.value = detalhe
    equipeVitrine.value = vitrine
  } catch (err) {
    error.value = resolveError(err, 'Não foi possível carregar a loja.')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="space-y-4 lg:space-y-6">
    <LoadingSpinner v-if="loading" />

    <template v-else-if="loja">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="flex min-w-0 gap-4">
          <div
            class="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-glow-canvas"
          >
            <img
              v-if="loja.logo"
              :src="loja.logo"
              :alt="loja.nome"
              class="size-full object-cover"
            />
            <span v-else class="font-satoshi text-2xl font-bold text-glow-text-subtle">
              {{ loja.nome.charAt(0) }}
            </span>
          </div>
          <div class="min-w-0">
            <h1 class="font-satoshi text-xl font-bold text-glow-text lg:text-2xl">
              {{ loja.nome }}
            </h1>
            <p
              v-if="loja.distanciaKm != null"
              class="mt-1 font-urbanist text-sm text-glow-text-subtle"
            >
              {{ formatDistanciaKm(loja.distanciaKm) }}
            </p>
            <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
              {{ formatEnderecoResumo(loja.endereco) }}
            </p>
          </div>
        </div>

        <RouterLink :to="lojaAgendarPath(loja.publicGuid)">
          <BaseButton>Agendar</BaseButton>
        </RouterLink>
      </div>

      <BaseCard v-if="loja.descricao" title="Sobre">
        <p class="font-urbanist text-sm text-glow-text">{{ loja.descricao }}</p>
      </BaseCard>

      <BaseCard v-if="equipeVitrine.length > 0" title="Nossa equipe">
        <div class="grid gap-4 sm:grid-cols-2">
          <div
            v-for="prof in equipeVitrine"
            :key="prof.publicGuid"
            class="flex items-start gap-3 rounded-lg border border-glow-border-soft bg-glow-canvas p-3"
          >
            <div
              class="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-glow-surface"
            >
              <img
                v-if="prof.logo"
                :src="prof.logo"
                :alt="prof.nomePublico"
                class="size-full object-cover"
              />
              <span v-else class="font-satoshi text-lg font-bold text-glow-text-subtle">
                {{ prof.nomePublico.charAt(0) }}
              </span>
            </div>
            <div class="min-w-0">
              <p class="font-urbanist text-sm font-medium text-glow-text">{{ prof.nomePublico }}</p>
              <p v-if="prof.biografia" class="mt-1 font-urbanist text-xs text-glow-text-subtle">
                {{ prof.biografia }}
              </p>
            </div>
          </div>
        </div>
      </BaseCard>
    </template>

    <BaseAlert v-else variant="error">{{ error ?? 'Loja não encontrada.' }}</BaseAlert>
  </div>
</template>

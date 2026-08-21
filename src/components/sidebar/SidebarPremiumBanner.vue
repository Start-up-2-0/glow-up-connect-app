<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { ArrowRight, Crown, Sparkles } from 'lucide-vue-next'
import { useNegocioStore } from '@/stores/negocio.store'
import { useAcessoUsuario } from '@/composables/useAcessoUsuario'
import { ROUTE_PATHS } from '@/constants/routes'
import { formatDate } from '@/utils/formatters'

defineProps<{ collapsed?: boolean }>()

const router = useRouter()
const negocioStore = useNegocioStore()
const { assinaturaAtiva, planoNome, assinaturaStatus, proximaDataVencimento } =
  storeToRefs(negocioStore)
const { temVinculoNegocio } = useAcessoUsuario()

const isPremium = computed(() => assinaturaAtiva.value && planoNome.value === 'Premium')

const planoAtual = computed(() => planoNome.value ?? 'Básico')
const proximaRenovacao = computed(() =>
  proximaDataVencimento.value ? formatDate(proximaDataVencimento.value) : '—',
)

function goUpgrade() {
  void router.push(temVinculoNegocio.value ? ROUTE_PATHS.CONFIG_ASSINATURA : ROUTE_PATHS.ONBOARDING_PLANOS)
}

function goAssinatura() {
  void router.push(ROUTE_PATHS.CONFIG_ASSINATURA)
}
</script>

<template>
  <!-- Flowbite-style CTA / status card -->
  <div
    v-if="isPremium"
    class="rounded-lg border border-glow-border-soft bg-glow-canvas p-3"
  >
    <div class="flex items-center gap-2">
      <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-glow-gold-cta/15 text-glow-gold-cta">
        <Crown :size="16" :stroke-width="1.75" />
      </span>
      <div class="min-w-0">
        <p class="font-urbanist text-sm font-semibold text-glow-text">Plano {{ planoAtual }}</p>
        <p class="font-urbanist text-xs text-glow-text-subtle">
          {{ assinaturaStatus ?? 'Ativa' }} · renova {{ proximaRenovacao }}
        </p>
      </div>
    </div>
    <button
      type="button"
      class="mt-3 w-full rounded-lg bg-glow-gold-cta/15 px-3 py-2 font-urbanist text-xs font-semibold text-glow-gold-cta transition-colors hover:bg-glow-gold-cta/25"
      @click="goAssinatura"
    >
      Gerenciar assinatura
    </button>
  </div>

  <div
    v-else
    class="rounded-lg border border-glow-gold-cta/30 bg-gradient-to-br from-glow-gold-cta/15 via-glow-gold-selected to-glow-gold-cta/25 p-3"
  >
    <div class="mb-1 flex items-center gap-1.5 text-glow-gold-cta">
      <Sparkles :size="16" :stroke-width="1.75" />
      <span class="font-urbanist text-xs font-semibold uppercase tracking-wide">Premium</span>
    </div>
    <p class="font-urbanist text-sm font-bold text-glow-text">Desbloqueie o Premium</p>
    <p class="mt-1 font-urbanist text-xs leading-relaxed text-glow-text-subtle">
      Recursos exclusivos, automações e mais.
    </p>
    <button
      type="button"
      class="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-glow-gold-cta px-3 py-2 font-urbanist text-sm font-semibold text-white transition-opacity hover:opacity-90"
      @click="goUpgrade"
    >
      Fazer upgrade
      <ArrowRight :size="14" :stroke-width="2" />
    </button>
  </div>
</template>

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

/** Premium = assinatura ativa com plano Premium. Demais = free (mostra upgrade). */
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
  <!-- Usuário Premium: card discreto de status -->
  <div v-if="isPremium" class="premium-card premium-card--status">
    <div class="flex items-center gap-2">
      <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-glow-gold-cta/15 text-glow-gold-cta">
        <Crown :size="16" :stroke-width="1.75" />
      </span>
      <div class="min-w-0">
        <p class="font-urbanist text-[13px] font-bold text-glow-text">Plano {{ planoAtual }}</p>
        <p class="font-urbanist text-[11px] text-glow-text-subtle">
          {{ assinaturaStatus ?? 'Ativa' }} · renova {{ proximaRenovacao }}
        </p>
      </div>
    </div>
    <button type="button" class="premium-card__manage" @click="goAssinatura">
      Gerenciar assinatura
    </button>
  </div>

  <!-- Free / não-Premium: banner de upgrade -->
  <div v-else class="premium-card premium-card--upgrade">
    <Sparkles class="premium-card__spark" :size="22" :stroke-width="1.5" />
    <p class="premium-card__title">Desbloqueie o Premium</p>
    <p class="premium-card__desc">
      Recursos exclusivos, automações avançadas e muito mais.
    </p>
    <button type="button" class="premium-card__cta" @click="goUpgrade">
      Fazer upgrade
      <ArrowRight :size="14" :stroke-width="2" class="premium-card__cta-arrow" />
    </button>
  </div>
</template>

<style scoped>
.premium-card {
  width: 100%;
  border-radius: 18px;
  padding: 14px;
  transition: all 0.18s ease;
}

.premium-card--upgrade {
  position: relative;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--glow-gold-cta) 35%, transparent);
  background:
    radial-gradient(120% 90% at 100% 0%, color-mix(in srgb, var(--glow-gold-cta) 22%, transparent) 0%, transparent 55%),
    linear-gradient(135deg, #f4eefa 0%, #e8dcf3 48%, #d8b9e8 100%);
  box-shadow: 0 10px 28px -18px rgba(82, 46, 95, 0.5);
}
.premium-card--upgrade::before {
  content: '';
  position: absolute;
  top: -34px;
  right: -26px;
  width: 90px;
  height: 90px;
  border-radius: 9999px;
  background: radial-gradient(circle, color-mix(in srgb, var(--glow-gold-cta) 35%, transparent), transparent 70%);
  filter: blur(8px);
  pointer-events: none;
}
.premium-card--upgrade:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 32px -16px rgba(82, 46, 95, 0.55);
}
.premium-card__spark {
  position: relative;
  color: var(--glow-gold-cta);
}
.premium-card__title {
  margin-top: 6px;
  font-family: 'Urbanist', ui-sans-serif, system-ui, sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: var(--glow-text);
}
.premium-card__desc {
  margin-top: 3px;
  font-family: 'Urbanist', ui-sans-serif, system-ui, sans-serif;
  font-size: 12px;
  line-height: 1.4;
  color: var(--glow-text-subtle);
}
.premium-card__cta {
  margin-top: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 9px 12px;
  border-radius: 12px;
  background: linear-gradient(120deg, var(--glow-gold-cta), var(--glow-gold-dark));
  color: #fff;
  font-family: 'Urbanist', ui-sans-serif, system-ui, sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: filter 0.18s ease, transform 0.18s ease;
}
.premium-card__cta:hover {
  filter: brightness(1.06);
  transform: translateY(-1px);
}
.premium-card__cta:focus-visible {
  outline: 2px solid var(--glow-gold);
  outline-offset: 2px;
}
.premium-card__cta-arrow {
  transition: transform 0.18s ease;
}
.premium-card__cta:hover .premium-card__cta-arrow {
  transform: translateX(2px);
}

.premium-card--status {
  border: 1px solid var(--glow-border-soft);
  background: var(--glow-surface);
}
.premium-card--status:hover {
  border-color: color-mix(in srgb, var(--glow-gold-cta) 40%, transparent);
}
.premium-card__manage {
  margin-top: 12px;
  width: 100%;
  padding: 8px 12px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--glow-gold-cta) 14%, transparent);
  color: var(--glow-gold-cta);
  font-family: 'Urbanist', ui-sans-serif, system-ui, sans-serif;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s ease;
}
.premium-card__manage:hover {
  background: color-mix(in srgb, var(--glow-gold-cta) 22%, transparent);
}
.premium-card__manage:focus-visible {
  outline: 2px solid var(--glow-gold-cta);
  outline-offset: 2px;
}
</style>
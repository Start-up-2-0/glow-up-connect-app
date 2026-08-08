<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { ArrowRight, Check, Crown, Sparkles } from 'lucide-vue-next'
import { useNegocioStore } from '@/stores/negocio.store'
import { useAcessoUsuario } from '@/composables/useAcessoUsuario'
import { ROUTE_PATHS } from '@/constants/routes'
import { formatDate } from '@/utils/formatters'

const router = useRouter()
const negocioStore = useNegocioStore()
const { assinaturaAtiva, planoNome, assinaturaStatus, proximaDataVencimento, ehProfissionalAutonomo } =
  storeToRefs(negocioStore)
const { temVinculoNegocio } = useAcessoUsuario()

const isPremium = computed(() => assinaturaAtiva.value && planoNome.value === 'Premium')
const planoAtual = computed(() => planoNome.value ?? 'Essencial')
const proximaRenovacao = computed(() =>
  proximaDataVencimento.value ? formatDate(proximaDataVencimento.value) : '—',
)

const premiumBenefits = computed(() =>
  ehProfissionalAutonomo.value
    ? ['WhatsApp automático', 'Financeiro pessoal', 'Destaque no Explorar']
    : ['Caixa e financeiro', 'Comissões e CRM', 'Até 5 unidades'],
)

function goUpgrade() {
  void router.push(temVinculoNegocio.value ? ROUTE_PATHS.CONFIG_ASSINATURA : ROUTE_PATHS.ONBOARDING_PLANOS)
}

function goAssinatura() {
  void router.push(ROUTE_PATHS.CONFIG_ASSINATURA)
}
</script>

<template>
  <div v-if="isPremium" class="premium-status">
    <div class="flex items-start gap-2.5">
      <span class="premium-status__icon">
        <Crown :size="15" :stroke-width="1.75" />
      </span>
      <div class="min-w-0 flex-1">
        <p class="font-urbanist text-[13px] font-semibold text-glow-text">Plano {{ planoAtual }}</p>
        <p class="mt-0.5 font-urbanist text-[11px] leading-relaxed text-glow-text-subtle">
          {{ assinaturaStatus ?? 'Ativa' }} · renova {{ proximaRenovacao }}
        </p>
      </div>
    </div>
    <button type="button" class="premium-status__btn" @click="goAssinatura">
      Gerenciar assinatura
    </button>
  </div>

  <div v-else class="premium-cta">
    <div class="premium-cta__glow" aria-hidden="true" />
    <div class="relative">
      <div class="mb-1.5 flex items-center gap-1.5 text-glow-gold-cta">
        <Sparkles :size="13" :stroke-width="1.75" class="premium-cta__spark" />
        <span class="font-urbanist text-[10px] font-semibold uppercase tracking-[0.12em]">
          Premium
        </span>
      </div>
      <p class="font-urbanist text-[13px] font-semibold tracking-tight text-glow-text">
        Desbloqueie o Premium
      </p>
      <ul class="mt-2 space-y-1">
        <li
          v-for="benefit in premiumBenefits"
          :key="benefit"
          class="flex items-center gap-1.5 font-urbanist text-[11px] leading-snug text-glow-text-subtle"
        >
          <Check :size="11" class="shrink-0 text-glow-gold-cta" :stroke-width="2.5" />
          {{ benefit }}
        </li>
      </ul>
      <button type="button" class="premium-cta__btn" @click="goUpgrade">
        Fazer upgrade
        <ArrowRight :size="13" :stroke-width="2" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.premium-status {
  border-radius: 14px;
  border: 1px solid var(--glow-border-soft);
  background: var(--glow-canvas);
  padding: 12px;
}
.premium-status__icon {
  display: inline-flex;
  height: 28px;
  width: 28px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: color-mix(in srgb, var(--glow-gold-cta) 14%, transparent);
  color: var(--glow-gold-cta);
}
.premium-status__btn {
  margin-top: 10px;
  width: 100%;
  border-radius: 10px;
  background: color-mix(in srgb, var(--glow-gold-cta) 12%, transparent);
  padding: 8px 10px;
  font-family: Urbanist, ui-sans-serif, system-ui, sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: var(--glow-gold-cta);
  transition: background 0.15s ease;
}
.premium-status__btn:hover {
  background: color-mix(in srgb, var(--glow-gold-cta) 20%, transparent);
}

.premium-cta {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--glow-gold-cta) 28%, transparent);
  background:
    linear-gradient(
      145deg,
      color-mix(in srgb, var(--glow-gold-cta) 18%, var(--glow-surface)) 0%,
      color-mix(in srgb, var(--glow-gold-selected) 80%, var(--glow-surface)) 55%,
      var(--glow-surface) 100%
    );
  padding: 12px;
  box-shadow: 0 10px 24px -18px rgba(82, 46, 95, 0.4);
}
.premium-cta__glow {
  pointer-events: none;
  position: absolute;
  top: -40%;
  right: -20%;
  height: 120px;
  width: 120px;
  border-radius: 9999px;
  background: radial-gradient(circle, color-mix(in srgb, var(--glow-gold-cta) 35%, transparent), transparent 70%);
  filter: blur(10px);
}
.premium-cta__spark {
  animation: premium-pulse 2.4s ease-in-out infinite;
}
.premium-cta__btn {
  margin-top: 10px;
  display: inline-flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 8px;
  background: linear-gradient(120deg, var(--glow-gold-cta), var(--glow-gold-dark, var(--glow-gold-cta)));
  padding: 8px 10px;
  font-family: Urbanist, ui-sans-serif, system-ui, sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  transition: transform 0.15s ease, filter 0.15s ease;
}
.premium-cta__btn:hover {
  filter: brightness(1.05);
  transform: translateY(-1px);
}
.premium-cta__btn:focus-visible {
  outline: 2px solid var(--glow-gold-cta);
  outline-offset: 2px;
}

@keyframes premium-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.08);
  }
}

@media (prefers-reduced-motion: reduce) {
  .premium-cta__spark {
    animation: none;
  }
}
</style>

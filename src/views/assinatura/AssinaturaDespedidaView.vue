<script setup lang="ts">
import { RouterLink } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import { ROUTE_PATHS } from '@/constants/routes'

const highlights = [
  'Seus dados e histórico permanecem salvos com segurança.',
  'Você pode voltar quando quiser — estaremos aqui para recebê-lo.',
  'Ao reativar, o pagamento é imediato (sem novo período de teste).',
]
</script>

<template>
  <div class="goodbye-page">
    <div class="goodbye-page__glow" aria-hidden="true" />

    <div class="goodbye-page__content">
      <p class="goodbye-page__eyebrow">Até breve</p>
      <h1 class="goodbye-page__title">
        Sentimos muito ver você partir
      </h1>
      <p class="goodbye-page__lead">
        Sua assinatura foi encerrada e seu acesso aos recursos do plano foi concluído.
        Agradecemos por ter construído seu negócio conosco — esperamos vê-lo de volta em breve.
      </p>

      <ul class="goodbye-page__list">
        <li v-for="item in highlights" :key="item">
          {{ item }}
        </li>
      </ul>

      <div class="goodbye-page__actions">
        <RouterLink :to="ROUTE_PATHS.ONBOARDING_PLANOS">
          <BaseButton variant="primary" size="lg">
            Reativar assinatura
          </BaseButton>
        </RouterLink>
        <RouterLink :to="ROUTE_PATHS.DASHBOARD">
          <BaseButton variant="secondary" size="lg">
            Ir para o início
          </BaseButton>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.goodbye-page {
  position: relative;
  min-height: calc(100dvh - 8rem);
  display: grid;
  place-items: center;
  padding: 2rem 1rem 3rem;
  overflow: hidden;
}

.goodbye-page__glow {
  position: absolute;
  inset: 10% 15% auto;
  height: 420px;
  border-radius: 999px;
  background:
    radial-gradient(circle at 30% 30%, rgba(236, 72, 153, 0.22), transparent 55%),
    radial-gradient(circle at 70% 20%, rgba(168, 85, 247, 0.18), transparent 50%);
  filter: blur(40px);
  pointer-events: none;
}

.goodbye-page__content {
  position: relative;
  width: min(640px, 100%);
  padding: 2.5rem 2rem;
  border-radius: 1.25rem;
  border: 1px solid var(--glow-border-soft, rgba(255, 255, 255, 0.08));
  background: color-mix(in srgb, var(--glow-surface, #111) 92%, transparent);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.28);
  text-align: center;
}

.goodbye-page__eyebrow {
  margin: 0 0 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgb(236, 72, 153);
}

.goodbye-page__title {
  margin: 0 0 1rem;
  font-family: var(--font-urbanist, inherit);
  font-size: clamp(1.75rem, 4vw, 2.35rem);
  line-height: 1.15;
  color: var(--glow-text, #f8fafc);
}

.goodbye-page__lead {
  margin: 0 auto 1.5rem;
  max-width: 34rem;
  font-size: 1rem;
  line-height: 1.65;
  color: var(--glow-text-subtle, #94a3b8);
}

.goodbye-page__list {
  margin: 0 auto 2rem;
  padding: 0;
  list-style: none;
  max-width: 30rem;
  text-align: left;
}

.goodbye-page__list li {
  position: relative;
  padding-left: 1.35rem;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--glow-text-subtle, #94a3b8);
}

.goodbye-page__list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.55rem;
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 999px;
  background: linear-gradient(135deg, rgb(236, 72, 153), rgb(168, 85, 247));
}

.goodbye-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}
</style>

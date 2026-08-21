<script setup lang="ts">
import AppLogo from '@/components/layout/AppLogo.vue'
</script>

<template>
  <div class="loader-mark" role="presentation" aria-hidden="true">
    <!-- Anel com arco em gradiente, girando lentamente -->
    <div class="loader-ring">
      <svg viewBox="0 0 120 120" class="loader-ring__svg">
        <defs>
          <linearGradient id="glowRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="var(--glow-gold-cta)" stop-opacity="0" />
            <stop offset="55%" stop-color="var(--glow-gold-cta)" stop-opacity="0.95" />
            <stop offset="100%" stop-color="var(--glow-gold)" stop-opacity="0" />
          </linearGradient>
        </defs>
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="url(#glowRingGrad)"
          stroke-width="3"
          stroke-linecap="round"
          stroke-dasharray="90 249"
          transform="rotate(-90 60 60)"
        />
      </svg>
    </div>

    <!-- Blob de glow atrás da marca -->
    <span class="loader-glow" />

    <!-- Marca central respirando -->
    <div class="loader-logo">
      <AppLogo compact logo-class="size-12 rounded-2xl object-contain" />
    </div>

    <!-- Partículas orbitando discretas -->
    <span class="loader-orbit">
      <i class="loader-orbit__dot" />
      <i class="loader-orbit__dot loader-orbit__dot--two" />
    </span>
  </div>
</template>

<style scoped>
.loader-mark {
  position: relative;
  width: 96px;
  height: 96px;
  display: grid;
  place-items: center;
}

.loader-ring {
  position: absolute;
  inset: 0;
  animation: loader-spin 2.6s linear infinite;
  will-change: transform;
}
.loader-ring__svg {
  width: 100%;
  height: 100%;
}

.loader-glow {
  position: absolute;
  inset: 12px;
  border-radius: 9999px;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--glow-gold-cta) 32%, transparent) 0%,
    transparent 68%
  );
  filter: blur(6px);
  opacity: 0.55;
  animation: loader-pulse 3s ease-in-out infinite;
  will-change: transform, opacity;
}

.loader-logo {
  position: relative;
  z-index: 1;
  animation: loader-breathe 2.6s ease-in-out infinite;
  will-change: transform, opacity;
  filter: drop-shadow(0 6px 18px color-mix(in srgb, var(--glow-gold-cta) 35%, transparent));
}

.loader-orbit {
  position: absolute;
  inset: 0;
  animation: loader-orbit 4s linear infinite;
  will-change: transform;
}
.loader-orbit__dot {
  position: absolute;
  top: 6px;
  left: 50%;
  width: 7px;
  height: 7px;
  margin-left: -3.5px;
  border-radius: 9999px;
  background: var(--glow-gold-cta);
  opacity: 0.8;
  animation: loader-fade 3s ease-in-out infinite;
}
.loader-orbit__dot--two {
  top: auto;
  bottom: 6px;
  opacity: 0.4;
  animation-delay: 1.5s;
}

@keyframes loader-spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes loader-orbit {
  to {
    transform: rotate(360deg);
  }
}
@keyframes loader-breathe {
  0%,
  100% {
    transform: scale(0.94);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.02);
    opacity: 1;
  }
}
@keyframes loader-pulse {
  0%,
  100% {
    transform: scale(0.92);
    opacity: 0.45;
  }
  50% {
    transform: scale(1.06);
    opacity: 0.6;
  }
}
@keyframes loader-fade {
  0%,
  100% {
    opacity: 0.15;
  }
  50% {
    opacity: 0.85;
  }
}

@media (prefers-reduced-motion: reduce) {
  .loader-ring,
  .loader-glow,
  .loader-orbit,
  .loader-logo {
    animation: none;
  }
}
</style>
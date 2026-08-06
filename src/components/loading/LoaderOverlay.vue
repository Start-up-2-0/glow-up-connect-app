<script setup lang="ts">
// Camada de fundo do loading. Recebe o conteúdo (animação + texto) via slot.
</script>

<template>
  <div class="loader-overlay">
    <div class="loader-overlay__panel"><slot /></div>
  </div>
</template>

<style scoped>
.loader-overlay {
  position: fixed;
  inset: 0;
  /* Acima do shell (sidebar/topbar ~2010–2020) e de modais de conteúdo. */
  z-index: 5000;
  display: grid;
  place-items: center;
  /* Backdrop translúcido com blur — a interface continua visível, sem fundo preto. */
  background: color-mix(in srgb, var(--glow-bg-elevated, #faf9fd) 55%, transparent);
  backdrop-filter: blur(10px) saturate(0.9);
  -webkit-backdrop-filter: blur(10px) saturate(0.9);
}

.loader-overlay__panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
  min-width: 220px;
  padding: 28px 36px;
}
</style>
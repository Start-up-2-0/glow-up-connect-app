<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  step: 1 | 2 | 3
}>()

const fillWidth = computed(() => {
  if (props.step === 1) return '0px'
  if (props.step === 2) return '192px'
  return '384px'
})
</script>

<template>
  <div
    class="recovery-stepper"
    :data-propriedade-1="`progresso${step}`"
    role="group"
    aria-label="Progresso da recuperação de senha"
  >
    <div class="recovery-stepper__track" aria-hidden="true" />
    <div class="recovery-stepper__fill" :style="{ width: fillWidth }" aria-hidden="true" />

    <div
      class="recovery-stepper__step recovery-stepper__step--1"
      :class="{ 'recovery-stepper__step--active': step === 1 }"
      :aria-current="step === 1 ? 'step' : undefined"
    >
      <span class="recovery-stepper__number">1</span>
    </div>

    <div
      class="recovery-stepper__step recovery-stepper__step--2"
      :class="{ 'recovery-stepper__step--active': step === 2 }"
      :aria-current="step === 2 ? 'step' : undefined"
    >
      <span class="recovery-stepper__number">2</span>
    </div>

    <div
      class="recovery-stepper__step recovery-stepper__step--3"
      :class="{ 'recovery-stepper__step--active': step === 3 }"
      :aria-current="step === 3 ? 'step' : undefined"
    >
      <span class="recovery-stepper__number">3</span>
    </div>
  </div>
</template>

<style scoped>
.recovery-stepper {
  position: relative;
  width: 461px;
  max-width: 100%;
  height: 48px;
  margin: 0 auto 48px;
  flex-shrink: 0;
}

/* Trilha com borda — Figma: left 38px, top 19px, w 384px, h 12px */
.recovery-stepper__track {
  position: absolute;
  left: 38px;
  top: 19px;
  width: 384px;
  max-width: calc(100% - 76px);
  height: 12px;
  border: 1px solid #ffbf00;
  box-sizing: border-box;
  pointer-events: none;
  z-index: 0;
}

/* Preenchimento — Figma: left 50px, top 23px, h 5px */
.recovery-stepper__fill {
  position: absolute;
  left: 50px;
  top: 23px;
  height: 5px;
  background-color: #ffbf00;
  transition: width 0.3s ease;
  pointer-events: none;
  z-index: 1;
}

/* Círculos — Figma: size 48px, bg #FFBF00 */
.recovery-stepper__step {
  position: absolute;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #ffbf00;
  z-index: 2;
}

.recovery-stepper__step--1 {
  left: 0;
}

.recovery-stepper__step--2 {
  left: 205px;
}

.recovery-stepper__step--3 {
  left: 410px;
}

/* Glow no passo ativo — Figma: blur 10px */
.recovery-stepper__step--active::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #ffbf00;
  filter: blur(10px);
  z-index: -1;
}

.recovery-stepper__number {
  position: relative;
  z-index: 1;
  font-family: Inter, system-ui, sans-serif;
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  line-height: 1;
  user-select: none;
}

@media (max-width: 480px) {
  .recovery-stepper {
    width: 100%;
  }

  .recovery-stepper__step--1 {
    left: 0;
  }

  .recovery-stepper__step--2 {
    left: calc(50% - 24px);
  }

  .recovery-stepper__step--3 {
    left: calc(100% - 48px);
  }

  .recovery-stepper__track {
    left: 24px;
    right: 24px;
    width: auto;
  }

  .recovery-stepper__fill {
    left: 36px;
    max-width: calc(100% - 72px);
  }
}
</style>

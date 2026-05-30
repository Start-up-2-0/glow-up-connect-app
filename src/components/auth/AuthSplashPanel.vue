<script setup lang="ts">
import loginBackground from '@/assets/auth/login-background.webp'
import { GLOW_SPLASH_IMAGE_CLASS, GLOW_SPLASH_PANEL_CLASS } from '@/constants/designTokens'

withDefaults(
  defineProps<{
    imageSrc?: string
  }>(),
  {
    imageSrc: loginBackground,
  },
)
</script>

<template>
  <aside :class="GLOW_SPLASH_PANEL_CLASS">
    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <img :src="imageSrc" alt="" :class="GLOW_SPLASH_IMAGE_CLASS" />
    </div>
    <div
      class="absolute inset-0 bg-gradient-to-l from-[rgba(163,138,45,0.2)] via-transparent via-[46.67%] to-[rgba(60,92,207,0.2)] to-[53.33%]"
      aria-hidden="true"
    />
    <div class="relative z-10 p-[30px] pt-5">
      <p class="font-satoshi text-2xl font-light text-white">Glow Up Connect</p>
      <p class="mt-1 font-satoshi leading-none">
        <span class="text-sm font-bold text-white">#</span><span class="text-base font-light text-white">VemPraGlow</span>
      </p>
    </div>
  </aside>
</template>

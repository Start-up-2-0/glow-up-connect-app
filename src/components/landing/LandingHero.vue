<script setup lang="ts">
import heroBg from '@/assets/landing/hero-bg.jpg'
import { LANDING_SECTIONS } from '@/constants/landing'
import { useLandingScroll } from '@/composables/useLandingScroll'
import LandingCtaButton from '@/components/landing/LandingCtaButton.vue'

const { goToSection } = useLandingScroll()
</script>

<template>
  <section
    :id="LANDING_SECTIONS.inicio"
    class="relative min-h-[929px] overflow-hidden"
  >
    <img
      :src="heroBg"
      alt=""
      class="absolute inset-0 size-full object-cover blur-[2px] scale-105"
      fetchpriority="high"
    />
    <div class="absolute inset-0 bg-[#282828]/40" aria-hidden="true" />

    <div class="relative z-10 mx-auto flex min-h-[929px] max-w-[1280px] flex-col items-center justify-center px-4 pb-24 pt-32 text-center lg:px-8">
      <div class="max-w-3xl">
        <h1 class="font-montserrat leading-[1.09] text-white/80">
          <span class="block text-3xl font-extralight sm:text-4xl lg:text-5xl xl:text-6xl">
            O início da sua
          </span>
          <span class="block text-3xl font-black text-glow-gold sm:text-4xl lg:text-5xl xl:text-6xl">
            transformação
          </span>
          <span class="block text-3xl font-extralight sm:text-4xl lg:text-5xl xl:text-6xl">
            começa aqui.
          </span>
        </h1>

        <p class="mx-auto mt-8 max-w-2xl font-poppins text-base font-light leading-[1.4] text-white sm:text-lg">
          Agende serviços de beleza com
          <span class="font-extrabold text-glow-gold-cta">um toque</span>.
          Conecte-se aos melhores profissionais e salões da sua região.
        </p>

        <div class="mt-10 flex justify-center">
          <button type="button" @click="goToSection(LANDING_SECTIONS.planos)">
            <LandingCtaButton label="Começar agora" />
          </button>
        </div>
      </div>
    </div>

    <div
      class="absolute bottom-24 right-8 hidden h-[85px] w-[45px] rounded-[200px] border-4 border-glow-gold lg:block"
      aria-hidden="true"
    >
      <div class="absolute left-1/2 top-4 size-3 -translate-x-1/2 rounded-full bg-glow-gold" />
    </div>
  </section>
</template>

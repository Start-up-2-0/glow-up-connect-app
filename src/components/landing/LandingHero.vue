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
    class="relative flex min-h-[min(100dvh,900px)] items-center justify-center overflow-hidden"
  >
    <img
      :src="heroBg"
      alt=""
      class="absolute inset-0 size-full object-cover"
      fetchpriority="high"
    />
    <div class="absolute inset-0 bg-[#282828]/65" aria-hidden="true" />

    <div class="relative z-10 mx-auto max-w-4xl px-4 py-32 text-center lg:px-8">
      <p class="mb-4 font-montserrat text-sm font-medium uppercase tracking-[0.2em] text-white/80">
        Beleza conectada
      </p>
      <h1 class="font-montserrat text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
        A plataforma que conecta sua beleza à
        <span class="text-glow-gold">transformação</span>
        digital
      </h1>
      <p class="mx-auto mt-6 max-w-2xl font-poppins text-base font-light text-white/85 sm:text-lg">
        Agende, gerencie e cresça com uma solução completa para clientes, profissionais e
        estabelecimentos de beleza.
      </p>
      <div class="mt-10 flex flex-wrap items-center justify-center gap-4">
        <button type="button" @click="goToSection(LANDING_SECTIONS.planos)">
          <LandingCtaButton label="Começar agora!" />
        </button>
        <button
          type="button"
          class="rounded-full border border-white/40 px-6 py-3 font-montserrat text-sm font-semibold text-white transition hover:bg-white/10"
          @click="goToSection(LANDING_SECTIONS.sobre)"
        >
          Saiba mais
        </button>
      </div>
    </div>
  </section>
</template>

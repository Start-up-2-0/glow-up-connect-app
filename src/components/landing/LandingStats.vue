<script setup lang="ts">
import LandingSectionTitle from '@/components/landing/LandingSectionTitle.vue'
import { LANDING_SECTIONS, LANDING_STATS } from '@/constants/landing'
</script>

<template>
  <section :id="LANDING_SECTIONS.usuarios" class="relative bg-[#f3f3f3] px-4 py-20 lg:px-8 lg:py-28">
    <div
      class="pointer-events-none absolute inset-x-0 -top-8 h-24 bg-gradient-to-b from-glow-purple/10 to-transparent"
      aria-hidden="true"
    />

    <div class="mx-auto max-w-[1280px]">
      <LandingSectionTitle before="Nossos " highlight="números" size="xl" centered />

      <p class="mx-auto mt-10 max-w-3xl text-center font-montserrat text-xl leading-[1.09] text-[#282828]">
        <span class="font-light">Faça parte do nosso ecossistema e </span>
        <span class="font-bold">alavanque</span>
        <span class="font-light"> seus números!</span>
      </p>

      <div class="mt-16 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="(stat, index) in LANDING_STATS"
          :key="stat.rotulo"
          class="relative"
          :class="index === 1 || index === 2 ? 'xl:-mt-2' : ''"
        >
          <div
            class="absolute left-2 top-0 w-full rounded-[20px] bg-glow-gold"
            :class="index === 1 || index === 2 ? 'h-[206px]' : 'h-[185px]'"
            aria-hidden="true"
          />
          <div
            class="relative flex flex-col items-center justify-center rounded-[20px] bg-glow-purple px-6 text-center"
            :class="index === 1 || index === 2 ? 'min-h-[206px]' : 'min-h-[185px]'"
          >
            <p class="font-montserrat text-6xl font-black leading-[1.09] text-glow-gold lg:text-[96px]">
              {{ stat.valor }}
            </p>
            <p class="mt-2 font-montserrat text-xl text-white">
              {{ stat.rotulo }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

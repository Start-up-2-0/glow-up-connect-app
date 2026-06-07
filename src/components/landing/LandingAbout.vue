<script setup lang="ts">
import aboutImg from '@/assets/landing/about-salon.jpg'
import sobreIcon1 from '@/assets/landing/sobre-icon-1.png'
import sobreIcon2 from '@/assets/landing/sobre-icon-2.png'
import sobreIcon3 from '@/assets/landing/sobre-icon-3.png'
import { LANDING_SECTIONS, SOBRE_BODY, SOBRE_FEATURES } from '@/constants/landing'

const featureIcons = [sobreIcon1, sobreIcon2, sobreIcon3]
</script>

<template>
  <section
    :id="LANDING_SECTIONS.sobre"
    class="relative overflow-hidden bg-[#f3f3f3] px-4 pb-24 pt-20 lg:px-8 lg:pt-28"
  >
    <div
      class="pointer-events-none absolute left-1/2 top-32 h-40 w-[min(1156px,90%)] -translate-x-1/2 rounded-full bg-glow-purple/15 blur-3xl"
      aria-hidden="true"
    />

    <div class="relative mx-auto grid max-w-[1280px] items-start gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-24">
      <div class="relative mx-auto w-full max-w-[588px] justify-self-center lg:justify-self-start">
        <div class="relative pl-[12%] pb-[14%]">
          <div
            class="absolute bottom-0 left-0 h-[84%] w-[95%] rounded-3xl bg-glow-purple"
            aria-hidden="true"
          />
          <div
            class="absolute bottom-[5%] left-[6%] h-[84%] w-[95%] rounded-3xl bg-glow-gold"
            aria-hidden="true"
          />
          <div class="relative z-10 aspect-[587/497] overflow-hidden rounded-3xl">
            <img
              :src="aboutImg"
              alt="Profissional de beleza em salão"
              class="h-full w-[161%] max-w-none object-cover object-center"
              style="margin-left: -51%"
            />
          </div>
        </div>
      </div>

      <div class="lg:pt-4">
        <h2 class="font-montserrat text-4xl font-light leading-[1.09] text-[#282828] sm:text-5xl lg:text-6xl xl:text-[96px]">
          <span class="block">Beleza e </span>
          <span class="block">
            tecnologia em
            <span class="font-black text-glow-gold">harmonia</span>
          </span>
        </h2>

        <div class="mt-11 space-y-0 font-poppins text-lg font-light leading-[1.09] text-[#282828]/50">
          <p v-for="(line, index) in SOBRE_BODY" :key="index">{{ line }}</p>
        </div>

        <ul class="mt-14 space-y-14">
          <li
            v-for="(feature, index) in SOBRE_FEATURES"
            :key="feature.titulo"
            class="flex gap-5"
          >
            <img
              :src="featureIcons[index]"
              alt=""
              class="mt-0.5 size-[50px] shrink-0"
              aria-hidden="true"
            />
            <div class="min-w-0">
              <h3 class="font-montserrat text-lg font-bold leading-[1.09] text-glow-gold">
                {{ feature.titulo }}
              </h3>
              <p class="mt-3 font-poppins text-base font-light leading-[1.09] text-[#282828]">
                {{ feature.descricao }}
              </p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

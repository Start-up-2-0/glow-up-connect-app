<script setup lang="ts">
import aboutImg from '@/assets/landing/about-salon.jpg'
import LandingSectionTitle from '@/components/landing/LandingSectionTitle.vue'
import { LANDING_SECTIONS, SOBRE_BODY, SOBRE_FEATURES } from '@/constants/landing'
</script>

<template>
  <section :id="LANDING_SECTIONS.sobre" class="bg-[#f3f3f3] px-4 pb-24 pt-20 lg:px-8 lg:pt-28">
    <div class="mx-auto grid max-w-[1280px] items-center gap-16 lg:grid-cols-2 lg:gap-20">
      <div class="relative mx-auto aspect-[587/497] w-full max-w-[588px] justify-self-start">
        <div
          class="absolute bottom-[6%] left-0 top-[15%] w-[95%] rounded-3xl bg-glow-purple"
          aria-hidden="true"
        />
        <div
          class="absolute bottom-[3%] left-[5%] top-[8%] w-[95%] rounded-3xl bg-glow-gold"
          aria-hidden="true"
        />
        <img
          :src="aboutImg"
          alt="Profissional de beleza atendendo cliente"
          class="relative z-10 size-full rounded-3xl object-cover"
        />
      </div>

      <div>
        <LandingSectionTitle before="Beleza e tecnologia em " highlight="harmonia" size="xl" />

        <div class="mt-11 space-y-0 font-poppins text-lg font-light leading-[1.09] text-[#282828]/50">
          <p v-for="(line, index) in SOBRE_BODY" :key="index">{{ line }}</p>
        </div>

        <ul class="mt-14 space-y-8">
          <li
            v-for="feature in SOBRE_FEATURES"
            :key="feature.titulo"
            class="flex gap-5"
          >
            <span
              class="mt-1 size-[50px] shrink-0 rounded-2xl bg-glow-gold"
              aria-hidden="true"
            />
            <div>
              <h3 class="font-montserrat text-lg font-bold text-glow-gold">
                {{ feature.titulo }}
              </h3>
              <p class="mt-2 font-poppins text-base font-light leading-[1.09] text-[#282828]">
                {{ feature.descricao }}
              </p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

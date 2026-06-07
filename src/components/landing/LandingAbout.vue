<script setup lang="ts">
import aboutImg from '@/assets/landing/about-salon.jpg'
import { LANDING_SECTIONS, SOBRE_FEATURES } from '@/constants/landing'
</script>

<template>
  <section :id="LANDING_SECTIONS.sobre" class="bg-[#f3f3f3] py-20 lg:py-28">
    <div class="mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-2 lg:gap-16 lg:px-8">
      <div class="relative mx-auto w-full max-w-md lg:max-w-none">
        <div
          class="absolute -left-3 -top-3 h-[calc(100%-24px)] w-[calc(100%-24px)] rounded-2xl border-4 border-glow-gold"
          aria-hidden="true"
        />
        <div
          class="absolute -bottom-3 -right-3 h-[calc(100%-24px)] w-[calc(100%-24px)] rounded-2xl border-4 border-glow-purple"
          aria-hidden="true"
        />
        <img
          :src="aboutImg"
          alt="Profissional de beleza atendendo cliente"
          class="relative z-10 aspect-[4/5] w-full rounded-2xl object-cover shadow-xl"
        />
      </div>

      <div>
        <p class="font-montserrat text-sm font-semibold uppercase tracking-wider text-glow-purple">
          Sobre nós
        </p>
        <h2 class="mt-3 font-montserrat text-3xl font-bold text-[#282828] lg:text-4xl">
          Harmonia entre tecnologia e
          <span class="text-glow-gold">cuidado</span>
        </h2>
        <p class="mt-5 font-poppins text-base leading-relaxed text-[#282828]/75">
          O Glow Up Connect nasceu para simplificar a rotina de quem busca bem-estar e de quem
          trabalha com beleza. Unimos agendamento, gestão e relacionamento em uma experiência
          moderna e humana.
        </p>

        <ul class="mt-10 space-y-6">
          <li
            v-for="(feature, index) in SOBRE_FEATURES"
            :key="feature.titulo"
            class="flex gap-4"
          >
            <span
              class="flex size-10 shrink-0 items-center justify-center rounded-full font-montserrat text-sm font-bold text-white"
              :class="index % 2 === 0 ? 'bg-glow-gold' : 'bg-glow-purple'"
            >
              {{ index + 1 }}
            </span>
            <div>
              <h3 class="font-montserrat text-lg font-semibold text-[#282828]">
                {{ feature.titulo }}
              </h3>
              <p class="mt-1 font-poppins text-sm text-[#282828]/70">
                {{ feature.descricao }}
              </p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

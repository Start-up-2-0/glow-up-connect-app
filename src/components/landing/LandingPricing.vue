<script setup lang="ts">
import PlanosOnboardingSection from '@/components/assinatura/PlanosOnboardingSection.vue'
import LandingSectionTitle from '@/components/landing/LandingSectionTitle.vue'
import { LANDING_SECTIONS } from '@/constants/landing'
</script>

<template>
  <section :id="LANDING_SECTIONS.planos" class="bg-[#f3f3f3] px-4 py-20 lg:px-8 lg:py-28">
    <div class="mx-auto max-w-[1280px]">
      <LandingSectionTitle
        before="Invista no seu "
        highlight="estabelecimento"
        size="xl"
        centered
      />

      <p class="mx-auto mt-10 max-w-3xl text-center font-montserrat text-xl leading-[1.09] text-[#282828]">
        <span class="font-light">Escolha o plano ideal para o momento do seu negócio. </span>
        <span class="font-bold">Sem surpresas, sem taxas escondidas</span>
        <span class="font-light">.</span>
      </p>

      <div class="mt-16">
        <PlanosOnboardingSection />
      </div>
    </div>
  </section>
</template>

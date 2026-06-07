<script setup lang="ts">
import { ref } from 'vue'
import LandingSectionTitle from '@/components/landing/LandingSectionTitle.vue'
import LandingBeneficioIcon from '@/components/landing/LandingBeneficioIcon.vue'
import {
  BENEFICIOS_INTRO,
  BENEFICIOS_POR_TAB,
  LANDING_SECTIONS,
  type BeneficioTab,
} from '@/constants/landing'

const tabs: { id: BeneficioTab; label: string }[] = [
  { id: 'usuarios', label: 'Usuários' },
  { id: 'profissionais', label: 'Profissionais' },
  { id: 'estabelecimentos', label: 'Estabelecimentos' },
]

const activeTab = ref<BeneficioTab>('usuarios')
</script>

<template>
  <section :id="LANDING_SECTIONS.beneficios" class="bg-[#f3f3f3] px-4 py-20 lg:px-8 lg:py-28">
    <div class="mx-auto max-w-[1280px]">
      <LandingSectionTitle before="Benefícios para cada " highlight="perfil" size="xl" />

      <div class="mx-auto mt-14 flex max-w-[711px] flex-col gap-2 rounded-[80px] border border-[#282828]/40 bg-[#f3f3f3] p-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="flex-1 rounded-[80px] px-5 py-4 font-montserrat text-base transition sm:px-7 sm:py-5 sm:text-xl"
          :class="
            activeTab === tab.id
              ? 'bg-glow-purple font-semibold text-white/80'
              : 'font-normal text-[#282828]/80 hover:text-[#282828]'
          "
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <p class="mx-auto mt-10 max-w-3xl text-center font-montserrat text-xl leading-[1.09] text-[#282828]">
        <span class="font-light">{{ BENEFICIOS_INTRO[activeTab].linha1 }}</span>
        <span class="font-bold">{{ BENEFICIOS_INTRO[activeTab].destaque1 }}</span>
        <span class="font-light">{{ BENEFICIOS_INTRO[activeTab].linha2 }}</span>
        <span class="font-bold">{{ BENEFICIOS_INTRO[activeTab].destaque2 }}</span>
        <span class="font-light">.</span>
      </p>

      <div class="mt-14 grid gap-5 lg:grid-cols-2">
        <article
          v-for="item in BENEFICIOS_POR_TAB[activeTab]"
          :key="item.titulo"
          class="relative min-h-[288px] rounded-[20px] border border-[#282828]/40 p-8 pt-[88px]"
        >
          <span
            class="absolute left-8 top-8 flex size-[58px] items-center justify-center rounded-2xl bg-glow-gold"
            aria-hidden="true"
          >
            <LandingBeneficioIcon :name="item.icon" />
          </span>
          <h3 class="font-montserrat text-2xl font-bold text-glow-gold">
            {{ item.titulo }}
          </h3>
          <p class="mt-4 font-poppins text-base font-light leading-[1.09] text-[#282828]/60">
            {{ item.descricao }}
          </p>
        </article>
      </div>
    </div>
  </section>
</template>

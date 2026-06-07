<script setup lang="ts">
import { ref } from 'vue'
import {
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
  <section :id="LANDING_SECTIONS.beneficios" class="bg-white py-20 lg:py-28">
    <div class="mx-auto max-w-7xl px-4 lg:px-8">
      <div class="mx-auto max-w-2xl text-center">
        <p class="font-montserrat text-sm font-semibold uppercase tracking-wider text-glow-purple">
          Benefícios
        </p>
        <h2 class="mt-3 font-montserrat text-3xl font-bold text-[#282828] lg:text-4xl">
          Feito para cada perfil do ecossistema
        </h2>
        <p class="mt-4 font-poppins text-base text-[#282828]/70">
          Descubra como a plataforma entrega valor para quem agenda, atende e administra.
        </p>
      </div>

      <div class="mt-10 flex flex-wrap justify-center gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="rounded-full px-5 py-2.5 font-montserrat text-sm font-semibold transition"
          :class="
            activeTab === tab.id
              ? 'bg-glow-purple text-white shadow-md'
              : 'bg-[#f3f3f3] text-[#282828]/70 hover:bg-[#ebebeb]'
          "
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="mt-12 grid gap-6 sm:grid-cols-2">
        <article
          v-for="item in BENEFICIOS_POR_TAB[activeTab]"
          :key="item.titulo"
          class="rounded-2xl border border-[#ebebeb] bg-[#fafafa] p-6 transition hover:border-glow-purple/30 hover:shadow-md"
        >
          <div class="mb-4 flex size-10 items-center justify-center rounded-full bg-glow-gold/20 text-glow-gold">
            <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <h3 class="font-montserrat text-lg font-semibold text-[#282828]">
            {{ item.titulo }}
          </h3>
          <p class="mt-2 font-poppins text-sm leading-relaxed text-[#282828]/70">
            {{ item.descricao }}
          </p>
        </article>
      </div>
    </div>
  </section>
</template>

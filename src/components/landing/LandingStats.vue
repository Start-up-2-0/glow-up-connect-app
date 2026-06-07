<script setup lang="ts">
import { LANDING_SECTIONS, LANDING_STATS } from '@/constants/landing'
</script>

<template>
  <section
    :id="LANDING_SECTIONS.usuarios"
    class="bg-glow-purple py-16 lg:py-20"
  >
    <div class="mx-auto max-w-7xl px-4 lg:px-8">
      <div class="grid grid-cols-2 gap-8 lg:grid-cols-4">
        <div
          v-for="stat in LANDING_STATS"
          :key="stat.rotulo"
          class="text-center"
        >
          <p class="font-montserrat text-4xl font-black text-white lg:text-5xl">
            {{ stat.valor }}
          </p>
          <p class="mt-2 font-poppins text-sm font-medium text-white/85">
            {{ stat.rotulo }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

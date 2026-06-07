<script setup lang="ts">
import { FOOTER_TAGLINE } from '@/constants/landing'
</script>

<template>
  <footer class="relative bg-[#282828] px-4 py-12 text-white lg:px-8">
    <div class="mx-auto grid max-w-[1280px] gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-start">
      <div>
        <p class="font-satoshi text-2xl">
          <span class="font-light">Glow Up </span>
          <span class="font-black">Connect</span>
        </p>
        <div class="mt-5 font-satoshi text-base text-white/60">
          <p v-for="(line, index) in FOOTER_TAGLINE" :key="index">{{ line }}</p>
        </div>
        <p class="mt-10 font-satoshi text-xs text-white/60">
          {{ new Date().getFullYear() }} Glow Up Connect. Todos os direitos reservados.
        </p>
      </div>

      <div class="lg:text-right">
        <p class="font-satoshi text-base text-white/60">Contato: contato@glowup.com.br</p>
        <p class="mt-2 font-satoshi text-base text-white/60">(79) 9 9999-9999</p>
        <p class="mt-10 font-satoshi text-base text-white/60">
          <span>#</span><span class="font-black">VemPraGlow</span>
        </p>
      </div>
    </div>
  </footer>
</template>

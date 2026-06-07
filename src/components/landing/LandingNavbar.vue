<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import logo from '@/assets/logo/logo.png'
import { LANDING_SECTIONS } from '@/constants/landing'
import { ROUTE_PATHS } from '@/constants/routes'
import { useLandingScroll } from '@/composables/useLandingScroll'
import LandingCtaButton from '@/components/landing/LandingCtaButton.vue'

const { goToSection } = useLandingScroll()
const scrolled = ref(false)
const menuOpen = ref(false)

const navLinks = [
  { label: 'Início', id: LANDING_SECTIONS.inicio },
  { label: 'Sobre nós', id: LANDING_SECTIONS.sobre },
  { label: 'Benefícios', id: LANDING_SECTIONS.beneficios },
  { label: 'Usuários', id: LANDING_SECTIONS.usuarios },
  { label: 'Planos', id: LANDING_SECTIONS.planos },
] as const

function onScroll() {
  scrolled.value = window.scrollY > 24
}

function handleNavClick(id: string) {
  menuOpen.value = false
  goToSection(id)
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 transition-colors duration-300"
    :class="scrolled ? 'bg-[#282828]/95 shadow-lg backdrop-blur-sm' : 'bg-transparent'"
  >
    <div class="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 lg:px-8">
      <RouterLink :to="ROUTE_PATHS.HOME" class="flex items-center gap-2" @click="handleNavClick(LANDING_SECTIONS.inicio)">
        <img :src="logo" alt="Glow Up Connect" class="h-9 w-auto brightness-0 invert" />
      </RouterLink>

      <nav class="hidden items-center gap-8 lg:flex" aria-label="Navegação principal">
        <button
          v-for="link in navLinks"
          :key="link.id"
          type="button"
          class="font-montserrat text-sm font-medium text-white/90 transition hover:text-white"
          @click="handleNavClick(link.id)"
        >
          {{ link.label }}
        </button>
      </nav>

      <div class="hidden lg:block">
        <button type="button" @click="handleNavClick(LANDING_SECTIONS.planos)">
          <LandingCtaButton label="Começar agora!" />
        </button>
      </div>

      <button
        type="button"
        class="flex size-10 items-center justify-center rounded-lg text-white lg:hidden"
        aria-label="Abrir menu"
        @click="menuOpen = !menuOpen"
      >
        <svg class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path v-if="!menuOpen" d="M4 7h16M4 12h16M4 17h16" stroke-linecap="round" />
          <path v-else d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <div
      v-if="menuOpen"
      class="border-t border-white/10 bg-[#282828]/98 px-4 py-4 lg:hidden"
    >
      <nav class="flex flex-col gap-3" aria-label="Menu mobile">
        <button
          v-for="link in navLinks"
          :key="link.id"
          type="button"
          class="rounded-lg px-3 py-2 text-left font-montserrat text-sm font-medium text-white"
          @click="handleNavClick(link.id)"
        >
          {{ link.label }}
        </button>
        <button type="button" class="pt-2" @click="handleNavClick(LANDING_SECTIONS.planos)">
          <LandingCtaButton label="Começar agora!" class="w-full justify-center" />
        </button>
      </nav>
    </div>
  </header>
</template>

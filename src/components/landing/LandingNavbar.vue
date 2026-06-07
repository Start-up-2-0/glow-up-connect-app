<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { LANDING_SECTIONS } from '@/constants/landing'
import { ROUTE_PATHS } from '@/constants/routes'
import { useLandingScroll } from '@/composables/useLandingScroll'
import LandingCtaButton from '@/components/landing/LandingCtaButton.vue'

const { goToSection } = useLandingScroll()
const menuOpen = ref(false)
const activeSection = ref<string>(LANDING_SECTIONS.inicio)
const navbarVisible = ref(true)

const navLinks = [
  { label: 'Início', id: LANDING_SECTIONS.inicio },
  { label: 'Sobre nós', id: LANDING_SECTIONS.sobre },
  { label: 'Benefícios', id: LANDING_SECTIONS.beneficios },
  { label: 'Usuários', id: LANDING_SECTIONS.usuarios },
  { label: 'Planos', id: LANDING_SECTIONS.planos },
] as const

function handleNavClick(id: string) {
  menuOpen.value = false
  activeSection.value = id
  goToSection(id)
}

function updateNavbarVisibility() {
  const hero = document.getElementById(LANDING_SECTIONS.inicio)
  if (!hero) {
    navbarVisible.value = true
    return
  }

  const heroBottom = hero.getBoundingClientRect().bottom
  navbarVisible.value = heroBottom > 48

  if (!navbarVisible.value) {
    menuOpen.value = false
  }
}

function updateActiveSection() {
  const offset = 120
  const sections = Object.values(LANDING_SECTIONS)
  for (let i = sections.length - 1; i >= 0; i--) {
    const el = document.getElementById(sections[i])
    if (el && el.getBoundingClientRect().top <= offset) {
      activeSection.value = sections[i]
      return
    }
  }
  activeSection.value = LANDING_SECTIONS.inicio
}

function handleScroll() {
  updateNavbarVisibility()
  updateActiveSection()
}

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
})
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<template>
  <header
    class="fixed inset-x-0 top-0 z-50 px-4 pt-6 transition-[transform,opacity] duration-300 ease-out lg:px-8"
    :class="
      navbarVisible
        ? 'translate-y-0 opacity-100'
        : 'pointer-events-none -translate-y-full opacity-0'
    "
  >
    <div class="mx-auto flex max-w-[1280px] items-center justify-between">
      <RouterLink
        :to="ROUTE_PATHS.HOME"
        class="font-satoshi text-2xl text-white"
        @click="handleNavClick(LANDING_SECTIONS.inicio)"
      >
        <span class="font-light">GlowUp </span>
        <span class="font-black">Connect</span>
      </RouterLink>

      <nav
        class="relative hidden items-center gap-9 rounded-[80px] bg-[#282828] px-10 py-6 lg:flex"
        aria-label="Navegação principal"
      >
        <button
          v-for="link in navLinks"
          :key="link.id"
          type="button"
          class="relative font-satoshi text-base text-white transition hover:text-white/90"
          :class="activeSection === link.id ? 'font-black' : 'font-normal'"
          @click="handleNavClick(link.id)"
        >
          {{ link.label }}
          <span
            v-if="activeSection === link.id"
            class="absolute -bottom-3 left-1/2 h-0.5 w-6 -translate-x-1/2 bg-glow-gold"
          />
        </button>
      </nav>

      <div class="hidden lg:block">
        <div class="relative">
          <div
            class="pointer-events-none absolute -left-4 top-1 h-[18px] w-[260px] rounded-3xl bg-glow-gold/80 blur-[50px]"
            aria-hidden="true"
          />
          <button type="button" @click="handleNavClick(LANDING_SECTIONS.planos)">
            <LandingCtaButton label="Começar agora!" size="sm" class="!h-11 !rounded-3xl !px-5 !text-base" />
          </button>
        </div>
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
      class="mx-auto mt-3 max-w-[1280px] rounded-2xl border border-white/10 bg-[#282828] px-4 py-4 lg:hidden"
    >
      <nav class="flex flex-col gap-2" aria-label="Menu mobile">
        <button
          v-for="link in navLinks"
          :key="link.id"
          type="button"
          class="rounded-lg px-3 py-2.5 text-left font-satoshi text-base text-white"
          :class="activeSection === link.id ? 'font-black' : 'font-normal'"
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

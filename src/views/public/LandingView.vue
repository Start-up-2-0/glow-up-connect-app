<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import LandingNavbar from '@/components/landing/LandingNavbar.vue'
import LandingHero from '@/components/landing/LandingHero.vue'
import LandingAbout from '@/components/landing/LandingAbout.vue'
import LandingBenefits from '@/components/landing/LandingBenefits.vue'
import LandingStats from '@/components/landing/LandingStats.vue'
import LandingPricing from '@/components/landing/LandingPricing.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'
import LandingWhatsappFab from '@/components/landing/LandingWhatsappFab.vue'
import { useLandingScroll } from '@/composables/useLandingScroll'

const route = useRoute()
const { scrollToSection } = useLandingScroll()

function handleHashScroll() {
  if (route.hash) {
    requestAnimationFrame(() => scrollToSection(route.hash))
  }
}

onMounted(handleHashScroll)
watch(() => route.hash, handleHashScroll)
</script>

<template>
  <div class="overflow-x-hidden bg-[#f3f3f3]">
    <LandingNavbar />
    <main>
      <LandingHero />
      <LandingAbout />
      <LandingBenefits />
      <LandingStats />
      <LandingPricing />
    </main>
    <LandingFooter />
    <LandingWhatsappFab />
  </div>
</template>

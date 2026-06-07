<script setup lang="ts">
import { RouterLink } from 'vue-router'
import logo from '@/assets/logo/logo.png'
import { LANDING_SECTIONS } from '@/constants/landing'
import { ROUTE_PATHS } from '@/constants/routes'
import { useLandingScroll } from '@/composables/useLandingScroll'

const { goToSection } = useLandingScroll()

const footerLinks = [
  { label: 'Início', id: LANDING_SECTIONS.inicio },
  { label: 'Sobre', id: LANDING_SECTIONS.sobre },
  { label: 'Benefícios', id: LANDING_SECTIONS.beneficios },
  { label: 'Planos', id: LANDING_SECTIONS.planos },
] as const
</script>

<template>
  <footer class="bg-[#282828] py-14 text-white">
    <div class="mx-auto max-w-7xl px-4 lg:px-8">
      <div class="grid gap-10 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <img :src="logo" alt="Glow Up Connect" class="h-10 w-auto brightness-0 invert" />
          <p class="mt-4 max-w-sm font-poppins text-sm leading-relaxed text-white/70">
            Conectamos clientes, profissionais e estabelecimentos em uma plataforma moderna de
            agendamento e gestão.
          </p>
        </div>

        <div>
          <h3 class="font-montserrat text-sm font-bold uppercase tracking-wider text-glow-gold">
            Navegação
          </h3>
          <ul class="mt-4 space-y-2">
            <li v-for="link in footerLinks" :key="link.id">
              <button
                type="button"
                class="font-poppins text-sm text-white/70 transition hover:text-white"
                @click="goToSection(link.id)"
              >
                {{ link.label }}
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="font-montserrat text-sm font-bold uppercase tracking-wider text-glow-gold">
            Conta
          </h3>
          <ul class="mt-4 space-y-2">
            <li>
              <RouterLink
                :to="ROUTE_PATHS.LOGIN"
                class="font-poppins text-sm text-white/70 transition hover:text-white"
              >
                Entrar
              </RouterLink>
            </li>
            <li>
              <RouterLink
                :to="ROUTE_PATHS.REGISTER"
                class="font-poppins text-sm text-white/70 transition hover:text-white"
              >
                Criar conta
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-12 border-t border-white/10 pt-8 text-center">
        <p class="font-poppins text-xs text-white/50">
          © {{ new Date().getFullYear() }} Glow Up Connect. Todos os direitos reservados.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import loginBackground from '@/assets/auth/login-background.webp'
</script>

<template>
  <div class="relative hidden flex-1 lg:block">
    <!-- Background image -->
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <img
        :src="loginBackground"
        alt=""
        class="h-full w-full object-cover"
      />
    </div>

    <!-- Dark overlay -->
    <div
      class="absolute inset-0 bg-gradient-to-b from-black/15 to-black/65"
      aria-hidden="true"
    />

    <!-- Conteúdo -->
    <div class="relative z-10 flex h-full flex-col px-10 pb-10 pt-10">
      <!-- Brand -->
      <div>
        <p class="font-satoshi text-3xl font-bold text-white">Glow Up Connect</p>
        <p class="mt-1 font-satoshi leading-none">
          <span class="text-sm font-bold text-white">#</span>
          <span class="text-base font-light text-white">VemPraGlow</span>
        </p>
      </div>

      <!-- Headline -->
      <div class="mt-auto">
        <h2 class="font-satoshi text-[28px] font-bold leading-tight text-white sm:text-[34px]">
          Agende com os<br />melhores profissionais
        </h2>
        <p class="mt-3 max-w-md font-satoshi text-base leading-relaxed text-white/80">
          Descubra barbearias, salões e clínicas de estética próximas de você.
        </p>
      </div>

      <!-- Prova social -->
      <div class="mt-8 grid grid-cols-2 gap-3">
        <div class="rounded-xl bg-white/10 backdrop-blur-sm">
          <div class="flex flex-col items-start px-3.5 py-3.5">
            <span class="font-satoshi text-xl font-bold text-white">+300</span>
            <span class="mt-0.5 font-satoshi text-xs text-white/70">estabelecimentos</span>
          </div>
        </div>
        <div class="rounded-xl bg-white/10 backdrop-blur-sm">
          <div class="flex flex-col items-start px-3.5 py-3.5">
            <span class="font-satoshi text-xl font-bold text-white">+12k</span>
            <span class="mt-0.5 font-satoshi text-xs text-white/70">clientes</span>
          </div>
        </div>
        <div class="rounded-xl bg-white/10 backdrop-blur-sm">
          <div class="flex flex-col items-start px-3.5 py-3.5">
            <div class="flex items-center gap-1">
              <span class="font-satoshi text-xl font-bold text-white">4,9</span>
              <svg class="size-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <span class="mt-0.5 font-satoshi text-xs text-white/70">avaliação</span>
          </div>
        </div>
        <div class="rounded-xl bg-white/10 backdrop-blur-sm">
          <div class="flex flex-col items-start px-3.5 py-3.5">
            <span class="font-satoshi text-xl font-bold text-white">+5k</span>
            <span class="mt-0.5 font-satoshi text-xs text-white/70">agendamentos</span>
          </div>
        </div>
      </div>

      <!-- Benefícios -->
      <div class="mt-6 space-y-2.5">
        <div class="flex items-center gap-3">
          <svg class="size-4 shrink-0 text-[#4BC281]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          <span class="font-satoshi text-sm text-white/90">Agendamento online</span>
        </div>
        <div class="flex items-center gap-3">
          <svg class="size-4 shrink-0 text-[#4BC281]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          <span class="font-satoshi text-sm text-white/90">Confirmação automática</span>
        </div>
        <div class="flex items-center gap-3">
          <svg class="size-4 shrink-0 text-[#4BC281]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          <span class="font-satoshi text-sm text-white/90">WhatsApp integrado</span>
        </div>
      </div>
    </div>
  </div>
</template>

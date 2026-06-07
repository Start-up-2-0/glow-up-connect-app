<script setup lang="ts">
import { ONBOARDING_WIZARD_STEPS } from '@/types/onboardingAssinatura.types'

defineProps<{
  current: number
}>()
</script>

<template>
  <ol class="mb-10 flex flex-wrap items-center gap-2 sm:gap-4">
    <li
      v-for="(item, index) in ONBOARDING_WIZARD_STEPS"
      :key="item.id"
      class="flex items-center gap-2 sm:gap-3"
    >
      <span
        class="flex size-8 shrink-0 items-center justify-center rounded-full font-satoshi text-sm font-semibold transition"
        :class="
          index < current
            ? 'bg-glow-gold text-white'
            : index === current
              ? 'bg-glow-gold/15 text-glow-gold ring-2 ring-glow-gold'
              : 'bg-zinc-100 text-zinc-400'
        "
      >
        {{ index + 1 }}
      </span>
      <span
        class="font-satoshi text-sm font-medium"
        :class="index <= current ? 'text-zinc-800' : 'text-zinc-400'"
      >
        {{ item.label }}
      </span>
      <span
        v-if="index < ONBOARDING_WIZARD_STEPS.length - 1"
        class="hidden h-px w-8 bg-zinc-200 sm:block lg:w-12"
        aria-hidden="true"
      />
    </li>
  </ol>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ONBOARDING_WIZARD_STEPS } from '@/types/onboardingAssinatura.types'

const props = defineProps<{
  current: number
  steps?: ReadonlyArray<{ id: string; label: string }>
}>()

const visibleSteps = computed(() => props.steps ?? ONBOARDING_WIZARD_STEPS)
</script>

<template>
  <ol class="mb-10 flex flex-wrap items-center gap-2 sm:gap-4">
    <li
      v-for="(item, index) in visibleSteps"
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
              : 'bg-glow-text/5 text-glow-text-muted'
        "
      >
        {{ index + 1 }}
      </span>
      <span
        class="font-satoshi text-sm font-medium"
        :class="index <= current ? 'text-glow-text' : 'text-glow-text-muted'"
      >
        {{ item.label }}
      </span>
      <span
        v-if="index < visibleSteps.length - 1"
        class="hidden h-px w-8 bg-glow-text/15 sm:block lg:w-12"
        aria-hidden="true"
      />
    </li>
  </ol>
</template>

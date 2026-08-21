<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    current: number
    steps: ReadonlyArray<{ id: string; label: string }>
    skippedIds?: ReadonlyArray<string>
    variant?: 'default' | 'autonomo' | 'flowbite'
  }>(),
  {
    variant: 'default',
  },
)

const items = computed(() =>
  props.steps.map((step, index) => ({
    ...step,
    index,
    isActive: index === props.current,
    isCompleted: index < props.current && !props.skippedIds?.includes(step.id),
    isSkipped: Boolean(props.skippedIds?.includes(step.id)) && index < props.current,
  })),
)

const isFlowbite = computed(() => props.variant === 'flowbite' || props.variant === 'autonomo')
</script>

<template>
  <ol
    class="flex flex-wrap items-center gap-y-3"
    :class="isFlowbite ? 'justify-start gap-x-0' : 'justify-center gap-y-2'"
  >
    <template v-for="(item, index) in items" :key="item.id">
      <li class="flex min-w-0 items-center gap-2.5 sm:gap-3">
        <span
          v-if="item.isCompleted"
          class="flex size-8 shrink-0 items-center justify-center rounded-full bg-glow-gold-cta font-urbanist text-sm font-bold text-white"
        >
          <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <span
          v-else-if="item.isActive"
          class="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-glow-gold-cta bg-glow-gold/15 font-urbanist text-sm font-bold text-glow-gold-cta"
          aria-current="step"
        >
          {{ index + 1 }}
        </span>
        <span
          v-else-if="item.isSkipped"
          class="flex size-8 shrink-0 items-center justify-center rounded-full border border-dashed border-glow-border-soft font-urbanist text-xs text-glow-text-subtle"
          title="Etapa pulada"
        >
          —
        </span>
        <span
          v-else
          class="flex size-8 shrink-0 items-center justify-center rounded-full border border-glow-border-soft font-urbanist text-sm text-glow-text-subtle"
        >
          {{ index + 1 }}
        </span>

        <span
          class="font-urbanist text-sm whitespace-nowrap sm:text-base"
          :class="{
            'font-bold text-glow-text': item.isActive,
            'font-semibold text-glow-text': item.isCompleted,
            'font-normal text-glow-text-subtle': !item.isActive && !item.isCompleted,
          }"
        >
          {{ item.label }}
        </span>
      </li>

      <li
        v-if="index < items.length - 1"
        class="mx-2 hidden h-px w-6 shrink-0 sm:mx-3 sm:block sm:w-10 lg:w-14"
        :class="index < current ? 'bg-glow-gold-cta' : 'bg-glow-border-soft'"
        aria-hidden="true"
      />
    </template>
  </ol>
</template>

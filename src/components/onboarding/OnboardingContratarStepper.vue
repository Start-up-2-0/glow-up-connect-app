<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  current: number
  steps: ReadonlyArray<{ id: string; label: string }>
}>()

const items = computed(() =>
  props.steps.map((step, index) => ({
    ...step,
    index,
    isActive: index === props.current,
    isCompleted: index < props.current,
  })),
)
</script>

<template>
  <ol class="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 sm:gap-x-[13px]">
    <li
      v-for="(item, index) in items"
      :key="item.id"
      class="flex items-center gap-2 sm:gap-[13px]"
    >
      <div class="flex items-center gap-2 sm:gap-[13px]">
        <span
          v-if="item.isActive"
          class="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-glow-gold font-urbanist text-sm font-bold text-white"
          aria-current="step"
        >
          {{ index + 1 }}
        </span>
        <span
          v-else
          class="font-urbanist text-sm"
          :class="item.isCompleted ? 'font-normal text-glow-text/50' : 'font-normal text-glow-text/50'"
        >
          {{ index + 1 }}
        </span>

        <span
          class="font-urbanist text-base whitespace-nowrap"
          :class="item.isActive ? 'font-bold text-glow-text' : 'font-normal text-glow-text/50'"
        >
          {{ item.label }}
        </span>
      </div>

      <span
        v-if="index < items.length - 1"
        class="hidden h-0.5 w-10 shrink-0 rounded-full sm:block"
        :class="index < current ? 'bg-glow-gold' : 'bg-glow-text/20'"
        aria-hidden="true"
      />
    </li>
  </ol>
</template>

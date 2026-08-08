<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  current: number
  steps: ReadonlyArray<{ id: string; label: string }>
  skippedIds?: ReadonlyArray<string>
}>()

const items = computed(() =>
  props.steps.map((step, index) => ({
    ...step,
    index,
    isActive: index === props.current,
    isCompleted: index < props.current && !props.skippedIds?.includes(step.id),
    isSkipped: Boolean(props.skippedIds?.includes(step.id)) && index < props.current,
  })),
)
</script>

<template>
  <ol class="flex flex-wrap items-center justify-center gap-y-2">
    <template v-for="(item, index) in items" :key="item.id">
      <li class="flex items-center gap-[13px]">
        <span
          v-if="item.isActive"
          class="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-glow-gold font-urbanist text-sm font-bold text-white"
          aria-current="step"
        >
          {{ index + 1 }}
        </span>
        <span
          v-else-if="item.isSkipped"
          class="flex size-[30px] shrink-0 items-center justify-center rounded-full border border-dashed border-glow-border-soft font-urbanist text-xs text-glow-text-subtle"
          title="Etapa pulada"
        >
          —
        </span>
        <span
          v-else-if="item.isCompleted"
          class="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-glow-success/20 font-urbanist text-sm font-bold text-glow-success"
        >
          ✓
        </span>
        <span
          v-else
          class="font-urbanist text-sm font-normal text-glow-text-subtle"
        >
          {{ index + 1 }}
        </span>

        <span
          class="font-urbanist text-base whitespace-nowrap"
          :class="item.isActive ? 'font-bold text-glow-text' : 'font-normal text-glow-text-subtle'"
        >
          {{ item.label }}
        </span>
      </li>

      <li
        v-if="index < items.length - 1"
        class="mx-[13px] hidden h-0.5 w-10 shrink-0 rounded-full sm:block"
        :class="index < current ? 'bg-glow-gold' : 'bg-glow-border-soft'"
        aria-hidden="true"
      />
    </template>
  </ol>
</template>

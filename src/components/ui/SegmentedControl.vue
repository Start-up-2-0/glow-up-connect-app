<script setup lang="ts">
export interface SegmentOption<T extends string = string> {
  value: T
  label: string
  description?: string
}

const props = defineProps<{
  modelValue: string
  options: SegmentOption[]
  ariaLabel?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

function select(value: string) {
  if (value !== props.modelValue) {
    emit('update:modelValue', value)
  }
}
</script>

<template>
  <div
    class="checkout-tabs"
    role="tablist"
    :aria-label="ariaLabel ?? 'Opções'"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="tab"
      :aria-selected="modelValue === option.value"
      class="checkout-tab"
      :class="{ 'checkout-tab--active': modelValue === option.value }"
      @click="select(option.value)"
    >
      <span class="block font-medium">{{ option.label }}</span>
      <span
        v-if="option.description"
        class="mt-0.5 block text-xs font-normal opacity-80"
      >
        {{ option.description }}
      </span>
    </button>
  </div>
</template>

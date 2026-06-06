<script setup lang="ts">
import { computed } from 'vue'
import { getAvatarInitial, normalizeAvatarSrc } from '@/utils/avatarSrc'

const props = withDefaults(
  defineProps<{
    src?: string | null
    name?: string | null
    size?: 'sm' | 'md'
  }>(),
  { size: 'sm' },
)

const normalizedSrc = computed(() => normalizeAvatarSrc(props.src))
const initial = computed(() => getAvatarInitial(props.name))

const sizeClass = computed(() => (props.size === 'md' ? 'size-10' : 'size-8'))
const initialTextClass = computed(() =>
  props.size === 'md' ? 'text-sm' : 'text-xs',
)
</script>

<template>
  <div
    class="relative isolate shrink-0 overflow-hidden rounded-full ring-1 ring-inset ring-glow-border-soft/50"
    :class="[sizeClass, normalizedSrc ? 'bg-neutral-900' : 'bg-glow-canvas']"
  >
    <img
      v-if="normalizedSrc"
      :src="normalizedSrc"
      alt=""
      class="block size-full object-contain object-center"
      draggable="false"
    />
    <span
      v-else
      class="flex size-full items-center justify-center font-urbanist font-semibold leading-none text-glow-text"
      :class="initialTextClass"
    >
      {{ initial }}
    </span>
  </div>
</template>

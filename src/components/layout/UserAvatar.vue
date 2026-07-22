<script setup lang="ts">
import { computed } from 'vue'
import { getAvatarInitial, normalizeAvatarSrc } from '@/utils/avatarSrc'

const props = withDefaults(
  defineProps<{
    src?: string | null
    name?: string | null
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  }>(),
  { size: 'sm' },
)

const normalizedSrc = computed(() => normalizeAvatarSrc(props.src))
const initial = computed(() => getAvatarInitial(props.name))

const sizeClass = computed(() => {
  const map = { xs: 'size-[29px]', sm: 'size-8', md: 'size-10', lg: 'size-16', xl: 'size-24' } as const
  return map[props.size]
})
const initialTextClass = computed(() => {
  const map = { xs: 'text-[11px]', sm: 'text-xs', md: 'text-sm', lg: 'text-xl', xl: 'text-3xl' } as const
  return map[props.size]
})
</script>

<template>
  <div
    class="relative isolate shrink-0 overflow-hidden rounded-full ring-1 ring-inset ring-glow-border-soft/50"
    :class="[sizeClass, normalizedSrc ? 'bg-glow-avatar-bg' : 'bg-glow-canvas']"
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

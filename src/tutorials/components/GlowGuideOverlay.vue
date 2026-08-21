<script setup lang="ts">
import { computed } from 'vue'
import { expandHitRect } from '@/tutorials/engine/positioning'
import type { InteractionMode, TargetRect } from '@/tutorials/types'

const props = defineProps<{
  targetRect: TargetRect | null
  interaction: InteractionMode
  pulse?: boolean
}>()

const hole = computed(() => {
  if (!props.targetRect) return null
  if (props.interaction === 'target-only') {
    return expandHitRect(props.targetRect, 44)
  }
  return props.targetRect
})

const panels = computed(() => {
  if (!hole.value) {
    return [
      { top: 0, left: 0, width: '100%', height: '100%' },
    ]
  }
  const h = hole.value
  const vw = window.innerWidth
  const vh = window.innerHeight
  return [
    { top: 0, left: 0, width: `${vw}px`, height: `${Math.max(0, h.top)}px` },
    {
      top: h.top,
      left: 0,
      width: `${Math.max(0, h.left)}px`,
      height: `${h.height}px`,
    },
    {
      top: h.top,
      left: h.right,
      width: `${Math.max(0, vw - h.right)}px`,
      height: `${h.height}px`,
    },
    {
      top: h.bottom,
      left: 0,
      width: `${vw}px`,
      height: `${Math.max(0, vh - h.bottom)}px`,
    },
  ]
})

const blockPointer = computed(() => props.interaction !== 'free')
</script>

<template>
  <div class="gg-overlay" aria-hidden="true">
    <template v-if="blockPointer">
      <div
        v-for="(p, i) in panels"
        :key="i"
        class="gg-overlay__panel"
        :class="{ 'gg-overlay__panel--pass': interaction === 'free' }"
        :style="{
          top: typeof p.top === 'number' ? `${p.top}px` : p.top,
          left: typeof p.left === 'number' ? `${p.left}px` : p.left,
          width: p.width,
          height: p.height,
        }"
      />
    </template>
    <div
      v-else
      class="gg-overlay__veil"
    />

    <div
      v-if="targetRect"
      class="gg-spotlight"
      :class="{ 'gg-spotlight--pulse': pulse }"
      :style="{
        top: `${targetRect.top}px`,
        left: `${targetRect.left}px`,
        width: `${targetRect.width}px`,
        height: `${targetRect.height}px`,
      }"
    />
  </div>
</template>

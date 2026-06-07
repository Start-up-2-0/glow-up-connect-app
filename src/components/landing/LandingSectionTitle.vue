<script setup lang="ts">
defineProps<{
  before?: string
  highlight?: string
  after?: string
  centered?: boolean
  size?: 'lg' | 'xl'
}>()
</script>

<template>
  <h2
    class="font-montserrat font-light leading-[1.09] text-[#282828]"
    :class="[
      centered ? 'text-center' : 'text-left',
      size === 'xl' ? 'text-4xl sm:text-5xl lg:text-7xl xl:text-[96px]' : 'text-3xl sm:text-4xl lg:text-6xl xl:text-[80px]',
    ]"
  >
    <span v-if="before">{{ before }}</span>
    <span v-if="highlight" class="font-black text-glow-gold">{{ highlight }}</span>
    <span v-if="after">{{ after }}</span>
    <slot />
  </h2>
</template>

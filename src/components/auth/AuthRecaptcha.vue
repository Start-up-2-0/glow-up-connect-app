<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useCaptcha } from '@/composables/useCaptcha'

const props = defineProps<{
  resetNonce?: number
}>()

const containerRef = ref<HTMLElement | null>(null)
const loadError = ref<string | null>(null)
const { enabled, mountWidget, getToken, reset } = useCaptcha()

onMounted(async () => {
  if (!enabled || !containerRef.value) {
    return
  }

  try {
    await mountWidget(containerRef.value)
  } catch (err) {
    loadError.value = err instanceof Error ? err.message : 'Falha ao carregar reCAPTCHA.'
  }
})

watch(
  () => props.resetNonce,
  () => {
    reset()
  },
)

defineExpose({ getToken, reset, enabled })
</script>

<template>
  <div v-if="enabled" class="flex w-full flex-col items-center gap-2">
    <div ref="containerRef" class="min-h-[78px]" />
    <p v-if="loadError" class="text-center text-sm text-red-600" role="alert">
      {{ loadError }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { GLOW_AVATAR_DROPZONE_CLASS, GLOW_LABEL_CLASS, GLOW_PLACEHOLDER_TEXT_CLASS } from '@/constants/designTokens'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024

withDefaults(
  defineProps<{
    label?: string
  }>(),
  {
    label: 'Avatar',
  },
)

const emit = defineEmits<{
  change: [file: File | null]
  error: [message: string]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const fileName = ref<string | null>(null)

function validateAndEmit(file: File | null) {
  if (!file) {
    fileName.value = null
    emit('change', null)
    return
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    emit('error', 'Formato inválido. Use JPEG, PNG ou WebP.')
    return
  }

  if (file.size > MAX_SIZE_BYTES) {
    emit('error', 'Arquivo muito grande. Máximo 5 MB.')
    return
  }

  fileName.value = file.name
  emit('change', file)
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  validateAndEmit(input.files?.[0] ?? null)
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  event.preventDefault()
  validateAndEmit(event.dataTransfer?.files?.[0] ?? null)
}

function openPicker() {
  fileInput.value?.click()
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <label :class="GLOW_LABEL_CLASS">{{ label }}</label>
    <div
      role="button"
      tabindex="0"
      :class="[
        GLOW_AVATAR_DROPZONE_CLASS,
        isDragging ? 'border-glow-gold bg-glow-gold/5' : '',
      ]"
      @click="openPicker"
      @keydown.enter.prevent="openPicker"
      @keydown.space.prevent="openPicker"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="sr-only"
        @change="onFileChange"
      />
      <div class="flex items-center justify-center gap-2.5 px-4">
        <svg
          class="h-6 w-6 shrink-0 text-glow-gold"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm4 18H6V4h7v5h5v11z"
          />
        </svg>
        <p :class="GLOW_PLACEHOLDER_TEXT_CLASS">
          <span v-if="fileName">{{ fileName }}</span>
          <span v-else>Solte arquivos para anexar ou navegue até eles.</span>
        </p>
      </div>
    </div>
  </div>
</template>

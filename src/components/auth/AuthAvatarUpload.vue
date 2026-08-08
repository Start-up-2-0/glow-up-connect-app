<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  GLOW_AVATAR_DROPZONE_CLASS,
  GLOW_LABEL_CLASS,
  GLOW_PLACEHOLDER_TEXT_CLASS,
  ONBOARDING_CONTRATAR_DROPZONE_CLASS,
  ONBOARDING_CONTRATAR_DROPZONE_TEXT_CLASS,
  ONBOARDING_CONTRATAR_LABEL_CLASS,
} from '@/constants/designTokens'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024

const props = withDefaults(
  defineProps<{
    label?: string
    variant?: 'auth' | 'contratar'
    /** Data URL ou URL já disponível (ex.: avatar da conta). */
    previewUrl?: string | null
    /** Texto auxiliar quando há preview sem arquivo novo. */
    previewHint?: string
  }>(),
  {
    label: 'Avatar',
    variant: 'auth',
    previewUrl: null,
    previewHint: undefined,
  },
)

const labelClass = computed(() =>
  props.variant === 'contratar' ? ONBOARDING_CONTRATAR_LABEL_CLASS : GLOW_LABEL_CLASS,
)

const dropzoneClass = computed(() =>
  props.variant === 'contratar' ? ONBOARDING_CONTRATAR_DROPZONE_CLASS : GLOW_AVATAR_DROPZONE_CLASS,
)

const placeholderClass = computed(() =>
  props.variant === 'contratar' ? ONBOARDING_CONTRATAR_DROPZONE_TEXT_CLASS : GLOW_PLACEHOLDER_TEXT_CLASS,
)

const emit = defineEmits<{
  change: [file: File | null]
  error: [message: string]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const fileName = ref<string | null>(null)

const hasPreview = computed(() => Boolean(props.previewUrl?.trim()))

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
    <label :class="labelClass">{{ label }}</label>
    <div
      role="button"
      tabindex="0"
      :class="[
        dropzoneClass,
        isDragging ? 'border-glow-gold bg-glow-gold-soft' : '',
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
        <img
          v-if="hasPreview"
          :src="previewUrl!"
          alt=""
          class="size-12 shrink-0 rounded-full object-cover"
        />
        <svg
          v-else
          class="h-6 w-6 shrink-0 text-glow-gold"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm4 18H6V4h7v5h5v11z"
          />
        </svg>
        <p :class="placeholderClass">
          <span v-if="fileName">{{ fileName }}</span>
          <span v-else-if="previewHint">{{ previewHint }}</span>
          <span v-else-if="hasPreview">Foto selecionada. Clique para alterar.</span>
          <span v-else>Solte arquivos para anexar ou navegue até eles.</span>
        </p>
      </div>
    </div>
  </div>
</template>

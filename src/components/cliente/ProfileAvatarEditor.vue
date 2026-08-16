<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import UserAvatar from '@/components/layout/UserAvatar.vue'
import { AVATAR_HINT, validateAvatarFile } from '@/utils/avatarFile'
import { normalizeAvatarSrc } from '@/utils/avatarSrc'

const props = defineProps<{
  currentSrc?: string | null
  name?: string | null
}>()

const emit = defineEmits<{
  change: [file: File]
  remove: []
  error: [message: string]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const removed = ref(false)

const displaySrc = computed(() => {
  if (removed.value) return null
  if (previewUrl.value) return previewUrl.value
  return normalizeAvatarSrc(props.currentSrc)
})

function revokePreview() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
}

function applyFile(file: File) {
  revokePreview()
  selectedFile.value = file
  removed.value = false
  previewUrl.value = URL.createObjectURL(file)
  emit('change', file)
}

function handleFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const validationError = validateAvatarFile(file)
  if (validationError) {
    emit('error', validationError)
    return
  }

  applyFile(file)
}

function openPicker() {
  fileInput.value?.click()
}

function handleRemove() {
  if (selectedFile.value) {
    revokePreview()
    selectedFile.value = null
    removed.value = false
    if (fileInput.value) fileInput.value.value = ''
    return
  }

  removed.value = true
  emit('remove')
}

watch(
  () => props.currentSrc,
  () => {
    if (!selectedFile.value) {
      removed.value = false
    }
  },
)

onBeforeUnmount(revokePreview)
</script>

<template>
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
    <UserAvatar :src="displaySrc" :name="name" size="xl" class="mx-auto shrink-0 sm:mx-0" />

    <div class="min-w-0 flex-1 space-y-3">
      <div>
        <p class="font-urbanist text-sm font-medium text-glow-text">Foto de perfil</p>
        <p class="mt-0.5 font-urbanist text-xs text-glow-text-subtle">
          {{ AVATAR_HINT }}
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="inline-flex h-9 items-center rounded-lg border border-glow-border-soft bg-glow-canvas px-3.5 font-urbanist text-sm font-medium text-glow-text transition hover:bg-glow-hover-surface"
          @click="openPicker"
        >
          Enviar nova foto
        </button>
        <button
          v-if="displaySrc"
          type="button"
          class="inline-flex h-9 items-center rounded-lg border border-glow-border-soft px-3.5 font-urbanist text-sm font-medium text-glow-text-subtle transition hover:bg-glow-hover-surface hover:text-glow-text"
          @click="handleRemove"
        >
          Remover
        </button>
      </div>

      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="sr-only"
        @change="handleFileChange"
      />
    </div>
  </div>
</template>

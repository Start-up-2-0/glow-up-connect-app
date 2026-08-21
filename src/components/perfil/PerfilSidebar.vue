<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { Camera } from 'lucide-vue-next'
import UserAvatar from '@/components/layout/UserAvatar.vue'
import { validateAvatarFile } from '@/utils/avatarFile'

const props = defineProps<{
  currentSrc?: string | null
  name?: string | null
  roleLabel?: string
  ativo?: boolean
  email?: string | null
  telefone?: string | null
  membroDesde?: string | null
  progresso?: number
  saving?: boolean
}>()

const emit = defineEmits<{
  change: [file: File]
  error: [message: string]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const removed = ref(false)

const displaySrc = computed(() => {
  if (removed.value) return null
  if (previewUrl.value) return previewUrl.value
  return props.currentSrc
})

function revokePreview() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
}

function openPicker() {
  fileInput.value?.click()
}

function handleFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const validationError = validateAvatarFile(file)
  if (validationError) {
    emit('error', validationError)
    return
  }

  revokePreview()
  selectedFile.value = file
  removed.value = false
  previewUrl.value = URL.createObjectURL(file)
  emit('change', file)
}

watch(
  () => props.currentSrc,
  () => {
    if (selectedFile.value) {
      selectedFile.value = null
      revokePreview()
    }
    removed.value = false
  },
)

onBeforeUnmount(revokePreview)
</script>

<template>
  <div class="perfil-hero__body">
    <div class="perfil-hero__identity">
      <div class="perfil-hero__avatar-wrap">
        <UserAvatar :src="displaySrc" :name="name" size="xl" class="perfil-hero__avatar" />
        <button
          type="button"
          class="perfil-hero__camera"
          aria-label="Alterar foto de perfil"
          :disabled="saving"
          @click="openPicker"
        >
          <Camera class="size-3.5" aria-hidden="true" />
        </button>
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          class="sr-only"
          @change="handleFileChange"
        />
      </div>

      <div class="perfil-hero__details">
        <div class="perfil-hero__name-row">
          <h2 class="perfil-hero__name">{{ name }}</h2>
          <span
            class="perfil-badge"
            :class="ativo !== false ? 'perfil-badge--success' : 'perfil-badge--danger'"
          >
            {{ ativo !== false ? 'Conta ativa' : 'Conta inativa' }}
          </span>
        </div>
        <p v-if="roleLabel" class="perfil-hero__role">{{ roleLabel }}</p>
        <p v-if="email" class="perfil-hero__contact">{{ email }}</p>
        <p v-if="telefone" class="perfil-hero__contact">{{ telefone }}</p>
        <p v-if="membroDesde" class="perfil-hero__meta">Membro desde {{ membroDesde }}</p>
      </div>
    </div>

    <div class="perfil-hero__aside">
      <div class="perfil-hero__progress">
        <div class="perfil-hero__progress-head">
          <span>Perfil</span>
          <span>{{ progresso ?? 0 }}%</span>
        </div>
        <div class="perfil-hero__progress-track" role="progressbar" :aria-valuenow="progresso ?? 0" aria-valuemin="0" aria-valuemax="100">
          <span class="perfil-hero__progress-bar" :style="{ width: `${progresso ?? 0}%` }" />
        </div>
      </div>
      <button type="button" class="perfil-hero__photo-btn" :disabled="saving" @click="openPicker">
        <Camera class="size-4" aria-hidden="true" />
        Editar foto
      </button>
    </div>
  </div>
</template>

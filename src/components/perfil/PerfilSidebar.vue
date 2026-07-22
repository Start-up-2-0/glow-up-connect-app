<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import UserAvatar from '@/components/layout/UserAvatar.vue'
import { validateAvatarFile } from '@/utils/avatarFile'
import { normalizeAvatarSrc } from '@/utils/avatarSrc'

const props = defineProps<{
  currentSrc?: string | null
  name?: string | null
  roleLabel?: string
  ativo?: boolean
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
const hovering = ref(false)

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
    if (!selectedFile.value) removed.value = false
  },
)

onBeforeUnmount(revokePreview)
</script>

<template>
  <section class="perfil-sidebar">
    <div
      class="perfil-sidebar__avatar-wrap"
      @mouseenter="hovering = true"
      @mouseleave="hovering = false"
    >
      <UserAvatar :src="displaySrc" :name="name" size="xl" class="perfil-sidebar__avatar" />
      <button
        type="button"
        class="perfil-sidebar__avatar-overlay"
        :class="{ 'perfil-sidebar__avatar-overlay--visible': hovering }"
        @click="openPicker"
      >
        <span aria-hidden="true">📷</span>
        Alterar foto
      </button>
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="sr-only"
        @change="handleFileChange"
      />
    </div>

    <div class="perfil-sidebar__identity">
      <h2 class="perfil-sidebar__name">{{ name }}</h2>
      <p class="perfil-sidebar__role">{{ roleLabel }}</p>
      <span
        class="perfil-sidebar__badge"
        :class="ativo !== false ? 'perfil-sidebar__badge--active' : 'perfil-sidebar__badge--inactive'"
      >
        {{ ativo !== false ? 'Conta ativa' : 'Conta inativa' }}
      </span>
    </div>

    <div class="perfil-sidebar__divider" />

    <dl class="perfil-sidebar__contacts">
      <div class="perfil-sidebar__contact">
        <dt>📧</dt>
        <dd><slot name="email" /></dd>
      </div>
      <div class="perfil-sidebar__contact">
        <dt>📱</dt>
        <dd><slot name="telefone" /></dd>
      </div>
      <div class="perfil-sidebar__contact">
        <dt>💬</dt>
        <dd><slot name="whatsapp" /></dd>
      </div>
    </dl>

    <button type="button" class="perfil-sidebar__edit" @click="openPicker">
      Editar foto
    </button>
  </section>
</template>

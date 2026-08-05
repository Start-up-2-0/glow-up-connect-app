<script setup lang="ts">
import { computed } from 'vue'
import { Check, ChevronRight, X } from 'lucide-vue-next'
import type { User } from '@/types/user.types'
import UserAvatar from '@/components/layout/UserAvatar.vue'

const props = defineProps<{
  progressoPerfil: number
  profile: User | null
  loading?: boolean
}>()

const emit = defineEmits<{ 'completar-perfil': [] }>()

const itens = computed(() => {
  const p = props.profile
  return [
    { label: 'Nome', done: Boolean(p?.nome?.trim()) },
    { label: 'E-mail', done: Boolean(p?.email?.trim()) },
    { label: 'Telefone', done: Boolean(p?.telefone?.trim()) },
    { label: 'Foto de perfil', done: Boolean(p?.avatarBase64) },
    { label: 'WhatsApp confirmado', done: Boolean(p?.whatsAppConfirmado) },
  ]
})

const pct = computed(() => Math.min(Math.max(props.progressoPerfil, 0), 100))
</script>

<template>
  <div class="flex h-full w-full flex-col rounded-2xl border border-glow-border-soft bg-glow-surface p-5 shadow-glow-sm">
    <div class="flex items-center gap-3">
      <UserAvatar :src="profile?.avatarBase64" :name="profile?.nome" size="md" />
      <div class="min-w-0 flex-1">
        <p class="font-urbanist text-[15px] font-semibold text-glow-text">
          {{ profile?.nome ?? 'Perfil' }}
        </p>
        <p class="font-urbanist text-[13px] text-glow-text-subtle">Complete seu perfil para ter uma experiência melhor</p>
      </div>
      <span class="font-urbanist text-2xl font-bold text-glow-gold-cta">{{ pct }}%</span>
    </div>

    <div class="mt-4 h-2 w-full overflow-hidden rounded-full bg-glow-canvas">
      <div
        class="h-full rounded-full bg-gradient-to-r from-glow-gold to-glow-gold-cta transition-all duration-500"
        :style="{ width: `${pct}%` }"
      />
    </div>

    <ul class="mt-4 flex flex-col gap-2">
      <li
        v-for="item in itens"
        :key="item.label"
        class="flex items-center gap-2.5 font-urbanist text-[13px]"
        :class="item.done ? 'text-glow-text' : 'text-glow-text-subtle'"
      >
        <span
          class="flex size-[18px] shrink-0 items-center justify-center rounded-full"
          :class="item.done ? 'bg-glow-success-bg text-glow-success-dark' : 'bg-glow-neutral-bg text-glow-text-soft'"
        >
          <Check v-if="item.done" :size="12" :stroke-width="3" />
          <X v-else :size="12" :stroke-width="3" />
        </span>
        {{ item.label }}
      </li>
    </ul>

    <button type="button" class="cliente-btn-outline mt-4 w-full justify-center" @click="emit('completar-perfil')">
      Completar perfil
      <ChevronRight :size="16" :stroke-width="2" />
    </button>
  </div>
</template>
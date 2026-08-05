<script setup lang="ts">
import { computed } from 'vue'
import {
  Clock,
  Headphones,
  Mail,
  MoreVertical,
  Phone,
  Scissors,
  Shield,
} from 'lucide-vue-next'
import UserAvatar from '@/components/layout/UserAvatar.vue'
import type { EstablishmentUserRole } from '@/types/negocio/equipe.types'

const props = withDefaults(
  defineProps<{
    nome: string
    cargo: string
    role: EstablishmentUserRole | 'Profissional' | 'Convidado'
    email?: string
    telefone?: string
    ativo?: boolean
    convidado?: boolean
    conviteEm?: string | null
    foto?: string | null
    interactive?: boolean
    compact?: boolean
  }>(),
  {
    ativo: true,
    convidado: false,
    conviteEm: null,
    foto: null,
    interactive: false,
    compact: false,
  },
)

defineEmits<{
  click: []
  menu: []
}>()

const roleBadgeClass = computed(() => {
  switch (props.role) {
    case 'Owner':
      return 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300'
    case 'Admin':
      return 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300'
    case 'Manager':
      return 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/20 dark:text-fuchsia-300'
    case 'Receptionist':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
    case 'Profissional':
      return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
    case 'Convidado':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300'
    default:
      return 'bg-glow-gold-selected text-glow-gold-cta'
  }
})

const footer = computed(() => {
  if (props.convidado) {
    return { icon: Clock, text: 'Aguardando aceitação' }
  }
  if (props.role === 'Owner' || props.role === 'Admin') {
    return { icon: Shield, text: 'Acesso total' }
  }
  if (props.role === 'Receptionist' || props.role === 'Manager') {
    return { icon: Headphones, text: 'Atendimento e agenda' }
  }
  return { icon: Scissors, text: 'Prestador de serviços' }
})

const statusLabel = computed(() => {
  if (props.convidado) return 'Pendente'
  return props.ativo ? 'Ativo' : 'Inativo'
})

const statusPillClass = computed(() => {
  if (props.convidado) {
    return 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/15 dark:text-orange-300'
  }
  if (props.ativo) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400'
  }
  return 'border-glow-border-soft bg-glow-hover-surface text-glow-text-subtle'
})

const statusDotClass = computed(() => {
  if (props.convidado) return 'bg-orange-500'
  if (props.ativo) return 'bg-emerald-500'
  return 'bg-glow-text-subtle'
})
</script>

<template>
  <article
    class="group relative flex flex-col rounded-2xl border border-glow-border-soft bg-glow-surface shadow-glow-sm transition"
    :class="[
      interactive ? 'cursor-pointer hover:border-glow-gold-cta/40 hover:shadow-md' : '',
      !ativo && !convidado ? 'opacity-75' : '',
      compact ? 'flex-row items-center gap-4 px-4 py-3' : 'p-4 sm:p-5',
    ]"
    :role="interactive ? 'button' : undefined"
    :tabindex="interactive ? 0 : undefined"
    @click="interactive ? $emit('click') : undefined"
    @keydown.enter="interactive ? $emit('click') : undefined"
    @keydown.space.prevent="interactive ? $emit('click') : undefined"
  >
    <button
      v-if="interactive && !compact"
      type="button"
      class="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-lg text-glow-text-subtle transition hover:bg-glow-hover-surface hover:text-glow-text"
      aria-label="Mais opções"
      @click.stop="$emit('menu')"
    >
      <MoreVertical class="size-4" aria-hidden="true" />
    </button>

    <div class="flex items-start gap-4" :class="compact ? 'min-w-0 flex-1' : 'pr-7'">
      <!-- Cardzinho: avatar + status -->
      <div
        class="flex shrink-0 flex-col items-center gap-2"
        :class="compact ? '' : 'min-w-[4.5rem]'"
      >
        <UserAvatar
          :src="foto"
          :name="nome"
          size="md"
          class="!size-14 !text-base"
        />
        <span
          v-if="!compact && !convidado"
          class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-urbanist text-[10px] font-semibold leading-none shadow-sm"
          :class="statusPillClass"
        >
          <span class="size-1.5 shrink-0 rounded-full" :class="statusDotClass" aria-hidden="true" />
          {{ statusLabel }}
        </span>
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <h2 class="truncate font-satoshi text-[15px] font-bold text-glow-text">{{ nome }}</h2>
          <span
            class="inline-flex rounded-full px-2.5 py-0.5 font-urbanist text-[11px] font-semibold"
            :class="roleBadgeClass"
          >
            {{ cargo }}
          </span>
        </div>

        <div v-if="convidado" class="mt-2.5 flex items-start justify-between gap-3">
          <p class="font-urbanist text-xs text-glow-text-subtle">
            Convite enviado{{ conviteEm ? ` em ${conviteEm}` : '' }}
          </p>
          <span
            v-if="!compact"
            class="inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 font-urbanist text-[10px] font-semibold"
            :class="statusPillClass"
          >
            <span class="size-1.5 rounded-full" :class="statusDotClass" aria-hidden="true" />
            Pendente
          </span>
        </div>
        <div v-else class="mt-2.5 space-y-1.5">
          <p
            v-if="email"
            class="flex items-center gap-1.5 truncate font-urbanist text-xs text-glow-text-subtle"
          >
            <Mail class="size-3.5 shrink-0 opacity-70" aria-hidden="true" />
            {{ email }}
          </p>
          <p
            v-if="telefone"
            class="flex items-center gap-1.5 font-urbanist text-xs text-glow-text-subtle"
          >
            <Phone class="size-3.5 shrink-0 opacity-70" aria-hidden="true" />
            {{ telefone }}
          </p>
        </div>
      </div>

      <span
        v-if="compact"
        class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-urbanist text-[10px] font-semibold"
        :class="statusPillClass"
      >
        <span class="size-1.5 rounded-full" :class="statusDotClass" aria-hidden="true" />
        {{ statusLabel }}
      </span>
    </div>

    <div
      v-if="!compact"
      class="mt-4 flex items-center border-t border-glow-border-soft pt-3"
    >
      <p class="inline-flex items-center gap-1.5 font-urbanist text-xs text-glow-text-subtle">
        <component
          :is="footer.icon"
          class="size-3.5 shrink-0 text-glow-gold-cta"
          aria-hidden="true"
        />
        {{ footer.text }}
      </p>
    </div>
  </article>
</template>

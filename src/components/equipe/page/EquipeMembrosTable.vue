<script setup lang="ts">
import { MoreVertical } from 'lucide-vue-next'
import UserAvatar from '@/components/layout/UserAvatar.vue'
import type { EquipeTabelaRow } from './equipeTabela'

defineProps<{
  items: EquipeTabelaRow[]
  interactive?: boolean
}>()

const emit = defineEmits<{
  select: [id: string]
}>()

function roleBadgeClass(role: EquipeTabelaRow['role']) {
  switch (role) {
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
}

function statusOf(item: EquipeTabelaRow) {
  if (item.convidado) {
    return {
      label: 'Pendente',
      class: 'text-orange-700 dark:text-orange-300',
      dot: 'bg-orange-500',
    }
  }
  if (item.ativo) {
    return {
      label: 'Ativo',
      class: 'text-emerald-700 dark:text-emerald-400',
      dot: 'bg-emerald-500',
    }
  }
  return {
    label: 'Inativo',
    class: 'text-glow-text-subtle',
    dot: 'bg-glow-text-subtle',
  }
}
</script>

<template>
  <section class="overflow-hidden rounded-2xl border border-glow-border-soft bg-glow-surface shadow-glow-sm">
    <div class="overflow-x-auto">
      <table class="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr class="border-b border-glow-border-soft bg-glow-hover-surface/60">
            <th
              class="px-4 py-3 font-urbanist text-[11px] font-semibold uppercase tracking-wide text-glow-text-subtle"
            >
              Membro
            </th>
            <th
              class="px-4 py-3 font-urbanist text-[11px] font-semibold uppercase tracking-wide text-glow-text-subtle"
            >
              Cargo
            </th>
            <th
              class="px-4 py-3 font-urbanist text-[11px] font-semibold uppercase tracking-wide text-glow-text-subtle"
            >
              Contato
            </th>
            <th
              class="px-4 py-3 font-urbanist text-[11px] font-semibold uppercase tracking-wide text-glow-text-subtle"
            >
              Status
            </th>
            <th
              v-if="interactive"
              class="w-12 px-4 py-3 text-right font-urbanist text-[11px] font-semibold uppercase tracking-wide text-glow-text-subtle"
            >
              <span class="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in items"
            :key="item.id"
            class="border-b border-glow-border-soft last:border-b-0 transition"
            :class="interactive ? 'cursor-pointer hover:bg-glow-hover-surface/70' : ''"
            @click="interactive ? emit('select', item.id) : undefined"
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <UserAvatar :src="item.foto" :name="item.nome" size="md" />
                <span class="min-w-0 truncate font-satoshi text-sm font-bold text-glow-text">
                  {{ item.nome }}
                </span>
              </div>
            </td>
            <td class="px-4 py-3">
              <span
                class="inline-flex rounded-full px-2.5 py-0.5 font-urbanist text-[11px] font-semibold"
                :class="roleBadgeClass(item.role)"
              >
                {{ item.cargo }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div v-if="item.convidado" class="font-urbanist text-xs text-glow-text-subtle">
                Convite enviado{{ item.conviteEm ? ` em ${item.conviteEm}` : '' }}
              </div>
              <div v-else class="space-y-0.5">
                <p class="truncate font-urbanist text-xs text-glow-text-subtle">
                  {{ item.email || '—' }}
                </p>
                <p class="font-urbanist text-xs text-glow-text-subtle">
                  {{ item.telefone || '—' }}
                </p>
              </div>
            </td>
            <td class="px-4 py-3">
              <span
                class="inline-flex items-center gap-1.5 font-urbanist text-xs font-semibold"
                :class="statusOf(item).class"
              >
                <span
                  class="size-1.5 rounded-full"
                  :class="statusOf(item).dot"
                  aria-hidden="true"
                />
                {{ statusOf(item).label }}
              </span>
            </td>
            <td v-if="interactive" class="px-4 py-3 text-right">
              <button
                type="button"
                class="inline-flex size-8 items-center justify-center rounded-lg text-glow-text-subtle transition hover:bg-glow-hover-surface hover:text-glow-text"
                aria-label="Abrir detalhes"
                @click.stop="emit('select', item.id)"
              >
                <MoreVertical class="size-4" aria-hidden="true" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ProfissionalDashboard } from '@/composables/useDashboardNegocioData'
import DashboardEmptyState from '@/components/dashboard/cliente/DashboardEmptyState.vue'

defineProps<{
  profissionais: ProfissionalDashboard[]
  loading?: boolean
}>()

const emit = defineEmits<{ gerenciar: [] }>()
</script>

<template>
  <section
    class="flex h-full flex-col rounded-2xl border border-glow-border-soft bg-glow-surface p-5 shadow-glow-sm"
  >
    <div class="mb-3 flex items-center justify-between gap-2">
      <div>
        <h2 class="font-urbanist text-[15px] font-semibold text-glow-text">Equipe</h2>
        <p class="font-urbanist text-[12px] text-glow-text-subtle">
          Carga de hoje por profissional
        </p>
      </div>
      <button
        type="button"
        class="shrink-0 font-urbanist text-[12px] font-semibold text-glow-gold-cta hover:underline"
        @click="emit('gerenciar')"
      >
        Gerenciar
      </button>
    </div>

    <div v-if="loading" class="flex flex-col gap-2">
      <span v-for="i in 4" :key="i" class="h-12 animate-pulse rounded-xl bg-glow-canvas" />
    </div>

    <DashboardEmptyState
      v-else-if="profissionais.length === 0"
      title="Nenhum profissional"
      description="Convide a equipe para acompanhar a ocupação do dia."
    >
      <button type="button" class="cliente-btn-cta" @click="emit('gerenciar')">
        Convidar equipe
      </button>
    </DashboardEmptyState>

    <ul v-else class="flex flex-col gap-1">
      <li v-for="prof in profissionais" :key="prof.id" class="eq-row">
        <span
          class="eq-row__dot"
          :class="prof.podeReceberAgendamento ? 'eq-row__dot--on' : 'eq-row__dot--off'"
        />
        <span class="eq-row__avatar">{{ prof.nomePublico.charAt(0) }}</span>
        <div class="min-w-0 flex-1">
          <p class="truncate font-urbanist text-[13px] font-semibold text-glow-text">
            {{ prof.nomePublico }}
          </p>
          <p class="font-urbanist text-[11px] text-glow-text-subtle">
            {{ prof.agendamentosHoje }}
            agendamento{{ prof.agendamentosHoje === 1 ? '' : 's' }} hoje
          </p>
        </div>
        <span v-if="prof.notaMedia" class="eq-row__nota">
          ★ {{ prof.notaMedia.toFixed(1) }}
        </span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.eq-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 14px;
  transition: background 0.15s ease;
}
.eq-row:hover {
  background: color-mix(in srgb, var(--glow-text) 5%, transparent);
}
.eq-row__dot {
  height: 8px;
  width: 8px;
  flex-shrink: 0;
  border-radius: 9999px;
}
.eq-row__dot--on {
  background: var(--glow-success);
}
.eq-row__dot--off {
  background: var(--glow-text-muted);
}
.eq-row__avatar {
  display: inline-flex;
  height: 32px;
  width: 32px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--glow-surface-tint);
  font-family: 'Urbanist', ui-sans-serif, system-ui, sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: var(--glow-text-subtle);
}
.eq-row__nota {
  flex-shrink: 0;
  font-family: 'Urbanist', ui-sans-serif, system-ui, sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: var(--glow-gold-cta);
}
</style>

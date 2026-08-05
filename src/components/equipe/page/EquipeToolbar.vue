<script setup lang="ts">
import { LayoutGrid, List, Search } from 'lucide-vue-next'

defineProps<{
  busca: string
  cargo: string
  status: string
  vista: 'grid' | 'lista'
  cargoOptions: { value: string; label: string }[]
  statusOptions: { value: string; label: string }[]
}>()

defineEmits<{
  'update:busca': [value: string]
  'update:cargo': [value: string]
  'update:status': [value: string]
  'update:vista': [value: 'grid' | 'lista']
}>()
</script>

<template>
  <section
    class="flex flex-col gap-3 rounded-2xl border border-glow-border-soft bg-glow-surface p-3 shadow-glow-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 sm:p-4"
  >
    <label class="relative min-w-0 flex-1 sm:min-w-[14rem]">
      <Search
        class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-glow-text-subtle"
        aria-hidden="true"
      />
      <input
        type="search"
        class="h-10 w-full appearance-none rounded-xl border border-glow-border-soft bg-glow-hover-surface pl-9 pr-3 font-urbanist text-sm text-glow-text outline-none transition placeholder:text-glow-placeholder focus:border-glow-gold focus:bg-glow-surface focus:ring-2 focus:ring-glow-gold/20"
        :value="busca"
        placeholder="Buscar por nome, cargo ou e-mail..."
        autocomplete="off"
        @input="$emit('update:busca', ($event.target as HTMLInputElement).value)"
      />
    </label>

    <select
      class="h-10 rounded-xl border border-glow-border-soft bg-glow-hover-surface px-3 font-urbanist text-sm text-glow-text outline-none focus:border-glow-gold"
      :value="cargo"
      aria-label="Filtrar por cargo"
      @change="$emit('update:cargo', ($event.target as HTMLSelectElement).value)"
    >
      <option v-for="opt in cargoOptions" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>

    <select
      class="h-10 rounded-xl border border-glow-border-soft bg-glow-hover-surface px-3 font-urbanist text-sm text-glow-text outline-none focus:border-glow-gold"
      :value="status"
      aria-label="Filtrar por status"
      @change="$emit('update:status', ($event.target as HTMLSelectElement).value)"
    >
      <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>

    <div
      class="ml-auto inline-flex rounded-xl border border-glow-border-soft bg-glow-hover-surface p-1"
      role="group"
      aria-label="Modo de visualização"
    >
      <button
        type="button"
        class="inline-flex size-8 items-center justify-center rounded-lg transition"
        :class="
          vista === 'grid'
            ? 'bg-glow-surface text-glow-gold-cta shadow-glow-sm'
            : 'text-glow-text-subtle hover:text-glow-text'
        "
        aria-label="Grade"
        :aria-pressed="vista === 'grid'"
        @click="$emit('update:vista', 'grid')"
      >
        <LayoutGrid class="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        class="inline-flex size-8 items-center justify-center rounded-lg transition"
        :class="
          vista === 'lista'
            ? 'bg-glow-surface text-glow-gold-cta shadow-glow-sm'
            : 'text-glow-text-subtle hover:text-glow-text'
        "
        aria-label="Lista"
        :aria-pressed="vista === 'lista'"
        @click="$emit('update:vista', 'lista')"
      >
        <List class="size-4" aria-hidden="true" />
      </button>
    </div>
  </section>
</template>

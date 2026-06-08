<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import SegmentedControl from '@/components/ui/SegmentedControl.vue'
import ContentAlert from '@/components/feedback/ContentAlert.vue'
import EquipeAdicionarForm from '@/components/equipe/EquipeAdicionarForm.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { ROUTE_PATHS } from '@/constants/routes'
import type { ModoCadastro } from '@/composables/useEquipeAdicionarForm'
import type { EstablishmentUserRole } from '@/types/negocio/equipe.types'

const route = useRoute()
const { ready, error: contextError } = useEstabelecimentoView()

function modoInicial(): ModoCadastro {
  const q = route.query.modo
  if (q === 'criar' || q === 'vincular') return q
  return 'convite'
}

const modo = ref<ModoCadastro>(modoInicial())

const initialRole = computed<EstablishmentUserRole | undefined>(() =>
  route.query.role === 'Profissional' ? 'Profissional' : undefined,
)

const modoOptions = [
  { value: 'convite', label: 'Enviar convite', description: 'Recomendado' },
  { value: 'vincular', label: 'Já tem conta', description: 'Vínculo direto' },
  { value: 'criar', label: 'Criar manual', description: 'Avançado' },
] as const
</script>

<template>
  <div class="page-shell--narrow space-y-4">
    <div class="space-y-2">
      <RouterLink
        :to="ROUTE_PATHS.CONFIG_EQUIPE"
        class="inline-flex items-center gap-1.5 font-urbanist text-sm text-glow-text-subtle transition hover:text-glow-text"
      >
        <span aria-hidden="true">←</span>
        Voltar à equipe
      </RouterLink>
      <h1 class="font-satoshi text-2xl font-bold leading-tight text-glow-text">
        Adicionar à equipe
      </h1>
      <p class="font-urbanist text-sm leading-relaxed text-glow-text-subtle">
        Escolha como incluir a pessoa e preencha apenas os dados necessários.
      </p>
    </div>

    <ContentAlert v-if="contextError" variant="error" title="Não foi possível continuar" compact>
      {{ contextError }}
    </ContentAlert>

    <section v-if="ready" class="panel-shell">
      <div class="panel-shell__header">
        <SegmentedControl
          v-model="modo"
          :options="[...modoOptions]"
          aria-label="Modo de adição à equipe"
        />
      </div>
      <div class="panel-shell__body">
        <EquipeAdicionarForm
          :key="modo"
          :modo="modo"
          :initial-role="initialRole"
          :show-cancel="false"
        />
      </div>
    </section>
  </div>
</template>

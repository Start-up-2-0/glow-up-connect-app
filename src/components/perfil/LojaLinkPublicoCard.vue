<script setup lang="ts">
import { Check, Copy, ExternalLink, Link2 } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'
import PerfilSectionCard from '@/components/perfil/PerfilSectionCard.vue'

defineProps<{
  linkUrl: string
  linkLabel: string
  ativo: boolean
  copied: boolean
}>()

defineEmits<{
  copy: []
  open: []
}>()
</script>

<template>
  <PerfilSectionCard
    title="Link Público de Agendamento"
    description="Compartilhe este link para que seus clientes agendem serviços com você."
  >
    <template v-if="linkUrl" #header-aside>
      <span
        class="perfil-badge"
        :class="ativo ? 'perfil-badge--success' : 'perfil-badge--danger'"
      >
        <span
          class="loja-perfil-status-dot"
          :class="ativo ? 'loja-perfil-status-dot--ok' : 'loja-perfil-status-dot--off'"
        />
        {{ ativo ? 'Ativo' : 'Inativo' }}
      </span>
    </template>

    <div v-if="linkUrl" class="loja-perfil-share">
      <div class="loja-perfil-share__url">
        <Link2 class="size-4 shrink-0 text-glow-gold-cta" aria-hidden="true" />
        <span class="truncate font-urbanist text-sm font-medium text-glow-text">
          {{ linkLabel }}
        </span>
      </div>
      <div class="loja-perfil-share__actions">
        <BaseButton variant="secondary" size="sm" @click="$emit('copy')">
          <Check v-if="copied" class="mr-1.5 size-3.5" aria-hidden="true" />
          <Copy v-else class="mr-1.5 size-3.5" aria-hidden="true" />
          {{ copied ? 'Copiado' : 'Copiar link' }}
        </BaseButton>
        <BaseButton variant="secondary" size="sm" @click="$emit('open')">
          <ExternalLink class="mr-1.5 size-3.5" aria-hidden="true" />
          Abrir link
        </BaseButton>
      </div>
    </div>

    <div v-else class="loja-perfil-empty">
      <p class="font-urbanist text-sm text-glow-text-subtle">
        O link público estará disponível quando o estabelecimento estiver configurado.
      </p>
    </div>
  </PerfilSectionCard>
</template>

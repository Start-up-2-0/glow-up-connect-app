<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useAcessoUsuario } from '@/composables/useAcessoUsuario'
import { useNotificationsStore } from '@/stores/notifications.store'
import { ROUTE_PATHS } from '@/constants/routes'

const { linkAgendamentoPublico } = useAcessoUsuario()
const notifications = useNotificationsStore()
const linkCopiado = ref(false)

async function copiarLink() {
  if (!linkAgendamentoPublico.value) return
  try {
    await navigator.clipboard.writeText(linkAgendamentoPublico.value)
    linkCopiado.value = true
    notifications.push('success', 'Link copiado!')
    window.setTimeout(() => {
      linkCopiado.value = false
    }, 2000)
  } catch {
    notifications.push('error', 'Não foi possível copiar o link.')
  }
}
</script>

<template>
  <section class="space-y-4">
    <div>
      <h2 class="font-satoshi text-lg font-bold text-glow-text lg:text-xl">
        Sua operação na loja
      </h2>
      <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
        Acompanhe seus atendimentos e compartilhe seu link de agendamento.
      </p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <RouterLink
        :to="ROUTE_PATHS.AGENDA"
        class="group glow-card glow-card--interactive block p-4"
      >
        <h3 class="font-urbanist text-base font-semibold text-glow-text group-hover:text-glow-text-hover">
          Minha agenda
        </h3>
        <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
          Veja os horários marcados com você.
        </p>
      </RouterLink>

      <RouterLink
        :to="ROUTE_PATHS.CONFIG_HORARIOS"
        class="group glow-card glow-card--interactive block p-4"
      >
        <h3 class="font-urbanist text-base font-semibold text-glow-text group-hover:text-glow-text-hover">
          Meus horários
        </h3>
        <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
          Configure quando você atende nesta loja.
        </p>
      </RouterLink>
    </div>

    <BaseCard v-if="linkAgendamentoPublico" title="Link de agendamento">
      <p class="mb-3 font-urbanist text-sm text-glow-text-subtle">
        Envie este link para clientes agendarem diretamente com você.
      </p>
      <p class="mb-3 break-all rounded-lg bg-glow-bg-highlight px-3 py-2 font-urbanist text-xs text-glow-text">
        {{ linkAgendamentoPublico }}
      </p>
      <BaseButton variant="secondary" size="sm" @click="copiarLink">
        {{ linkCopiado ? 'Copiado!' : 'Copiar link' }}
      </BaseButton>
    </BaseCard>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseAlert from '@/components/feedback/BaseAlert.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import { useUserStore } from '@/stores/user.store'
import { useFetchOnce } from '@/composables/useFetchOnce'
import { useWhatsAppConfirmacao } from '@/composables/useWhatsAppConfirmacao'
import { useApiError } from '@/composables/useApiError'

const userStore = useUserStore()
const { profile, saving } = storeToRefs(userStore)
const { resolveError } = useApiError()

const form = reactive({ nome: '', telefone: '' })
const saveError = ref<string | null>(null)
const saveSuccess = ref(false)

const {
  instrucoes,
  solicitando,
  polling,
  pollError,
  solicitarConfirmacao,
  toggleOptIn,
} = useWhatsAppConfirmacao()

const { execute: loadProfile, loading } = useFetchOnce('cliente-perfil')

const whatsAppState = computed(() => {
  if (!profile.value?.telefone) return 'sem-telefone'
  if (profile.value.whatsAppConfirmado) return 'confirmado'
  if (profile.value.whatsAppPendenteConfirmacao || instrucoes.value || polling.value) {
    return 'pendente'
  }
  return 'nao-confirmado'
})

function syncFormFromProfile() {
  if (!profile.value) return
  form.nome = profile.value.nome
  form.telefone = profile.value.telefone ?? ''
}

onMounted(async () => {
  await loadProfile(() => userStore.fetchMe(true))
  syncFormFromProfile()
})

async function handleSave() {
  saveError.value = null
  saveSuccess.value = false
  try {
    await userStore.updateProfile({
      nome: form.nome.trim(),
      telefone: form.telefone.trim(),
    })
    syncFormFromProfile()
    saveSuccess.value = true
  } catch (err) {
    saveError.value = resolveError(err, 'Não foi possível salvar o perfil.')
  }
}

async function handleOptInChange(event: Event) {
  const target = event.target as HTMLInputElement
  try {
    await toggleOptIn(target.checked)
  } catch (err) {
    saveError.value = resolveError(err, 'Não foi possível atualizar alertas.')
    target.checked = !target.checked
  }
}

async function handleSolicitarWhatsApp() {
  saveError.value = null
  try {
    await solicitarConfirmacao()
  } catch (err) {
    saveError.value = resolveError(err, 'Não foi possível solicitar confirmação.')
  }
}
</script>

<template>
  <div class="space-y-4 lg:space-y-6">
    <div>
      <h1 class="font-satoshi text-xl font-bold leading-tight text-glow-text lg:text-2xl">
        Meu perfil
      </h1>
      <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
        Gerencie seus dados pessoais, conta e preferências de WhatsApp.
      </p>
    </div>

    <BaseAlert v-if="saveError" variant="error">{{ saveError }}</BaseAlert>
    <BaseAlert v-if="saveSuccess" variant="success">Perfil atualizado com sucesso.</BaseAlert>

    <BaseCard title="Dados pessoais">
      <LoadingSpinner v-if="loading && !profile" />
      <form v-else class="space-y-4" @submit.prevent="handleSave">
        <BaseInput v-model="form.nome" label="Nome" autocomplete="name" required />
        <BaseInput
          v-model="form.telefone"
          label="Telefone"
          type="tel"
          autocomplete="tel"
        />
        <p class="font-urbanist text-sm text-glow-text-subtle">
          E-mail: {{ profile?.email ?? '—' }}
        </p>
        <BaseButton type="submit" :loading="saving">Salvar alterações</BaseButton>
      </form>
    </BaseCard>

    <BaseCard title="WhatsApp">
      <div v-if="whatsAppState === 'sem-telefone'" class="space-y-3">
        <p class="font-urbanist text-sm text-glow-text-subtle">
          Cadastre seu telefone acima para receber alertas de agendamento.
        </p>
      </div>

      <div v-else-if="whatsAppState === 'confirmado'" class="space-y-4">
        <p class="font-urbanist text-sm text-glow-text">
          WhatsApp confirmado para {{ profile?.telefone }}.
        </p>
        <label class="flex cursor-pointer items-center gap-3 font-urbanist text-sm text-glow-text">
          <input
            type="checkbox"
            class="size-4 rounded border-glow-border-soft"
            :checked="profile?.whatsAppOptIn ?? false"
            @change="handleOptInChange"
          />
          Receber alertas de agendamento no WhatsApp
        </label>
      </div>

      <div v-else class="space-y-4">
        <p
          v-if="whatsAppState === 'pendente' || instrucoes"
          class="font-urbanist text-sm text-glow-text"
        >
          Verifique seu e-mail para confirmar o WhatsApp. Abra o link no celular e envie a mensagem
          do número cadastrado.
        </p>
        <p v-else class="font-urbanist text-sm text-glow-text-subtle">
          Confirme seu número para receber alertas de agendamento.
        </p>

        <BaseAlert v-if="pollError" variant="warning">{{ pollError }}</BaseAlert>

        <div v-if="instrucoes?.linkWhatsApp" class="space-y-2">
          <a
            :href="instrucoes.linkWhatsApp"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-block font-urbanist text-sm font-medium text-glow-primary underline"
          >
            Abrir WhatsApp (atalho)
          </a>
          <p v-if="polling" class="font-urbanist text-xs text-glow-text-subtle">
            Aguardando confirmação…
          </p>
        </div>

        <BaseButton
          v-if="whatsAppState !== 'pendente' || !instrucoes"
          variant="secondary"
          :loading="solicitando"
          @click="handleSolicitarWhatsApp"
        >
          Enviar confirmação por e-mail
        </BaseButton>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseAlert from '@/components/feedback/BaseAlert.vue'
import ContentAlert from '@/components/feedback/ContentAlert.vue'
import SegmentedControl from '@/components/ui/SegmentedControl.vue'
import TelefoneInput from '@/components/ui/TelefoneInput.vue'
import AuthPasswordRules from '@/components/auth/recovery/AuthPasswordRules.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { equipeService } from '@/services/equipeService'
import { conviteService } from '@/services/conviteService'
import { userService } from '@/services/userService'
import { ROUTE_PATHS } from '@/constants/routes'
import { ROLES_CADASTRO_EQUIPE } from '@/constants/establishmentRoles'
import { getUnmetPasswordRules } from '@/utils/passwordRules'
import type { EstablishmentUserRole } from '@/types/negocio/equipe.types'

type ModoCadastro = 'convite' | 'vincular' | 'criar'

const route = useRoute()
const router = useRouter()
const { estabelecimentoId, ready, error: contextError } = useEstabelecimentoView()
const notifications = useNotificationsStore()
const { resolveError, resolveErrorCode } = useApiError()

function modoInicial(): ModoCadastro {
  const q = route.query.modo
  if (q === 'criar' || q === 'vincular') return q
  return 'convite'
}

const modo = ref<ModoCadastro>(modoInicial())

const nome = ref('')
const email = ref('')
const telefone = ref('')
const senha = ref('')
const confirmarSenha = ref('')
const nomePublico = ref('')
const role = ref<EstablishmentUserRole>(
  route.query.role === 'Profissional' ? 'Profissional' : 'Receptionist',
)
const podeReceberAgendamento = ref(true)
const saving = ref(false)
const sucessoDetalhe = ref<string | null>(null)
const linkConvite = ref<string | null>(null)
const formError = ref<string | null>(null)
const emailError = ref<string | undefined>()
const nomeError = ref<string | undefined>()
const telefoneError = ref<string | undefined>()
const senhaError = ref<string | undefined>()
const confirmarSenhaError = ref<string | undefined>()

const modoOptions = [
  { value: 'convite', label: 'Enviar convite', description: 'Recomendado' },
  { value: 'vincular', label: 'Já tem conta', description: 'Vínculo direto' },
  { value: 'criar', label: 'Criar manual', description: 'Avançado' },
] as const

const ehProfissional = computed(() => role.value === 'Profissional')

const modoHint = computed(() => {
  if (modo.value === 'convite') {
    return {
      title: 'Convite inteligente',
      text: 'Informe o e-mail e a função. Conta ativa e confirmada é vinculada na hora; caso contrário, você recebe um link para copiar.',
    }
  }
  if (modo.value === 'vincular') {
    return {
      title: 'Conta já existente',
      text: 'Use quando a pessoa já se cadastrou e confirmou o e-mail na plataforma.',
    }
  }
  return {
    title: 'Criação manual',
    text: 'Você define a senha inicial. Para o dia a dia, prefira Enviar convite.',
  }
})

const submitLabel = computed(() => {
  if (modo.value === 'convite') return 'Gerar convite'
  if (modo.value === 'criar') {
    return ehProfissional.value ? 'Criar conta e convidar' : 'Criar conta'
  }
  return ehProfissional.value ? 'Vincular profissional' : 'Vincular usuário'
})

function clearFormFeedback() {
  formError.value = null
  emailError.value = undefined
  nomeError.value = undefined
  telefoneError.value = undefined
  senhaError.value = undefined
  confirmarSenhaError.value = undefined
}

watch(modo, () => {
  sucessoDetalhe.value = null
  linkConvite.value = null
  clearFormFeedback()
})

watch(email, () => {
  emailError.value = undefined
  formError.value = null
})
watch(nome, () => { nomeError.value = undefined })
watch(telefone, () => { telefoneError.value = undefined })
watch(senha, () => { senhaError.value = undefined })
watch(confirmarSenha, () => { confirmarSenhaError.value = undefined })

function validarSenha(): string | null {
  const regras = getUnmetPasswordRules(senha.value)
  if (regras.length > 0) {
    return `A senha não atende: ${regras.join(' ')}`
  }
  if (senha.value !== confirmarSenha.value) {
    return 'As senhas não conferem.'
  }
  return null
}

async function copiarLink() {
  if (!linkConvite.value) return
  try {
    await navigator.clipboard.writeText(linkConvite.value)
    notifications.push('success', 'Link copiado!')
  } catch {
    notifications.push('error', 'Não foi possível copiar o link.')
  }
}

async function enviarConvite() {
  if (!estabelecimentoId.value) return

  clearFormFeedback()

  const emailTrim = email.value.trim().toLowerCase()
  if (!emailTrim) {
    emailError.value = 'Informe o e-mail do convidado.'
    return
  }

  saving.value = true
  sucessoDetalhe.value = null
  linkConvite.value = null

  try {
    const resultado = ehProfissional.value
      ? await conviteService.criarConviteProfissional(estabelecimentoId.value, {
          email: emailTrim,
          nomePublico: nomePublico.value.trim() || undefined,
          podeReceberAgendamento: podeReceberAgendamento.value,
        })
      : await conviteService.criarConviteUsuario(estabelecimentoId.value, {
          email: emailTrim,
          role: role.value as 'Admin' | 'Manager' | 'Receptionist',
        })

    if (resultado.tipoResultado === 'Vinculado') {
      notifications.push(
        'success',
        ehProfissional.value
          ? 'Profissional vinculado à equipe.'
          : 'Usuário adicionado à equipe.',
      )
      await router.push(ROUTE_PATHS.CONFIG_EQUIPE)
      return
    }

    linkConvite.value = resultado.linkConvite ?? resultado.convite?.linkConvite ?? null
    sucessoDetalhe.value =
      'Envie o link abaixo. A pessoa deve se cadastrar com este e-mail, confirmar e aceitar o convite.'
    notifications.push('success', 'Convite criado com sucesso.')
  } catch (err) {
    formError.value = resolveError(err, 'Não foi possível criar o convite.')
  } finally {
    saving.value = false
  }
}

async function vincularExistente() {
  if (!estabelecimentoId.value) return
  clearFormFeedback()

  const emailTrim = email.value.trim()
  const telefoneTrim = telefone.value.trim()
  if (!emailTrim && !telefoneTrim) {
    emailError.value = 'Informe o e-mail ou o telefone.'
    telefoneError.value = 'Informe o e-mail ou o telefone.'
    return
  }

  saving.value = true
  try {
    if (ehProfissional.value) {
      await equipeService.vincularProfissional(estabelecimentoId.value, {
        email: emailTrim || undefined,
        telefone: telefoneTrim || undefined,
        nomePublico: nomePublico.value.trim() || undefined,
        podeReceberAgendamento: podeReceberAgendamento.value,
      })
      notifications.push('success', 'Profissional vinculado à equipe.')
    } else {
      await equipeService.cadastrarUsuario(estabelecimentoId.value, {
        email: emailTrim || undefined,
        telefone: telefoneTrim || undefined,
        role: role.value,
      })
      notifications.push('success', 'Usuário adicionado à equipe.')
    }
    await router.push(ROUTE_PATHS.CONFIG_EQUIPE)
  } catch (err) {
    formError.value = resolveError(
      err,
      'Não encontramos uma conta ativa com esses dados. Use "Enviar convite" se a pessoa ainda não se cadastrou.',
    )
  } finally {
    saving.value = false
  }
}

async function tentarVincularProfissional(emailTrim: string, telefoneTrim: string): Promise<boolean> {
  if (!estabelecimentoId.value) return false
  try {
    await equipeService.vincularProfissional(estabelecimentoId.value, {
      email: emailTrim || undefined,
      telefone: telefoneTrim || undefined,
      nomePublico: nomePublico.value.trim() || undefined,
      podeReceberAgendamento: podeReceberAgendamento.value,
    })
    return true
  } catch {
    return false
  }
}

async function tentarVincularUsuario(emailTrim: string, telefoneTrim: string): Promise<boolean> {
  if (!estabelecimentoId.value) return false
  try {
    await equipeService.cadastrarUsuario(estabelecimentoId.value, {
      email: emailTrim || undefined,
      telefone: telefoneTrim || undefined,
      role: role.value,
    })
    return true
  } catch {
    return false
  }
}

async function criarNovaConta() {
  if (!estabelecimentoId.value) return

  const emailTrim = email.value.trim().toLowerCase()
  const telefoneTrim = telefone.value.trim()
  const nomeTrim = nome.value.trim()

  clearFormFeedback()

  if (!nomeTrim) nomeError.value = 'Informe o nome completo.'
  if (!emailTrim) emailError.value = 'Informe o e-mail.'
  if (!telefoneTrim) telefoneError.value = 'Informe o telefone.'
  if (nomeError.value || emailError.value || telefoneError.value) return

  const erroSenha = validarSenha()
  if (erroSenha) {
    if (senha.value !== confirmarSenha.value) {
      confirmarSenhaError.value = 'As senhas não conferem.'
    } else {
      senhaError.value = erroSenha
    }
    return
  }

  if (ehProfissional.value && !nomePublico.value.trim()) {
    nomePublico.value = nomeTrim
  }

  saving.value = true
  sucessoDetalhe.value = null

  try {
    let contaRecémCriada = false

    try {
      await userService.cadastrar({
        nome: nomeTrim,
        email: emailTrim,
        telefone: telefoneTrim,
        senha: senha.value,
      })
      contaRecémCriada = true
    } catch (err) {
      if (resolveErrorCode(err) !== 'EMAIL_JA_CADASTRADO') {
        throw err
      }
    }

    if (ehProfissional.value) {
      const vinculou = await tentarVincularProfissional(emailTrim, telefoneTrim)
      if (vinculou) {
        notifications.push('success', 'Profissional vinculado à equipe.')
        await router.push(ROUTE_PATHS.CONFIG_EQUIPE)
        return
      }

      const resultado = await conviteService.criarConviteProfissional(estabelecimentoId.value, {
        email: emailTrim,
        telefone: telefoneTrim || undefined,
        nomePublico: nomePublico.value.trim() || nomeTrim,
        podeReceberAgendamento: podeReceberAgendamento.value,
      })

      if (resultado.tipoResultado === 'Vinculado') {
        notifications.push('success', 'Profissional vinculado à equipe.')
        await router.push(ROUTE_PATHS.CONFIG_EQUIPE)
        return
      }

      linkConvite.value = resultado.linkConvite ?? resultado.convite?.linkConvite ?? null
      if (contaRecémCriada) {
        sucessoDetalhe.value =
          'Conta criada. Peça para confirmar o e-mail e aceitar o convite pelo link abaixo.'
      } else {
        sucessoDetalhe.value =
          'Convite gerado. Peça para confirmar o e-mail e aceitar pelo link abaixo.'
      }
      notifications.push('success', 'Convite de profissional criado.')
      return
    }

    const vinculou = await tentarVincularUsuario(emailTrim, telefoneTrim)
    if (vinculou) {
      notifications.push('success', 'Usuário adicionado à equipe.')
      await router.push(ROUTE_PATHS.CONFIG_EQUIPE)
      return
    }

    if (contaRecémCriada) {
      sucessoDetalhe.value =
        'Conta criada. A pessoa receberá um e-mail de confirmação. Depois, use "Já tem conta" para vincular.'
      notifications.push('success', 'Conta criada. Aguardando confirmação de e-mail.')
      return
    }

    notifications.push(
      'info',
      'O e-mail já existe, mas ainda não foi possível vincular. Peça para confirmar o e-mail ou use "Já tem conta".',
    )
  } catch (err) {
    formError.value = resolveError(err, 'Não foi possível criar a conta.')
  } finally {
    saving.value = false
  }
}

async function handleSubmit() {
  if (modo.value === 'convite') {
    await enviarConvite()
  } else if (modo.value === 'vincular') {
    await vincularExistente()
  } else {
    await criarNovaConta()
  }
}
</script>

<template>
  <div class="page-shell space-y-4 lg:space-y-5">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div class="min-w-0 space-y-2">
        <RouterLink
          :to="ROUTE_PATHS.CONFIG_EQUIPE"
          class="inline-flex items-center gap-1.5 font-urbanist text-sm text-glow-text-subtle transition hover:text-glow-text"
        >
          <span aria-hidden="true">←</span>
          Voltar à equipe
        </RouterLink>
        <h1 class="font-satoshi text-2xl font-bold leading-tight text-glow-text lg:text-3xl">
          Adicionar à equipe
        </h1>
        <p class="max-w-3xl font-urbanist text-sm leading-relaxed text-glow-text-subtle">
          Convide pessoas para operar seu negócio. O fluxo recomendado é por
          <strong class="font-medium text-glow-text">convite por link</strong> — cada um define a própria senha.
        </p>
      </div>
    </div>

    <ContentAlert v-if="contextError" variant="error" title="Não foi possível continuar" compact>
      {{ contextError }}
    </ContentAlert>

    <section v-if="ready" class="panel-shell">
      <div class="panel-shell__header space-y-4">
        <SegmentedControl
          v-model="modo"
          :options="[...modoOptions]"
          aria-label="Modo de adição à equipe"
        />
        <BaseAlert
          v-if="sucessoDetalhe"
          variant="success"
          :title="linkConvite ? 'Convite pronto' : undefined"
        >
          {{ sucessoDetalhe }}
        </BaseAlert>
        <BaseAlert
          v-else-if="!linkConvite"
          variant="info"
          :title="modoHint.title"
        >
          {{ modoHint.text }}
        </BaseAlert>
      </div>

      <div v-if="linkConvite" class="panel-shell__body space-y-4">
        <div>
          <h2 class="font-urbanist text-base font-semibold text-glow-text">Link do convite</h2>
          <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
            Copie e envie por WhatsApp, e-mail ou outro canal. Só a conta com o e-mail informado pode aceitar.
          </p>
        </div>
        <div
          class="flex flex-col gap-2 rounded-lg border border-glow-border-soft bg-glow-canvas p-3 lg:flex-row lg:items-center"
        >
          <p class="min-w-0 flex-1 break-all font-mono text-xs text-glow-text sm:text-sm">
            {{ linkConvite }}
          </p>
          <BaseButton variant="primary" size="sm" class="shrink-0" @click="copiarLink">
            Copiar link
          </BaseButton>
        </div>
        <div class="flex flex-wrap gap-2 border-t border-glow-border-soft pt-4">
          <RouterLink :to="ROUTE_PATHS.CONFIG_EQUIPE_CONVITES">
            <BaseButton variant="secondary" size="sm">Ver convites pendentes</BaseButton>
          </RouterLink>
          <RouterLink :to="ROUTE_PATHS.CONFIG_EQUIPE">
            <BaseButton variant="ghost" size="sm">Voltar à equipe</BaseButton>
          </RouterLink>
        </div>
      </div>

      <div v-else class="panel-shell__body">
        <form class="space-y-5" @submit.prevent="handleSubmit">
          <ContentAlert v-if="formError" variant="error" compact>
            {{ formError }}
          </ContentAlert>

          <div>
            <h2 class="mb-3 font-urbanist text-sm font-semibold text-glow-text">
              Dados da pessoa
            </h2>
            <div
              class="grid gap-4"
              :class="modo === 'convite' ? 'max-w-md' : 'sm:grid-cols-2 lg:max-w-3xl'"
            >
              <BaseInput
                v-if="modo === 'criar'"
                v-model="nome"
                label="Nome completo"
                required
                placeholder="Maria Silva"
                :error="nomeError"
              />

              <BaseInput
                v-model="email"
                label="E-mail"
                type="email"
                placeholder="usuario@exemplo.com"
                required
                :error="emailError"
                :hint="
                  modo === 'vincular' && !emailError
                    ? 'Informe e-mail ou telefone (pelo menos um).'
                    : undefined
                "
              />

              <TelefoneInput
                v-if="modo === 'criar'"
                v-model="telefone"
                label="Telefone"
                required
                :error="telefoneError"
              />
              <BaseInput
                v-else-if="modo === 'vincular'"
                v-model="telefone"
                label="Telefone"
                type="tel"
                placeholder="(11) 99999-9999"
                :error="telefoneError"
              />

              <template v-if="modo === 'criar'">
                <BaseInput
                  v-model="senha"
                  label="Senha inicial"
                  type="password"
                  required
                  autocomplete="new-password"
                  :error="senhaError"
                />
                <BaseInput
                  v-model="confirmarSenha"
                  label="Confirmar senha"
                  type="password"
                  required
                  autocomplete="new-password"
                  :error="confirmarSenhaError"
                />
                <div class="sm:col-span-2">
                  <AuthPasswordRules :password="senha" />
                </div>
              </template>
            </div>
          </div>

          <fieldset>
            <legend class="mb-3 block font-urbanist text-sm font-semibold text-glow-text">
              Função na equipe
            </legend>
            <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <label
                v-for="r in ROLES_CADASTRO_EQUIPE"
                :key="r.value"
                class="cursor-pointer rounded-lg border px-3 py-3 transition"
                :class="
                  role === r.value
                    ? 'border-glow-gold bg-glow-gold-soft shadow-sm'
                    : 'border-glow-border-soft bg-glow-canvas hover:border-glow-text-subtle hover:bg-glow-hover-surface'
                "
              >
                <input
                  v-model="role"
                  type="radio"
                  :value="r.value"
                  class="sr-only"
                />
                <span class="block font-urbanist text-sm font-semibold text-glow-text">
                  {{ r.label }}
                </span>
                <span class="mt-0.5 block font-urbanist text-xs leading-snug text-glow-text-subtle">
                  {{ r.description }}
                </span>
              </label>
            </div>
          </fieldset>

          <div
            v-if="ehProfissional"
            class="grid gap-4 rounded-lg border border-glow-border-soft bg-glow-canvas p-4 sm:grid-cols-2 lg:max-w-3xl"
          >
            <BaseInput
              v-model="nomePublico"
              label="Nome público"
              :placeholder="
                modo === 'convite' || modo === 'criar'
                  ? 'Opcional — usa o nome no cadastro'
                  : 'Como aparecerá para os clientes'
              "
            />
            <label
              class="flex cursor-pointer items-center gap-3 self-end rounded-lg border border-glow-border-soft bg-glow-surface px-3 py-3 font-urbanist text-sm text-glow-text transition hover:bg-glow-hover-surface sm:min-h-[2.75rem]"
            >
              <input
                v-model="podeReceberAgendamento"
                type="checkbox"
                class="size-4 shrink-0 rounded border-glow-border-soft bg-glow-canvas text-glow-gold focus:ring-glow-gold/40"
              />
              Pode receber agendamentos na vitrine
            </label>
          </div>

          <div
            class="flex flex-col-reverse gap-3 border-t border-glow-border-soft pt-5 sm:flex-row sm:justify-end"
          >
            <RouterLink :to="ROUTE_PATHS.CONFIG_EQUIPE" class="sm:order-first">
              <BaseButton variant="secondary" block class="sm:w-auto">Cancelar</BaseButton>
            </RouterLink>
            <BaseButton type="submit" :loading="saving" block class="sm:w-auto">
              {{ submitLabel }}
            </BaseButton>
          </div>
        </form>
      </div>
    </section>
  </div>
</template>

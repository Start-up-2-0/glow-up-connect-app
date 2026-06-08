import { computed, ref, watch, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { equipeService } from '@/services/equipeService'
import { conviteService } from '@/services/conviteService'
import { userService } from '@/services/userService'
import { ROUTE_PATHS } from '@/constants/routes'
import { equipeAdicionarBotaoConfirmar } from '@/constants/equipeAdicionarAcoes'
import { getUnmetPasswordRules } from '@/utils/passwordRules'
import type { EstablishmentUserRole } from '@/types/negocio/equipe.types'

export type ModoCadastro = 'convite' | 'vincular' | 'criar'

export interface UseEquipeAdicionarFormOptions {
  modo: Ref<ModoCadastro>
  initialRole?: EstablishmentUserRole
  /** Quando definido, redireciona após vínculo direto. Omitir em modais. */
  navigateOnVinculo?: boolean
  onVinculado?: () => void | Promise<void>
}

export function useEquipeAdicionarForm(options: UseEquipeAdicionarFormOptions) {
  const router = useRouter()
  const { estabelecimentoId } = useEstabelecimentoView()
  const notifications = useNotificationsStore()
  const { resolveError, resolveErrorCode } = useApiError()

  const nome = ref('')
  const email = ref('')
  const telefone = ref('')
  const senha = ref('')
  const confirmarSenha = ref('')
  const nomePublico = ref('')
  const role = ref<EstablishmentUserRole>(options.initialRole ?? 'Receptionist')
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

  const ehProfissional = computed(() => role.value === 'Profissional')

  const submitLabel = computed(() =>
    equipeAdicionarBotaoConfirmar(options.modo.value, ehProfissional.value),
  )

  function clearFormFeedback() {
    formError.value = null
    emailError.value = undefined
    nomeError.value = undefined
    telefoneError.value = undefined
    senhaError.value = undefined
    confirmarSenhaError.value = undefined
  }

  function resetForm() {
    nome.value = ''
    email.value = ''
    telefone.value = ''
    senha.value = ''
    confirmarSenha.value = ''
    nomePublico.value = ''
    role.value = options.initialRole ?? 'Receptionist'
    podeReceberAgendamento.value = true
    sucessoDetalhe.value = null
    linkConvite.value = null
    clearFormFeedback()
  }

  watch(options.modo, () => {
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

  async function afterVinculo() {
    if (options.onVinculado) {
      await options.onVinculado()
    }
    if (options.navigateOnVinculo !== false) {
      await router.push(ROUTE_PATHS.CONFIG_EQUIPE)
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
        await afterVinculo()
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

    const emailTrim = email.value.trim().toLowerCase()
    if (!emailTrim) {
      emailError.value = 'Informe o e-mail da pessoa.'
      return
    }

    saving.value = true
    try {
      if (ehProfissional.value) {
        await equipeService.vincularProfissional(estabelecimentoId.value, {
          email: emailTrim,
          nomePublico: nomePublico.value.trim() || undefined,
          podeReceberAgendamento: podeReceberAgendamento.value,
        })
        notifications.push('success', 'Profissional vinculado à equipe.')
      } else {
        await equipeService.cadastrarUsuario(estabelecimentoId.value, {
          email: emailTrim,
          role: role.value,
        })
        notifications.push('success', 'Usuário adicionado à equipe.')
      }
      await afterVinculo()
    } catch (err) {
      formError.value = resolveError(
        err,
        'Não encontramos uma conta confirmada com este e-mail. Se a pessoa ainda não entrou, use "Pessoa ainda não entrou".',
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
          await afterVinculo()
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
          await afterVinculo()
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
        await afterVinculo()
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
    if (options.modo.value === 'convite') {
      await enviarConvite()
    } else if (options.modo.value === 'vincular') {
      await vincularExistente()
    } else {
      await criarNovaConta()
    }
  }

  return {
    nome,
    email,
    telefone,
    senha,
    confirmarSenha,
    nomePublico,
    role,
    podeReceberAgendamento,
    saving,
    sucessoDetalhe,
    linkConvite,
    formError,
    emailError,
    nomeError,
    telefoneError,
    senhaError,
    confirmarSenhaError,
    ehProfissional,
    submitLabel,
    resetForm,
    copiarLink,
    handleSubmit,
  }
}

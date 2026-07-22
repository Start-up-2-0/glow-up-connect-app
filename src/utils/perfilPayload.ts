import type { EnderecoOnboarding } from '@/types/assinatura.types'
import type {
  AtualizarEstabelecimentoPerfilPayload,
  EnderecoPerfil,
  EstabelecimentoPerfilCompleto,
} from '@/types/estabelecimento.types'

function enderecoPerfilToApi(endereco: EnderecoPerfil): EnderecoOnboarding {
  return {
    cep: endereco.cep,
    logradouro: endereco.logradouro,
    numero: endereco.numero,
    bairro: endereco.bairro,
    cidade: endereco.cidade,
    estado: endereco.estado,
    ...(endereco.complemento ? { complemento: endereco.complemento } : {}),
  }
}

export function buildAtualizarPerfilPayload(
  perfil: EstabelecimentoPerfilCompleto,
  patch: AtualizarEstabelecimentoPerfilPayload = {},
): AtualizarEstabelecimentoPerfilPayload & { logo: string } {
  return {
    nome: patch.nome ?? perfil.nome,
    telefone: patch.telefone ?? perfil.telefone,
    email: patch.email ?? perfil.email,
    logo: patch.logo ?? perfil.logo,
    endereco:
      patch.endereco ??
      (perfil.endereco ? enderecoPerfilToApi(perfil.endereco) : undefined),
  }
}

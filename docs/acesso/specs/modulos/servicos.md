# Spec UI — Modulo Servicos

## Gate

- Modulo: `Servicos`
- Plano minimo: **Basic**
- Permissao leitura: `ServicoVisualizar`
- Permissao escrita: `ServicoGerenciar`

## Menu

Item **Servicos** (adicionar em `businessNavItems` quando modulo ativo).

| Rota | Tela |
|------|------|
| `/servicos` | Listagem |
| `/servicos/novo` | Criar |
| `/servicos/:id` | Editar |
| `/servicos/:id/profissionais` | Vinculos (Plus+ com equipe) |

## APIs

| Acao | Metodo |
|------|--------|
| Listar | GET `/servicos` |
| Criar | POST `/servicos` |
| Editar | PUT/PATCH `/servicos/{id}` |
| Vincular profissional | POST `/servicos/{id}/profissionais` |

## Limite Basic

`limiteServicos: 10` — ao atingir limite, API retorna erro de dominio.

UI:

- Contador "8/10 servicos" no header da listagem.
- Botao "Novo servico" desabilitado no limite com tooltip upgrade Plus (limite null no Plus).

## Criterios de aceite

- [ ] Visitante sem `ServicoGerenciar` ve listagem read-only.
- [ ] Contador de limite visivel no Basic.
- [ ] Menu oculto sem modulo.

# Spec UI — Modulo Caixa

## Gate

- Modulo: `Caixa`
- Plano minimo: **Premium**
- Permissao: `CaixaVisualizar`

## Menu

**Financeiro** > Caixa (submenu ou aba default)

| Rota | Tela |
|------|------|
| `/financeiro/caixa` | Resumo do caixa |
| `/financeiro/caixa/lancamentos` | Lista de lancamentos |

## APIs

| Acao | Metodo |
|------|--------|
| Resumo | GET `/caixa` |
| Lancamentos | GET `/caixa/lancamentos` |

Prefixo: `/api/estabelecimentos/{estabelecimentoId}`

## Bloqueio Plus/Basic

Menu **Financeiro** inteiro oculto sem `Caixa` ou `Financeiro`.

Modal upgrade: "Controle de caixa no plano **Premium**".

## Criterios de aceite

- [ ] Apenas Premium ve menu Financeiro.
- [ ] Receptionist sem `CaixaVisualizar` nao ve valores.
- [ ] 403 tratado com mensagem amigavel.

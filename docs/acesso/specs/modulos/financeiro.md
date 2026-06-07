# Spec UI — Modulo Financeiro

## Gate

- Modulos: `Financeiro` e/ou `ComissaoProfissionais`
- Plano minimo: **Premium**

## Menu

**Financeiro** (item top-level em `businessNavItems`)

| Rota | Tela |
|------|------|
| `/financeiro` | Dashboard financeiro |
| `/financeiro/caixa` | Caixa (modulo Caixa) |
| `/financeiro/comissoes` | Comissoes (modulo ComissaoProfissionais) |
| `/financeiro/relatorios` | Relatorios avancados |

## Funcionalidades (catalogo)

- Fluxo financeiro completo
- Comissao automatica por profissional
- Relatorios e metricas avancadas
- Historico financeiro

## APIs

Endpoints especificos conforme evolucao do backend — hoje enforcement principal em **Caixa** (`GET /caixa`).

Consultar Swagger para rotas financeiras adicionais.

## UX upgrade

| Plano atual | CTA |
|-------------|-----|
| Basic / Plus | "Desbloqueie financeiro com Premium" |
| Premium | Operacao completa |

## Criterios de aceite

- [ ] Submenu Comissoes so com `ComissaoProfissionais` em modulos[].
- [ ] Dashboard financeiro placeholder ate APIs dedicadas.
- [ ] Prioridade marketplace (Premium) em badge separado na vitrine, nao nesta tela.

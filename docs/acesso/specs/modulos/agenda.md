# Spec UI — Modulo Agenda

## Gate

- Modulo: `Agenda`
- Plano minimo: **Basic**
- Permissao: `AgendaVisualizarGeral` (equipe) ou `AgendaVisualizarPropria` (profissional)

## Menu

Item **Agenda** em `businessNavItems` — subitens Hoje / Semana / Mes.

Rotas sugeridas:

| Rota | Tela |
|------|------|
| `/agenda` | Visao geral (default Hoje) |
| `/agenda/semana` | Calendario semanal |
| `/agenda/mes` | Calendario mensal |
| `/agenda/:agendamentoId` | Detalhe + acoes |

## APIs principais

Prefixo: `/api/estabelecimentos/{estabelecimentoId}`

| Acao | Permissao | Metodo |
|------|-----------|--------|
| Listar agenda | AgendaVisualizarGeral | GET `/agenda` |
| Minha agenda | AgendaVisualizarPropria | GET `/agenda/propria` |
| Confirmar | AgendaCriar | POST `/agendamentos/{id}/confirmar` |
| Cancelar | AgendaCancelar | POST `/agendamentos/{id}/cancelar` |
| Remarcar | AgendaReagendar | POST `/agendamentos/{id}/remarcar` |
| Iniciar atendimento | AtendimentoIniciar | POST `/atendimentos/{itemId}/iniciar` |
| Finalizar | AtendimentoFinalizar | POST `/atendimentos/{itemId}/finalizar` |

## UX por permissao

| Role | Comportamento |
|------|---------------|
| Owner / Manager / Receptionist | Agenda geral |
| Profissional | Default `/agenda/propria` |
| Sem permissao | Item oculto no menu |

## Bloqueio de plano

Sem modulo `Agenda` (assinatura inativa): paywall onboarding.

## Criterios de aceite

- [ ] Profissional nao ve agendamentos de colegas.
- [ ] Botoes de acao checam permissao granular.
- [ ] 403 `SUBSCRIPTION_MODULE_BLOCKED` abre upgrade (nao aplicavel se Basic+ ativo).

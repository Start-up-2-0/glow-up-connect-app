# Spec UI — Modulo WhatsApp

## Gate

- Modulo: `WhatsApp`
- Plano minimo: **Plus**

> O modulo controla envio **automatico ao cliente** em agendamentos. Confirmacao do numero do negocio usa fluxo separado (ver [confirmacao-whatsapp.md](../../../frontend/confirmacao-whatsapp.md)).

## Menu

Configuracoes > **WhatsApp**

| Rota | Tela |
|------|------|
| `/configuracoes/whatsapp` | Status confirmacao + opt-in do estabelecimento |

## Comportamento

| Com WhatsApp | Sem WhatsApp (Basic) |
|--------------|----------------------|
| Confirmacao/lembrete WhatsApp ao cliente | Apenas e-mail (modulo Email) |
| Opt-in e confirmacao do telefone do negocio | Mesmo fluxo de confirmacao disponivel, sem envio ao cliente |

## APIs relacionadas

| Acao | Rota |
|------|------|
| Solicitar confirmacao | POST `/api/estabelecimentos/{id}/whatsapp/solicitar-confirmacao` |
| Opt-in | POST `/api/estabelecimentos/{id}/whatsapp/opt-in` |

Reutilizar composable `useWhatsAppConfirmacao` quando possivel.

## UX no Basic

- Em configuracoes de notificacoes de agendamento: badge "Disponivel no Plus".
- Nao exibir toggle de WhatsApp ao cliente.

## Criterios de aceite

- [ ] Plus exibe toggles de notificacao WhatsApp.
- [ ] Basic mostra CTA upgrade, nao erro silencioso.
- [ ] Confirmacao do telefone do negocio funciona em qualquer plano (infra).

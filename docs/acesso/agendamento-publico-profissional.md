# Agendamento público vinculado ao profissional

Fluxo para clientes acessarem o link do profissional (`/loja/{loja}/agendar?profissional={guid}`) sem login obrigatório.

## Rotas frontend

| Rota | Descrição |
|------|-----------|
| `/loja/{publicGuid}/agendar?profissional={guid}` | Wizard de agendamento |
| `/agendamento/remarcacao/{token}` | Aceitar/recusar sugestão de reagendamento |

## API pública (`/api/publico/agendar`)

| Etapa | Método | Rota |
|-------|--------|------|
| Contexto loja + profissional | GET | `/loja/{loja}/profissional/{profissional}` |
| Serviços | GET | `/loja/{loja}/servicos?profissionalPublicGuid=` |
| Disponibilidade | GET | `/loja/{loja}/disponibilidade?profissionalPublicGuid=&servicoIds=` |
| Agendar visitante | POST | `/loja/{loja}` |
| Agendar + cadastro | POST | `/loja/{loja}/com-cadastro` |
| Ver proposta remarcação | GET | `/remarcacao/{token}` |
| Aceitar proposta | POST | `/remarcacao/{token}/aceitar` |
| Recusar proposta | POST | `/remarcacao/{token}/recusar` |

## Caminhos do cliente

1. **Entrar** — redirect para login com `?redirect=`; após login usa `POST /api/agendamentos` (vincula `UsuarioClienteId`).
2. **Criar conta e agendar** — `POST /com-cadastro`; conta inativa até confirmar e-mail; agendamento vinculado ao novo usuário; loja notificada após confirmação.
3. **Visitante** — `POST /loja/{guid}` com nome, e-mail e telefone.

## Operação da loja

- Confirmar / cancelar: rotas existentes em `/api/estabelecimentos/{id}/agendamentos/{id}/...`
- **Sugerir reagendamento**: `POST .../sugerir-remarcacao` — cliente notificado por e-mail/WhatsApp; horário só muda após aceite.

## Regras

- Profissional é **obrigatório** no link e no payload de criação.
- Histórico registra criação, proposta, notificação e resposta do cliente.

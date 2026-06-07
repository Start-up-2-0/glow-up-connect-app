# Spec UI — Plano Basic

## Identificacao API

| Campo | Valor |
|-------|-------|
| Nome | `Basic` |
| Preco | R$ 29,99 / Mensal |
| Id seed | `1` |

## Modulos no card da vitrine

- Agenda
- Servicos
- HorariosAtendimento
- Notificacoes
- Email

*(Estabelecimento e Assinatura sao base pos-contratacao — nao listar na vitrine.)*

## Limites — copy UI

| Limite | Exibicao |
|--------|----------|
| Usuarios | 1 usuario |
| Profissionais | 1 profissional |
| Servicos | ate 10 servicos |
| Agendamentos | Ilimitado |

## Itens de menu liberados

| Menu | Modulo |
|------|--------|
| Dashboard | — |
| Agenda | Agenda |
| Servicos *(futuro)* | Servicos |
| Horarios *(em Config)* | HorariosAtendimento |
| Config > Perfil | Estabelecimento |
| Config > Assinatura | Assinatura |

**Ocultos:** Equipe, Financeiro, WhatsApp settings de cliente.

## CTA upgrade

| Usuario tenta | Sugerir |
|---------------|---------|
| Convidar profissional | Plus |
| WhatsApp automatico | Plus |
| Caixa / financeiro | Premium |

## Criterios de aceite

- [ ] Card destaca "Ideal para comecar sozinho".
- [ ] Limites `null` da API como "Ilimitado" (agendamentos).
- [ ] Pos-trial Basic cobra R$ 29,99/mes.

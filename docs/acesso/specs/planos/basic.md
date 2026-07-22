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
| Horarios | HorariosAtendimento |
| Profissionais *(vitrine)* | HorariosAtendimento + `requerSemModulo: Profissionais` |
| Config > Perfil | Estabelecimento |
| Config > Assinatura | Assinatura |

**Ocultos:** Equipe (modulo Profissionais), Financeiro, WhatsApp settings de cliente.

### Profissionais vitrine (Basic)

- Rota: `/configuracoes/profissionais-vitrine`
- Cadastro **somente exibição**: nome publico, bio e foto opcionais.
- Limite: **1 profissional** (`limiteProfissionais` do plano).
- Aparece na vitrine publica da loja (`GET /publico/estabelecimentos/{guid}/profissionais-vitrine`).
- Dono agenda internamente na agenda logada; profissional **nao** acessa o app.
- Horarios: aba **Profissional** lista profissionais vitrine (nao usa `equipeService`).

## CTA upgrade

| Usuario tenta | Sugerir |
|---------------|---------|
| Equipe com login / convites | Plus |
| Mais de 1 profissional com conta | Plus |
| WhatsApp automatico | Plus |
| Caixa / financeiro | Premium |

## Criterios de aceite

- [ ] Card destaca "Ideal para comecar sozinho".
- [ ] Limites `null` da API como "Ilimitado" (agendamentos).
- [ ] Pos-trial Basic cobra R$ 29,99/mes.

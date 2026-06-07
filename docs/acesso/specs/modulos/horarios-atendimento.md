# Spec UI — Modulo HorariosAtendimento

## Gate

- Modulo: `HorariosAtendimento`
- Plano minimo: **Basic**
- Permissao loja: `HorarioGerenciar` / `HorarioVisualizar`
- Permissao propria: `HorarioGerenciarProprio`

## Menu

Configuracoes > **Horarios de atendimento**

| Rota | Tela |
|------|------|
| `/configuracoes/horarios` | Horarios da loja |
| `/configuracoes/horarios/profissionais` | Horarios por profissional (Plus+) |

## APIs

| Acao | Metodo |
|------|--------|
| Ver horarios loja | GET `/horarios-funcionamento` |
| Editar loja | POST/PUT/PATCH `/horarios-funcionamento` |
| Ver horarios profissional | GET `/profissionais/horarios` |
| Editar proprio | POST/PUT/PATCH `/profissionais/{id}/horarios` |

## UX

- Aba "Loja" sempre visivel com modulo.
- Aba "Por profissional" requer tambem modulo `Profissionais` (Plus).
- Profissional edita apenas proprio horario.

## Criterios de aceite

- [ ] Basic configura horario da loja.
- [ ] Aba profissionais oculta no Basic.
- [ ] Disponibilidade publica depende destes horarios (agendamento cliente).

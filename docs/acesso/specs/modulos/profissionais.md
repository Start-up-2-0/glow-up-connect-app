# Spec UI — Modulo Profissionais

## Gate

- Modulo: `Profissionais`
- Plano minimo: **Plus**
- Permissoes: `EquipeGerenciar`, `ProfissionalConvidar`, `ProfissionalGerenciar`

## Menu

Configuracoes > **Equipe**

| Rota | Tela |
|------|------|
| `/configuracoes/equipe` | Lista de usuarios / profissionais |
| `/configuracoes/equipe/convites` | Convites pendentes |
| `/configuracoes/equipe/novo` | Convidar profissional |

## APIs

| Acao | Permissao | Metodo |
|------|-----------|--------|
| Listar equipe | EquipeGerenciar | GET/POST `/equipe/usuarios` |
| Convidar | ProfissionalConvidar | POST `/equipe/profissionais`, POST `.../convites/profissionais` |
| Alterar status | ProfissionalGerenciar | PATCH `/equipe/profissionais/{id}/status` |

## Bloqueio Basic

Sem modulo: item **Equipe** oculto. Se usuario acessa rota direta:

- Modal upgrade: "Gerencie sua equipe com o plano **Plus**".

## Limite Basic (se downgrade futuro)

`limiteUsuarios: 1` no Basic — nao aplicavel quando modulo Profissionais ausente.

## Criterios de aceite

- [ ] Convite envia e-mail (fluxo existente backend).
- [ ] Basic nao exibe menu Equipe.
- [ ] Owner sempre ve equipe com Plus ativo.

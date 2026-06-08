# Spec UI — Modulo Profissionais

## Gate

- Modulo: `Profissionais`
- Plano minimo: **Plus**
- Permissoes: `EquipeGerenciar`, `ProfissionalConvidar`, `ProfissionalGerenciar`

## Menu

**Equipe** (item raiz do menu operacional)

| Rota | Tela |
|------|------|
| `/configuracoes/equipe` | Lista de usuarios / profissionais |
| `/configuracoes/equipe/convites` | Convites pendentes |
| `/configuracoes/equipe/usuario/novo` | Enviar convite (padrao), vincular ou criar manual |

## Fluxo padrao — convite nominativo por link

1. Dono informa **e-mail + funcao** em **Enviar convite**.
2. API retorna `linkConvite` (`/convites/{token}`) — copiavel na UI; e-mail opcional via fila.
3. Convidado abre o link (sem login): ve preview do estabelecimento e funcao.
4. Sem conta: **Criar conta** com o e-mail do convite e senha propria → confirma e-mail → volta ao link.
5. Com conta: **Login** com redirect ao convite → aceita ou rejeita.
6. Aceite valida e-mail logado = e-mail do convite.
7. `UsuarioEquipe` vincula apenas `EstabelecimentoUsuario`; `Profissional` cria perfil de atendimento.

## APIs

| Acao | Permissao | Metodo |
|------|-----------|--------|
| Listar equipe | EquipeGerenciar | GET `/equipe/usuarios`, GET `/equipe/profissionais` |
| Convidar profissional | ProfissionalConvidar | POST `.../convites/profissionais` |
| Convidar usuario equipe | EquipeGerenciar | POST `.../convites/usuarios` |
| Preview publico | — | GET `/convites/{token}/preview` |
| Listar convites | EquipeGerenciar | GET `.../convites?status=Pendente` |
| Aceitar / rejeitar | autenticado | POST `/convites/{token}/aceitar`, `/rejeitar` |
| Cancelar convite | EquipeGerenciar | DELETE `.../convites/{id}` |
| Vinculo direto (conta existente) | EquipeGerenciar | POST `/equipe/usuarios`, POST `/equipe/profissionais` |

## Bloqueio Basic

Sem modulo: item **Equipe** oculto. Se usuario acessa rota direta:

- Modal upgrade: "Gerencie sua equipe com o plano **Plus**".

## Limite Basic (se downgrade futuro)

`limiteUsuarios: 1` no Basic — nao aplicavel quando modulo Profissionais ausente.

## Criterios de aceite

- [ ] Dono convida por e-mail e recebe link copiavel.
- [ ] Convidado cadastra com senha propria, confirma e-mail e aceita convite.
- [ ] E-mail divergente no aceite exibe erro claro.
- [ ] Lista de convites pendentes com cancelamento.
- [ ] Basic nao exibe menu Equipe.
- [ ] Owner sempre ve equipe com Plus ativo.

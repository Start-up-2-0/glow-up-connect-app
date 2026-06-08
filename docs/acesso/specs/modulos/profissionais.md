# Spec UI — Modulo Profissionais

## Dois modos

| Modo | Plano | Menu | Comportamento |
|------|-------|------|---------------|
| **Vitrine** | Basic | Profissionais | Somente exibicao na loja publica; sem usuario/login |
| **Equipe** | Plus+ | Equipe | Convites, vinculos, perfis com acesso ao app |

## Gate Plus (equipe completa)

- Modulo: `Profissionais`
- Plano minimo: **Plus**
- Permissoes: `EquipeGerenciar`, `ProfissionalConvidar`, `ProfissionalGerenciar`

## Gate Basic (vitrine)

- Modulo: `HorariosAtendimento` (sem `Profissionais`)
- Permissao: `ProfissionalGerenciar`
- Rota: `/configuracoes/profissionais-vitrine`
- APIs: `POST/GET/PATCH .../profissionais/vitrine`

## Menu Plus

**Equipe** (item raiz do menu operacional)

| Rota | Tela |
|------|------|
| `/configuracoes/equipe` | Lista de usuarios / profissionais |
| `/configuracoes/equipe/convites` | Convites pendentes |
| `/configuracoes/equipe/usuario/novo` | Gerar convite (padrao) ou cadastrar manualmente |

## Fluxo padrao — convite por link (Plus)

1. Dono informa **e-mail + funcao** em **Gerar convite**.
2. API sempre cria convite pendente com `linkConvite` (`/convites/{token}`), exceto:
   - Conta **nao confirmada** → erro `CONVITE_USUARIO_NAO_CONFIRMADO`.
   - Convite pendente duplicado → erro de convite duplicado.
3. UI exibe link copiavel para enviar à pessoa.
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

## Basic — vitrine (sem modulo Profissionais)

- Menu **Profissionais** visivel (nao **Equipe**).
- Cadastro local sem e-mail/senha/convite.
- Cliente publico **nao** agenda com profissional vitrine; dono **sim** na agenda interna (`OrigemAgendamento.Logado`).

## Bloqueio Plus em rotas de equipe

Sem modulo: item **Equipe** oculto. Rota direta `/configuracoes/equipe` → upgrade Plus.

## Limite Basic (se downgrade futuro)

`limiteUsuarios: 1` no Basic — nao aplicavel quando modulo Profissionais ausente.

## Criterios de aceite

- [ ] E-mail com conta ativa recebe link copiavel (aceita apos login).
- [ ] E-mail novo recebe link copiavel.
- [ ] E-mail nao confirmado exibe erro claro.
- [ ] Basic cadastra profissional vitrine (limite 1).
- [ ] Profissional vitrine aparece na pagina publica da loja.
- [ ] Dono convida por e-mail e sempre recebe link copiavel.
- [ ] Convidado cadastra com senha propria, confirma e-mail e aceita convite.
- [ ] E-mail divergente no aceite exibe erro claro.
- [ ] Lista de convites pendentes com cancelamento.
- [ ] Basic nao exibe menu Equipe.
- [ ] Owner sempre ve equipe com Plus ativo.

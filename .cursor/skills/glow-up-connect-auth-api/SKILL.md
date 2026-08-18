---
name: glow-up-connect-auth-api
description: >
  Integra os fluxos de autenticação do glow-up-connect-app com a GLOWAPI:
  cadastro, confirmação de e-mail, login, refresh/logout, esqueci senha e
  redefinir senha. Usar ao implementar ou alterar authService, userService,
  stores, interceptors, views auth e tratamento de erros da API.
metadata:
  project: glow-up-connect-app
  api: GLOWAPI
  docs-source: docs/frontend-auth.md, docs/cadastro-usuario.md
---

# Glow Up Connect — Integração Auth API

Skill para consumir a **GLOWAPI** nos fluxos de autenticação e cadastro do **glow-up-connect-app**.

Complementa a skill `glow-up-connect-frontend` (scaffold, layouts, UI). Esta skill cobre **somente o contrato e a integração HTTP** com a API.

## Quando usar

- Integrar login, cadastro, confirmação de e-mail ou recuperação de senha
- Criar ou alterar `authService.ts`, `userService.ts`, `auth.store.ts`, interceptors
- Mapear códigos de erro da API para mensagens e ações no UI
- Integrar recuperação de senha (`forgot-password` / `reset-password`)

## Fonte da verdade

| Documento | Conteúdo |
|-----------|----------|
| `docs/frontend-auth.md` | Contrato completo, tipos, checklist, exemplos fetch |
| `docs/cadastro-usuario.md` | Testes manuais, cURL, PowerShell, SQL dev |
| `references/endpoints.md` | Resumo operacional de endpoints |
| `references/error-codes.md` | Mapa HTTP + `code` → ação UI |
| `references/types.ts` | Tipos TypeScript de referência |

## Configuração

| Variável | Valor |
|----------|-------|
| Base URL dev | `http://localhost:5127` |
| Proxy Vite | `VITE_API_BASE_URL=/api` |
| Header auth | `x-glow-token` (NÃO é JWT Bearer) |
| Swagger | `{BASE_URL}/swagger` |
| Health | `GET {BASE_URL}/health` |

JSON aceita **camelCase** (`nome`, `refreshToken`) — API deserializa com `PropertyNameCaseInsensitive`.

## Regras obrigatórias

1. **HTTP só via services** — nunca axios/fetch direto nas views
2. **Três formatos de resposta** (tratar todos):
   - Envelope auth: `{ success, message, data? }`
   - Cadastro `POST /api/usuario`: body direto `201` (sem envelope)
   - Validação `400`: ASP.NET `ValidationProblemDetails` com `errors` por campo
3. **Persistir após login:** `token`, `refreshToken`, `expiresAt`, `refreshExpiresAt`
4. **Refresh rotaciona ambos os tokens** — substituir no storage a cada renovação
5. **401 `TOKEN_EXPIRED`** → tentar refresh → retry ou logout
6. **Esqueci senha:** `forgot-password` sempre 200 genérico; `reset-password` aceita `token` XOR `codigo` + senha. Reenvio reusa `forgot-password`.
7. **Senha:** 6–100 chars; maiúscula, minúscula, número e caractere especial (cadastro e reset)
8. **Cadastro público** cria sempre role `Cliente` — **não** enviar `role` no body

## Status dos endpoints

| Fluxo | Rota | Status |
|-------|------|--------|
| Cadastro | `POST /api/usuario` | Implementado |
| Confirmar e-mail | `POST /api/auth/confirmar-email` | Implementado |
| Reenviar confirmação | `POST /api/auth/reenviar-confirmacao` | Implementado |
| Login | `POST /api/auth/login` | Implementado |
| Refresh | `POST /api/auth/refresh` | Implementado |
| Logout | `POST /api/auth/logout` | Implementado |
| Perfil | `GET /api/usuario/me` | Implementado |
| Esqueci senha | `POST /api/auth/forgot-password` | Implementado |
| Redefinir senha | `POST /api/auth/reset-password` | Implementado |

## Fluxos

### Cadastro → confirmação → login

```
POST /api/usuario (201, ativo: false)
  → tela confirmação (/auth/confirmar-email)
  → POST /api/auth/confirmar-email { codigo } OU { token }
  → POST /api/auth/login
  → persistir tokens; enviar x-glow-token nas rotas privadas
```

Link de confirmação no e-mail:

```text
{Auth:FrontendBaseUrl}/confirmar-email?token=<token-opaco>
```

Validade padrão: **24 horas**.

### Esqueci senha

```
POST /api/auth/forgot-password { email }
  → e-mail com link {FrontendBaseUrl}/resetar-senha?token=... e codigo de 6 digitos
  → POST /api/auth/reset-password { token, senha, confirmarSenha }
     OU { codigo, senha, confirmarSenha }
```

Validade do token/codigo: **30 minutos**.

Telas: `/auth/esqueci-senha`, `/auth/esqueci-senha/codigo`, `/auth/redefinir-senha` (alias `/resetar-senha?token=`). Reenvio chama `forgot-password` de novo. Não usar `verify-reset-code`.

## Onde implementar no projeto

| Responsabilidade | Arquivo |
|------------------|---------|
| Login, refresh, logout, confirmar | `src/services/authService.ts` |
| Cadastro, perfil | `src/services/userService.ts` |
| Interceptor token + refresh | `src/services/api.ts` |
| Sessão persistida | `src/stores/auth.store.ts` |
| Tipos | `src/types/auth.types.ts`, `user.types.ts`, `api.types.ts` |
| Erros amigáveis | `src/composables/useApiError.ts` |
| Esqueci / redefinir senha | `src/services/recoveryService.ts`, `src/composables/useForgotPassword.ts` |
| Rotas auth | `src/constants/routes.ts`, `src/router/routes/auth.routes.ts` |

## Duração dos tokens (padrão API)

| Token | Config | Padrão |
|-------|--------|--------|
| Access (`data.token`) | `Auth:SessionMinutes` | 15 min |
| Refresh (`data.refreshToken`) | `Auth:RefreshTokenDays` | 7 dias |

## Bloqueio por tentativas de login

Após **5** senhas erradas (`Auth:MaxLoginAttempts`), conta bloqueada por **15 minutos** (`Auth:LockoutMinutes`).

Código: `403 USER_BLOCKED`.

## Valores de `usuario.role`

| Valor | Significado |
|-------|-------------|
| `1` | Cliente |
| `2` | DonoEstabelecimento |
| `3` | ProfissionalAutonomo |
| `4` | ProfissionalEstabelecimento |
| `5` | Admin |

Cadastro público sempre retorna `role: 1` após login.

## Checklist de integração

- [ ] Cadastro → redirect confirmação (não tentar login antes)
- [ ] Confirmar e-mail: código 6 dígitos e/ou `?token=` na URL
- [ ] Reenviar confirmação (mensagem genérica sempre)
- [ ] Login → persistir tokens
- [ ] Interceptor `x-glow-token`
- [ ] Refresh automático antes de expirar
- [ ] Tratar `EMAIL_NAO_CONFIRMADO`, `USER_BLOCKED`, `INVALID_CREDENTIALS`
- [ ] Esqueci/redefinir: token XOR codigo; tratar `RESET_SENHA_INVALIDO`

## O que NÃO fazer

- Chamar API direto nas views
- Assumir que todas as rotas usam envelope `{ success }` (cadastro e `/usuario/me` são exceções)
- Usar `verify-reset-code` ou `resend-reset-code` — não existem; reenvio é `forgot-password`
- Usar `Authorization: Bearer` — a API usa `x-glow-token`
- Logar token, refreshToken ou senha no console

## Referências bundled

- `references/endpoints.md` — payloads, responses e rotas auxiliares
- `references/error-codes.md` — códigos de erro → ação UI
- `references/types.ts` — tipos TypeScript para copiar em `src/types/`

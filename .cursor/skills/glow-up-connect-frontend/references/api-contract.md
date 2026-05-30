# Contrato API — glow-up-connect-api

Backend: ASP.NET Core 8 em `http://localhost:5127` (dev).

## Base URL

| Ambiente | `VITE_API_BASE_URL` |
|----------|---------------------|
| Dev (proxy Vite) | `/api` |
| Prod/staging | `https://sua-api.com/api` ou URL completa sem duplicar `/api` no path |

Rotas da API já incluem o prefixo `/api/`. O Axios usa `baseURL` + path relativo (ex.: `/auth/login` → `/api/auth/login`).

## Autenticação

Header: **`x-glow-token`** (configurável via `VITE_TOKEN_HEADER` e `Auth:TokenHeaderName` na API).

Não é JWT — token customizado HMAC-SHA256.

## Envelope de resposta

### Sucesso (maioria das rotas auth)

```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": { }
}
```

### Erro

```json
{
  "success": false,
  "message": "Email ou senha inválidos",
  "code": "INVALID_CREDENTIALS",
  "details": null
}
```

### Exceções sem envelope

| Rota | Formato |
|------|---------|
| `POST /api/usuario` | Body direto `201` |
| `GET /api/usuario/me` | DTO direto `200` |
| `GET /api/usuario/me/estabelecimentos` | Array direto `200` |
| `PUT /api/usuario/me` | `204 No Content` |

## Endpoints de autenticação

### POST `/api/auth/login`

**Request:** `{ "email": "...", "senha": "..." }`

**Response 200:**

```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "token": "...",
    "refreshToken": "...",
    "expiresAt": "2026-05-30T12:00:00Z",
    "refreshExpiresAt": "2026-05-37T12:00:00Z",
    "usuario": {
      "id": 1,
      "nome": "Maria Silva",
      "email": "user@email.com",
      "role": "Cliente",
      "avatarBase64": null
    }
  }
}
```

**Erros:** `401 INVALID_CREDENTIALS`, `403 EMAIL_NAO_CONFIRMADO`, `403 USER_BLOCKED`

### POST `/api/auth/refresh`

**Request:** `{ "refreshToken": "..." }`

**Response 200:** `{ "success": true, "data": { "token", "refreshToken", "expiresAt", "refreshExpiresAt" } }`

### POST `/api/auth/logout`

**Header:** `x-glow-token`

**Response 200:** `{ "success": true, "message": "Logout realizado com sucesso" }`

### GET `/api/usuario/me`

**Header:** `x-glow-token`

**Response 200 (DTO direto):**

```json
{
  "id": 1,
  "nome": "Maria Silva",
  "email": "user@email.com",
  "telefone": "11999999999",
  "role": "Cliente",
  "ativo": true,
  "avatarBase64": null,
  "createdAt": "...",
  "updatedAt": null
}
```

### POST `/api/usuario` (cadastro)

**Request:**

```json
{
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "telefone": "11999999999",
  "senha": "Senha123!"
}
```

**Response 201 (body direto):**

```json
{
  "id": 1,
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "telefone": "11999999999",
  "ativo": false,
  "mensagem": "Cadastro realizado. Confirme seu e-mail..."
}
```

### POST `/api/auth/confirmar-email`

**Request:** `{ "codigo": "482913" }` ou `{ "token": "..." }`

### POST `/api/auth/reenviar-confirmacao`

**Request:** `{ "email": "maria@email.com" }`

## Códigos de erro

| code | HTTP | Mensagem frontend |
|------|------|-------------------|
| INVALID_CREDENTIALS | 401 | Email ou senha inválidos |
| TOKEN_EXPIRED | 401 | Sessão expirada |
| EMAIL_NAO_CONFIRMADO | 403 | Confirme seu e-mail |
| USER_BLOCKED | 403 | Conta bloqueada |
| EMAIL_JA_CADASTRADO | 409 | E-mail já cadastrado |

## Comportamento do frontend

| Status | Ação |
|--------|------|
| 401 (token expirado) | Refresh automático → retry ou logout |
| 401 (login) | Exibir erro no formulário |
| 403 | Toast/mensagem de permissão |
| 422 | Erros de validação nos campos |

# Códigos de erro — Auth & Cadastro

A API usa dois formatos de erro principais.

## Envelope padrão (auth)

```json
{
  "success": false,
  "message": "Descricao legivel",
  "code": "CODIGO_ERRO",
  "details": null
}
```

## Validação ASP.NET (400 — cadastro e campos inválidos)

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Senha": ["Senha deve conter: letra maiuscula, minuscula, numero e caractere especial"]
  }
}
```

Exibir erros por campo a partir de `errors`.

---

## Mapa completo

| HTTP | `code` | Quando | Ação sugerida no UI |
|------|--------|--------|---------------------|
| 401 | `INVALID_CREDENTIALS` | E-mail ou senha incorretos no login | Erro genérico no formulário |
| 401 | `TOKEN_EXPIRED` | Token de sessão expirado | Tentar refresh → retry ou logout |
| 403 | `EMAIL_NAO_CONFIRMADO` | Login antes de confirmar e-mail | Redirecionar para confirmação |
| 403 | `USER_BLOCKED` | 5 tentativas erradas de login | Informar bloqueio (~15 min) |
| 403 | `USER_INACTIVE` | Conta desativada | Mensagem + suporte |
| 409 | `EMAIL_JA_CADASTRADO` | E-mail já existe no cadastro | "E-mail já cadastrado" + link login |
| 400 | `CONFIRMACAO_EMAIL_INVALIDA` | Token/código inválido, expirado, ou enviou ambos/nenhum | Erro na tela de confirmação |
| 400 | `AVATAR_INVALIDO` | Avatar base64 inválido ou fora do limite | Mensagem sobre formato/tamanho |
| 400 | `RESET_SENHA_INVALIDO` | Token de reset expirado ou inválido *(futuro)* | Solicitar novo link |
| 501 | `NOT_IMPLEMENTED` | Forgot/reset password ainda não implementado | Fallback mock ou aviso "em breve" |
| 400 | — | Validação de modelo (campo ausente/regra) | Exibir `errors` por campo |

---

## Por fluxo

### Cadastro (`POST /api/usuario`)

| Situação | HTTP | Tratamento |
|----------|------|------------|
| Sucesso | 201 | Redirect confirmação |
| E-mail duplicado | 409 `EMAIL_JA_CADASTRADO` | Sugerir login |
| Avatar inválido | 400 `AVATAR_INVALIDO` | Erro no upload |
| Campos inválidos | 400 validation | Erros por campo |

### Confirmar e-mail

| Situação | HTTP | Tratamento |
|----------|------|------------|
| Sucesso | 200 | Redirect login ou mensagem de sucesso |
| Código/token inválido | 400 `CONFIRMACAO_EMAIL_INVALIDA` | Limpar OTP / pedir novo código |

### Login

| Situação | HTTP | Tratamento |
|----------|------|------------|
| Sucesso | 200 | Persistir tokens → dashboard |
| Credenciais inválidas | 401 `INVALID_CREDENTIALS` | Erro no form |
| E-mail não confirmado | 403 `EMAIL_NAO_CONFIRMADO` | Redirect confirmação |
| Conta bloqueada | 403 `USER_BLOCKED` | Aviso temporário |
| Conta inativa | 403 `USER_INACTIVE` | Mensagem permanente |

### Esqueci senha (futuro)

| Situação | HTTP | Tratamento |
|----------|------|------------|
| E-mail enviado (genérico) | 200 | Mensagem neutra (não revela existência) |
| Token inválido/expirado | 400 `RESET_SENHA_INVALIDO` | Link para solicitar novo |
| Não implementado | 501 `NOT_IMPLEMENTED` | Usar mock ou desabilitar submit |

---

## Comportamento do interceptor HTTP

| Status | Contexto | Ação |
|--------|----------|------|
| 401 | Request autenticado + `TOKEN_EXPIRED` | Refresh automático → retry ou logout |
| 401 | Formulário de login | Exibir erro (não fazer refresh) |
| 403 | Qualquer | Toast/mensagem conforme `code` |
| 400 | Formulário | Erros de campo ou alerta |
| 409 | Cadastro | Mensagem específica |
| 501 | Forgot/reset | Fallback gracioso |

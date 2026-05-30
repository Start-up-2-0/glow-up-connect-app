# glow-up-connect-app

Frontend Vue 3 do **Glow Up Connect** — plataforma SaaS administrativa integrada à API [`glow-up-connect-api`](https://github.com).

## Stack

- Vue 3 + TypeScript + Vite
- Tailwind CSS + Flowbite
- Vue Router + Pinia
- Axios

## Pré-requisitos

- Node.js 20+
- API rodando em `http://localhost:5127` ([glow-up-connect-api](../glow-up-connect-api))

## Instalação

```bash
npm install
cp .env.example .env.local   # ou copie manualmente
npm run dev
```

App disponível em `http://localhost:5173`.

## Variáveis de ambiente

| Variável | Descrição | Dev |
|----------|-----------|-----|
| `VITE_API_BASE_URL` | Base URL do Axios | `/api` (proxy Vite) |
| `VITE_APP_NAME` | Nome exibido na UI | `Glow Up Connect` |
| `VITE_TOKEN_HEADER` | Header de auth | `x-glow-token` |

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Estrutura

```
src/
├── components/     # UI reutilizável (ui/, layout/, feedback/)
├── layouts/        # AuthLayout, DashboardLayout, PublicLayout
├── views/          # Páginas roteadas (auth/, dashboard/, public/)
├── router/         # Rotas e guards
├── stores/         # Pinia (auth, user, app, notifications)
├── services/       # Camada HTTP (Axios)
├── composables/    # Lógica reutilizável
├── types/          # TypeScript
├── constants/      # Rotas, erros, storage keys
└── utils/          # Helpers puros
```

## Autenticação

- Login via `POST /api/auth/login` com `{ email, senha }`
- Token enviado no header `x-glow-token`
- Refresh automático via `POST /api/auth/refresh`
- Logout via `POST /api/auth/logout`

## Proxy de desenvolvimento

O Vite encaminha `/api` e `/health` para `http://localhost:5127`, evitando CORS em dev. A API também possui CORS configurado para `localhost:5173` (preview/prod).

## Skill do Cursor

Instruções detalhadas em `.cursor/skills/glow-up-connect-frontend/SKILL.md`.

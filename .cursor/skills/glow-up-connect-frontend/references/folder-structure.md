# Estrutura de pastas — glow-up-connect-app

Referência detalhada da organização do frontend.

## Raiz do frontend

| Arquivo/Pasta | Responsabilidade |
|---------------|------------------|
| `src/main.ts` | Bootstrap da app: Pinia, Router, estilos globais, Flowbite |
| `src/App.vue` | Shell raiz; renderiza layout dinâmico conforme meta da rota |
| `src/env.d.ts` | Tipagem de variáveis `import.meta.env` |
| `.env.example` | Template de variáveis (copiar para `.env.local`) |
| `vite.config.ts` | Alias `@` → `src/`, plugins Vue |
| `tailwind.config.js` | Tema, content paths, plugin Flowbite |

## `src/assets/`

Imagens, ícones SVG, fontes e arquivos estáticos importados nos componentes.

## `src/components/`

### `ui/`

Componentes atômicos reutilizáveis sem lógica de negócio:

- `BaseButton`, `BaseInput`, `BaseSelect`, `BaseTextarea`
- `BaseModal`, `BaseCard`, `BaseTable`, `BaseBadge`

Regra: aceitam props de apresentação (variant, size, disabled); não conhecem stores nem API.

### `layout/`

Peças do shell administrativo:

- `AppSidebar` — menu lateral com navegação
- `AppNavbar` — barra superior
- `AppUserMenu` — dropdown do usuário (perfil, logout)
- `AppNotifications` — sino + lista de notificações

### `form/`

Formulários compostos reutilizáveis (ex.: `LoginForm`, `ProfileForm`). Encapsulam validação e emitem eventos; delegam submit ao composable ou store.

### `feedback/`

Estados de interface:

- `LoadingSpinner` — indicador de carregamento
- `EmptyState` — lista vazia / sem resultados
- `BaseAlert` — mensagens de sucesso, erro, aviso

## `src/layouts/`

Wrappers de página que definem estrutura visual:

| Layout | Uso |
|--------|-----|
| `AuthLayout.vue` | Login, registro, recuperação de senha |
| `DashboardLayout.vue` | Área autenticada com sidebar + navbar |
| `PublicLayout.vue` | Landing e páginas públicas |

Cada layout contém `<router-view />` (ou slot) para a view filha.

## `src/views/`

Páginas roteadas — apenas orquestração:

### `auth/`

- `LoginView.vue`, `RegisterView.vue`, `ForgotPasswordView.vue`

### `dashboard/`

- `DashboardHomeView.vue` — home do painel
- `<modulo>/` — uma pasta por feature de negócio

### `public/`

- `LandingView.vue`, páginas institucionais

Regra: views não fazem `axios.get()` direto; usam store ou composable.

## `src/router/`

| Arquivo | Responsabilidade |
|---------|------------------|
| `index.ts` | Cria router, registra guards, exporta instância |
| `routes/public.routes.ts` | Rotas sem auth |
| `routes/auth.routes.ts` | Rotas guest-only |
| `routes/dashboard.routes.ts` | Rotas protegidas (lazy) |
| `guards/auth.guard.ts` | Verifica token/sessão antes de navegar |

## `src/stores/`

Estado global Pinia:

| Store | Escopo |
|-------|--------|
| `auth.store.ts` | Token, login, logout, hydrate |
| `user.store.ts` | Perfil do usuário autenticado |
| `app.store.ts` | UI global (sidebar, tema) |
| `notifications.store.ts` | Toasts e notificações in-app |

## `src/services/`

Camada HTTP — única porta de saída para a API:

| Arquivo | Escopo |
|---------|--------|
| `api.ts` | Instância Axios, interceptors, baseURL |
| `authService.ts` | Endpoints de autenticação |
| `userService.ts` | Endpoints de usuário |
| `index.ts` | Re-export barrel |

## `src/composables/`

Lógica reutilizável entre views:

| Composable | Escopo |
|------------|--------|
| `useAuth.ts` | Atalho para auth store + redirect helpers |
| `useApiError.ts` | Normaliza erros Axios em mensagens amigáveis |
| `useFetchOnce.ts` | Evita refetch desnecessário |

## `src/types/`

Interfaces e types TypeScript compartilhados. Um arquivo por domínio (`auth.types.ts`, `user.types.ts`, `api.types.ts`).

## `src/utils/`

Funções puras sem estado:

- `storage.ts` — get/set/remove token com abstração sobre localStorage
- `formatters.ts` — datas, moeda, etc.

## `src/constants/`

Valores fixos:

- `routes.ts` — nomes de rotas (evita strings mágicas)
- `storageKeys.ts` — chaves de persistência

## Convenção para novos módulos

Ao adicionar um módulo (ex.: `appointments`):

```
src/views/dashboard/appointments/AppointmentsListView.vue
src/services/appointmentsService.ts
src/types/appointments.types.ts
src/router/routes/dashboard.routes.ts  ← adicionar rota lazy
```

Componentes específicos do módulo ficam em `src/components/` só se forem reutilizados em 2+ views.

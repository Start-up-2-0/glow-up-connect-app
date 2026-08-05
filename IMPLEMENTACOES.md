# Implementações — Glow Up Connect

Documento consolidado das funcionalidades, refatorações e melhorias realizadas em **glow-up-connect-app** (frontend) e **glow-up-connect-api** (backend).

---

## 1. Modo mockado (frontend — sem depender da API)

Permite rodar o app 100% offline com dados fictícios, para validar/corrigir telas.

- **Ativação**: `npm run dev:mock` → `.env.mock` (`VITE_USE_MOCKS=true`) + script no `package.json`.
- **Infra** em `src/mocks/`: `config.ts` (flag), `response.ts` (helpers `ok`/`okRaw`/`voidOk`), `match.ts` (roteador `method+path` com `:params`), `index.ts` (adapter axios que intercepta e devolve dados fictícios; loga `[mock] SEM HANDLER`).
- **Seeds** em `src/mocks/seed/`: usuário/estabelecimentos, catálogo (serviços, equipe, clientes, horários), financeiro (metas, comissões, movimentos, contas, caixa, dashboard), agenda/avaliações, plataforma (planos, perfil, assinatura, rede, auditoria).
- **Handlers** por domínio em `src/mocks/handlers/` (core, financeiro, catálogo, agenda, público).
- **Integração**: `api.ts` (interceptor define o adapter) e `main.ts` (desativa request-proof no mock).

## 2. Comissões por Metas — refatoração da tela (frontend)

A tela de Metas deixou de ser um mini-dashboard e virou um gerenciador de metas por profissional.

- **Tipos** (`src/types/negocio/caixa.types.ts`): `MetaComissaoProfissional`, `MetaComissaoDetalhe`, `MetaComissaoEvolucaoItem`, `MetaComissaoNotificacoes`, `ComissaoMetasFiltro`.
- **Service** (`caixaService.ts`): `listarMetasComissao`, `obterMetaComissaoDetalhe`, `reativarMeta`, `concluirMeta`.
- **Views/Components**: `MetasView.vue` reescrito (filtro de mês, lista por profissional, status Em andamento/Concluída/Cancelada) + `MetaComissaoDetalheModal.vue` (progresso, restante, comissão, responsável, evolução e automação de conclusão).
- **Automação**: botão "Concluir meta" dispara `POST /financeiro/metas/:id/concluir` e preenche `notificacoes` (e-mail, WhatsApp, loja, log de auditoria) — uma única vez.
- **Mock**: seeds + handlers das rotas novas.

## 3. Sidebar Premium (frontend)

Redesign completo da sidebar para visual SaaS premium.

- **Dependência**: `lucide-vue-next`.
- **Componentes** em `src/components/sidebar/`: `Sidebar`, `SidebarHeader`, `SidebarWorkspace`, `SidebarGroup`, `SidebarItem`, `SidebarSubmenu`, `SidebarFooter`, `SidebarThemeCard`, `SidebarTooltip`, `sidebarIcons.ts`, `useSidebarNav.ts`.
- **Estado** (`app.store`): `openSubmenuKeys` (preserva submenus ao recolher) + persistência de `sidebarCollapsed` em `localStorage`.
- **Integração**: `DashboardLayout.vue` usa a nova `Sidebar` (desktop + drawer mobile).
- Refinamento dos itens (altura 48–56px, ícones em container, hover/ativo com gradiente+glow, badges, submenus com animação).

## 4. Redesign dos Dashboards (frontend)

- **Home do Cliente** (`DashboardClienteView.vue`): hero com saudação + CTA, card de próximo agendamento (ou empty state), stats, progresso de perfil com checklist, ações rápidas, recomendados (carrossel), histórico, favoritos e banner-CTA. Componentes em `src/components/dashboard/cliente/` (`DashboardHero`, `NextAppointmentCard`, `StatsGrid`, `StatCard`, `ProfileCompletion`, `QuickActions`, `RecommendationsCarousel`, `FavoriteProfessionals`, `HistoryTimeline`, `PromotionBanner`, `EmptyState`).
- **Dashboard do Profissional** (`DashboardProfissionalView.vue`): hero de saudação, stats, ações rápidas, card de link e listas de atendimentos/avaliações.
- **Dashboard da Loja** (`DashboardNegocioView.vue`): hero com greeting + eyebrow (plano · role), mantendo KPIs, gráficos, insights, equipe e prévia da agenda.
- **Mock**: status de agendamentos ajustados (Confirmado/Concluído) para os cenários renderizarem.

## 5. Regras de acesso por perfil e plano (frontend mock + backend)

- **Mock** (`src/mocks/seed/usuario.ts`): perfis por e-mail (Dono Premium/Plus/Básico, Administrador, Recepcionista, Profissional, Cliente) com escopo de filiais por plano (Básico/Plus = principal; Premium = todas) e não-dono = própria filial.
- **Admin** (`admin@teste.com`): `PERMS_ADMIN` = matriz Owner na loja (agenda, clientes, serviços, caixa, equipe, horários, config). Escopo: Studio Glow Up.
- **Recepcionista** (`recepcionista@teste.com`): `PERMS_RECEPCIONISTA` alinhada à API — agenda geral + clientes + atendimento; **sem** caixa, equipe, edição de negócio/horários. Escopo: Studio Glow Up.
- **AuthZ central no mock** (`src/mocks/index.ts`): 403 para `/estabelecimentos/{id}/...` fora do escopo do perfil logado.
- **Backend** (`glow-up-connect-api`): `MatrizPermissaoNegocioService` é a fonte da verdade; `ListarEstabelecimentosAsync` limita o Dono ao plano.

## 6. Loading Global Premium (frontend)

Sistema de loading global e independente (não altera layout/sidebar/páginas).

- **Store** (`src/stores/loading.store.ts`): contador de operações, navegação, `manual`, debounce (evita flash), timeout de segurança, mensagem, progresso e modos (`fullscreen`/`modal`/`inline`).
- **Composable** (`src/composables/useLoading.ts`): `open/close/setMessage/setProgress/start/finish`.
- **Componentes** em `src/components/loading/`: `GlobalLoader`, `LoaderAnimation` (anel em gradiente + logo respirando + partículas), `LoaderOverlay` (backdrop blur translúcido, sem fundo preto).
- **Integração**: `App.vue` monta o loader; `router/index.ts` (`beforeEach`/`afterEach`/`onError`); `api.ts` (interceptors com contagem de concorrência, excluindo `/auth/refresh` e `/security/request-proof`).
- **Acessibilidade**: `role="status"`, `aria-busy` e `prefers-reduced-motion`.

## 7. Categoria de Estabelecimento + Sexo do Usuário + Explorar com filtro

- **Frontend**: tipos (`EstabelecimentoCategoria`, `categoria`/`sexo`), mock (catálogo + campos), onboarding (categoria obrigatória + sexo), register/perfil (sexo), perfil da loja (categoria), **Explorar Lojas** com filtro por categoria + persistência em `localStorage`.
- **Backend** (`glow-up-connect-api`): entidades `CategoriaEstabelecimento` + `Estabelecimento.CategoriaEstabelecimentoId` e enum `Sexo` + `Usuario.Sexo`; migration `AddCategoriaEstabelecimentoESexo` (com seed Barbearia/Salão de Beleza); DTOs/validações/services/response DTOs; repos com `.Include(CategoriaEstabelecimento)`; endpoint `GET /publico/estabelecimentos/categorias` e filtro `categoriaId` no `listarProximos`. *Relatórios/segmentação ficam para o super admin (fora do escopo atual).*

## 8. Refatoração da navegação + Banner Premium (frontend)

- **Dropdown "Minha Conta" eliminado**: itens "Meu perfil" e "Abrir minha loja" movidos para a sidebar (sempre visíveis, respeitando permissões).
- **Sidebar reorganizada** em grupos: **Principal** (Dashboard, Agenda, Clientes, Serviços, Profissionais), **Financeiro** (Visão geral, Comissões, Planos e assinatura, Faturas), **Configurações** (Dados da loja, Equipe, Horários, WhatsApp, Auditoria, Privacidade, Meu perfil).
- **Banner Premium inteligente** (`SidebarPremiumBanner.vue`): usuário free/não-Premium → CTA de upgrade (gradiente + glow); usuário Premium → card de status (plano, status, próxima renovação, "Gerenciar assinatura").
- **Rodapé** simplificado (menu do usuário só com "Sair").
- **Busca da sidebar removida** e **badges config-driven** (campo `badge` em `NavItem`).

## 9. Shell de navegação Flowbite free (todos os perfis)

Reformulação do chrome (sidebar + top navbar + drawer mobile) no padrão Flowbite open-source, sem Pro, com tokens `glow-*`.

- **Layout** (`DashboardLayout.vue`): application shell — sidebar desktop + coluna com topbar e `main`; drawer off-canvas no mobile (overlay + slide).
- **Componentes** em `src/components/shell/`:
  - `AppShellSidebar` — aside com logo, workspace (quando há vínculo), grupos de nav, CTA Premium e user card.
  - `AppShellTopbar` — adaptativo: **Cliente** = saudação contextual; **Loja/Profissional** = busca (modal + ⌘/Ctrl+K), seletor de estabelecimento, tema, notificações e `AppUserMenu`.
  - `ShellUserCard` — avatar + nome/e-mail + sair.
- **Visual sidebar** alinhado ao Flowbite free: labels uppercase, item ativo com barra lateral + fundo suave, submenus accordion, CTA Premium restilizado.
- **Lógica intacta**: `navigation.ts` + `useDashboardNav` + `filterNavItems` + `app.store` (collapse, drawer, submenus).
- **Perfis cobertos**: Cliente puro, negócio (dono/admin/recepção) e profissional operacional.

## 10. Navegação SaaS premium (sidebar + navbar)

Redesign completo para sensação Linear/Notion/Stripe — hierarquia clara, sidebar como navegação principal, navbar complementar.

- **Grupos de menu** (`navigation.ts`):
  - **Negócio:** Gestão · Financeiro · Configurações (sem misturar itens de cliente).
  - **Cliente:** Agendar e explorar · Conta.
  - **Profissional:** Trabalho (+ conta cliente filtrada).
- **Sidebar 280px** aberta por padrão: `ShellBrandHeader` (logo, marca, loja, pill Free/Premium), grupos com separadores, item ativo com rail + fundo + borda suave, badges Novo/Beta.
- **Banner Premium** (`ShellPremiumBanner`): gradiente, benefícios, CTA; ou card de status se já Premium.
- **Navbar** (`AppShellTopbar`): breadcrumb + título + descrição contextual (`pageChrome.ts` / `usePageChrome`), busca global estilo command palette (Ctrl+K), ajuda, notificações, `ShellUserMenu` (perfil, configs, assinatura, tema, ajuda, sair).
- **Perfil** saiu do rodapé da sidebar e ficou no canto superior direito.

## 11. Refino sidebar + navbar (hierarquia premium)

- **Navbar**: apenas a logo (sem texto "Glow Up Connect"); removido o menu Apps (grid) por redundância com a sidebar.
- **Sidebar footer fixo**: banner Premium → item Tema (claro/escuro, persistido) → item Sair (`useAuth().logout()`).
- **Tipografia**: itens `13px` / `font-normal`, ícones `size-4`, labels de grupo menores e mais discretos (estilo Linear/Notion).
- **Componentes**: `ShellSidebarFooter.vue`; ajustes em `AppShellSidebar`, `AppShellTopbar`, `SidebarItem`, `SidebarGroup`, `SidebarSubmenu`, `ShellPremiumBanner`.

## 12. Tema escuro + navegação (identidade premium)

- **Paleta dark**: identidade original preto/cinza com accent **dourado** (`#e6ad01` / `#ffbf00`), superfícies `#0a0806` → `#1a1612` → `#2c2620`.
- **Shell** usa tokens `glow-*` (sidebar, navbar, itens, notificações, dropdowns).
- **Footer da sidebar**: Premium → tema → Sair (sem card de perfil redundante).
- **Logo** na navbar: wordmark completo, com troca light/dark.

## 13. Dashboard inteligente do cliente

Painel executivo de relacionamento (`DashboardClienteView`), sem atalhos redundantes da sidebar:

- Indicadores: gasto no mês, atendimentos no mês, visitas acumuladas, frequência média.
- Próximo compromisso em destaque (ou empty state elegante).
- Bloco “Seu relacionamento”: loja/profissional/serviço preferidos, última visita, tempo como cliente, totais.
- Histórico recente compacto (até 6 eventos).
- Removidos: ações rápidas, completar perfil, favoritos genéricos, recomendações e banner promo.
- Dados: `derivarRelacionamento` em `dashboardClienteUtils` + `useDashboardClienteData`.

## 14. Dashboards unificados (negócio + profissional)

Mesmo formato visual da home do cliente aplicado a **Dono/Admin/Recepcionista** (`DashboardNegocioView`) e **Profissional** (`DashboardProfissionalView`):

- Header slim (`ClienteDashHeader`) + chip contextual.
- Faixa de **Indicadores** (`StatsGrid`) — 4 KPIs.
- Duas colunas: card em destaque + insights operacionais/de desempenho.
- Rodapé em duas colunas: equipe/histórico (negócio) ou atendimentos/avaliações (profissional).
- Largura fluida (`w-full`), sem `max-w` centralizado; sem ações rápidas redundantes da sidebar.
- Componentes: `src/components/dashboard/negocio/*` e `src/components/dashboard/profissional/*`.
- Recepcionista sem financeiro vê KPIs operacionais no lugar da receita.

## 15. Tela de Assinatura (redesign comercial)

Reconstrução completa de `AssinaturaView` com layout SaaS premium (`src/components/assinatura/page/*`):

- Header + hero do plano atual (status, datas do ciclo).
- Grid **Detalhes do plano** + **Benefícios**.
- Comparativo de planos escaneável + CTA de upgrade em destaque.
- Banner de segurança/confiança (Mercado Pago, cancelamento no ciclo).
- Tokens `glow-*`, tipografia Urbanist, animações sutis de entrada.
- Mock Premium alinhado (`MOCK_ASSINATURA.planoId = 3`).

## 16. Tela de Faturas (redesign)

Reconstrução de `FaturasView` alinhada à Assinatura (`src/components/assinatura/faturas/*`):

- Header + exportação CSV.
- KPIs: total pago, faturas pagas, próximo vencimento, valor do plano.
- Tabela de histórico com ações (detalhe / copiar ID) e paginação.
- Banner de suporte.

## 17. Tela de Comissões (redesign)

Reconstrução visual de `ComissoesView` (`src/components/financeiro/comissoes/*`):

- Header + KPIs (metas ativas, profissionais, fechamento, total estimado).
- Abas Acompanhamento / Metas / Regras com ícones.
- Cards de progresso por profissional, tip dismissível, export CSV.
- Mantém modais e fluxos existentes de metas/regras.

## 19. Tela de Planos (onboarding)

Redesign de `/onboarding/planos` (`PlanosView` + `src/components/assinatura/planos/*`):

- Header limpo, banner de promoção único e cards Básico / Plus / Premium.
- Recursos incrementais (“Tudo do X +”) e labels humanizadas.
- CTA em hierarquia (Plus em destaque) e barra de confiança.
- Removidos: tabela comparativa densa e listas cruas de módulos.

---

## Resumo de arquivos (referência)

- **Frontend** (`glow-up-connect-app`): `src/mocks/*`, `src/components/shell/*`, `src/components/sidebar/*`, `src/components/loading/*`, `src/components/dashboard/*`, `src/components/assinatura/page/*`, `src/components/assinatura/faturas/*`, `src/components/financeiro/comissoes/*`, `src/components/financeiro/dashboard/*`, `src/views/dashboard/*`, `src/views/configuracoes/assinatura/*`, `src/views/modulos/financeiro/*`, `src/layouts/DashboardLayout.vue`, `src/constants/{navigation,pageChrome}.ts`, `src/stores/{app,loading}.store.ts`, `src/composables/{useLoading,useDashboardNav,usePageChrome}.ts`, `src/types/*`, `src/services/*`.
- **Backend** (`glow-up-connect-api`): `src/GLOWAPI.Domain/Entities/{Estabelecimento,Usuario,CategoriaEstabelecimento}.cs`, `src/GLOWAPI.Domain/Enums/Sexo.cs`, `src/GLOWAPI.Infrastructure/Configurations/*`, `src/GLOWAPI.Infrastructure/Migrations/*`, `src/GLOWAPI.Application/DTOs/*`, `src/GLOWAPI.Application/Services/*`, `src/GLOWAPI.Application/Interfaces/*`, `src/GLOWAPI.Infrastructure/Repositories/*`, `src/GLOWAPI.API/Controllers/*`.

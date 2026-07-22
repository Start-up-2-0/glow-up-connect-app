/** Design tokens semânticos — Glow Up Connect (identidade roxa/lilás) */
export const GLOW_COLORS = {
  /** Paleta oficial */
  purpleBlack: '#0d0825',
  lilacWhite: '#ebe7f7',
  purpleDark: '#2c154b',
  grayPurple: '#61526b',
  purpleMedium: '#522e5f',
  lilacMedium: '#92679b',
  grayLilac: '#9e94aa',
  purpleLight: '#755e8a',
  lilacLight: '#cfb0da',
  lavender: '#b4a5ca',
  burntRose: '#995d5f',
  wineBrown: '#4e2c30',

  /** Marca / accent (aliases legados glow-gold → lilás) */
  gold: '#cfb0da',
  goldDark: '#92679b',
  goldCta: '#92679b',
  primary: '#5b7fd4',
  secondary: '#995d5f',

  /** Light theme */
  text: '#0d0825',
  textMuted: '#61526b',
  textSoft: '#3d2a5c',
  surface: '#f3f0f8',
  elevated: '#faf9fd',
  base: '#ebe7f7',

  /** Dark theme */
  darkBase: '#0d0825',
  darkSurface: '#2c154b',
  darkElevated: '#522e5f',
  darkHighlight: '#755e8a',
  darkText: '#ebe7f7',

  /** Status */
  success: '#4a9e6e',
  successBg: 'rgba(74, 158, 110, 0.14)',
  successAction: '#4bc281',
  error: '#995d5f',
  neutral: '#61526b',
  warning: '#995d5f',

  gradientFrom: 'rgba(146, 103, 155, 0.2)',
  gradientTo: 'rgba(82, 46, 95, 0.2)',
} as const

/** Posicionamento da imagem de splash conforme Figma (ImgBackground) */
export const GLOW_SPLASH_IMAGE_CLASS =
  'absolute top-0 left-[-47.86%] h-full w-[202.63%] max-w-none'

/** Largura do painel esquerdo no layout 1920px (955px) */
export const GLOW_SPLASH_PANEL_CLASS =
  'relative hidden min-h-screen shrink-0 overflow-hidden lg:block lg:w-[955px] lg:max-w-[50%]'

export const GLOW_INPUT_CLASS =
  'h-[49px] w-full rounded-lg border-[0.3px] border-glow-border-soft bg-glow-bg-elevated px-4 font-satoshi text-glow-text placeholder:font-inter placeholder:text-sm placeholder:font-normal placeholder:text-glow-placeholder outline-none transition focus:border-glow-gold focus:ring-1 focus:ring-glow-gold'

export const GLOW_LABEL_CLASS = 'font-satoshi text-sm font-normal text-glow-text'

export const GLOW_PLACEHOLDER_TEXT_CLASS = 'font-inter text-sm font-normal text-glow-placeholder'

export const GLOW_LINK_ACCENT_CLASS =
  'font-satoshi text-sm font-bold text-glow-gold-dark hover:underline'

export const GLOW_BODY_TEXT_CLASS = 'font-satoshi text-sm font-normal text-glow-text'

/** Fundo lavanda fixo — telas de auth não seguem o tema dark do app */
export const GLOW_LOGIN_PAGE_CLASS =
  'flex min-h-screen items-center justify-center bg-glow-bg-base px-6 py-10'

export const GLOW_LOGIN_CONTENT_CLASS = 'flex w-full max-w-[494px] flex-col items-center'

/** Grid 2 colunas do formulário de cadastro (Figma telaCadastro) */
export const GLOW_AUTH_FORM_GRID_CLASS = 'grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-x-2'

export const GLOW_AUTH_PANEL_CLASS =
  'relative z-10 flex min-h-screen w-full flex-1 items-center justify-center bg-glow-bg-elevated px-6 py-10 lg:-ml-[54px] lg:rounded-l-panel lg:px-16'

export const GLOW_AUTH_PANEL_BORDERED_CLASS =
  'relative z-10 flex min-h-screen w-full flex-1 items-center justify-center border-glow-border-soft bg-glow-bg-elevated px-6 py-10 lg:-ml-[54px] lg:rounded-l-panel lg:border lg:px-16'

export const GLOW_AVATAR_DROPZONE_CLASS =
  'flex h-[49px] w-full cursor-pointer items-center rounded-lg border border-dashed border-glow-border-soft transition hover:border-glow-gold'

export const GLOW_BUTTON_PRIMARY_CLASS =
  'flex h-[53px] w-full items-center justify-center rounded bg-glow-gold-cta px-[10px] text-xl font-medium text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70'

export const GLOW_LINK_CLASS = 'text-sm font-bold text-glow-gold-dark hover:underline'

export const GLOW_RECOVERY_LAYOUT_CLASS =
  'flex min-h-screen flex-col items-center justify-start bg-glow-bg-base px-6 pb-10 pt-10 sm:pt-16'

export const GLOW_RECOVERY_CONTENT_CLASS = 'flex w-full max-w-[461px] shrink-0 flex-col items-stretch'

export const GLOW_RECOVERY_TITLE_CLASS =
  'text-center font-inter text-[36px] font-semibold leading-normal text-glow-text'

export const GLOW_RECOVERY_SUBTITLE_CLASS =
  'text-center font-inter text-base font-normal text-glow-text-muted'

export const GLOW_RECOVERY_LABEL_CLASS = 'font-inter text-base font-normal text-glow-text'

export const GLOW_RECOVERY_INPUT_CLASS =
  'h-[50px] w-full rounded border-[0.5px] border-glow-border-soft px-4 font-inter text-base text-glow-text placeholder:font-inter placeholder:text-sm placeholder:text-glow-placeholder outline-none transition focus:border-glow-gold focus:ring-1 focus:ring-glow-gold'

export const GLOW_RECOVERY_BTN_SECONDARY_CLASS =
  'flex h-[53px] w-full items-center justify-center rounded border-[0.5px] border-glow-border-soft bg-glow-bg-elevated font-inter text-base font-medium text-glow-text transition hover:bg-glow-hover-surface disabled:cursor-not-allowed disabled:opacity-60'

export const GLOW_RECOVERY_BTN_LOCKED_CLASS =
  'flex h-[53px] w-full items-center justify-center gap-2.5 rounded border-[0.5px] border-glow-disabled bg-glow-bg-elevated font-inter text-base font-medium text-glow-disabled cursor-not-allowed'

export const GLOW_RECOVERY_BACK_LINK_CLASS =
  'inline-flex items-center gap-2.5 py-2.5 font-inter text-xs font-normal text-glow-text-muted transition hover:text-glow-text'

export const GLOW_RECOVERY_ALERT_CLASS =
  'flex w-full items-center gap-2.5 rounded bg-glow-error-bg px-2.5 py-2.5 font-inter text-xs font-medium text-glow-error'

/** Link público de agendamento — shell fixo light (Figma Fluxo Agendamento Público) */
export const AGENDAR_WIZARD_CONTENT_CLASS = 'mx-auto w-full max-w-[695px]'

export const AGENDAR_CARD_CLASS =
  'rounded-xl border-[0.5px] border-glow-border-soft bg-glow-bg-elevated'

export const AGENDAR_BTN_OUTLINE_CLASS =
  'inline-flex h-[34px] items-center justify-center gap-2 rounded-xl border-[0.5px] border-glow-border-soft px-4 font-inter text-sm text-glow-text transition hover:bg-glow-hover-surface'

export const AGENDAR_BTN_CONTINUE_CLASS =
  'flex h-10 w-full items-center justify-center rounded bg-glow-gold-cta px-2.5 font-satoshi text-base font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-glow-neutral-bg disabled:text-glow-disabled'

export const AGENDAR_BTN_CONTINUE_MUTED_CLASS =
  'flex h-10 w-full items-center justify-center rounded bg-glow-neutral-bg px-2.5 font-satoshi text-base font-bold text-glow-disabled disabled:cursor-not-allowed'

export const AGENDAR_PRICE_PILL_CLASS =
  'inline-flex shrink-0 items-center justify-center rounded-full bg-glow-success-bg px-4 py-1 font-urbanist text-base font-bold text-glow-success-dark'

/** Card central do wizard Contratar Plano (dashboard — segue tema light/dark) */
export const ONBOARDING_CONTRATAR_PAGE_CLASS =
  '-mx-4 -mt-4 min-h-full bg-glow-canvas px-4 pb-8 pt-9 lg:-mx-6 lg:-mt-6 lg:px-8'

export const ONBOARDING_CONTRATAR_CARD_CLASS =
  'rounded-xl border-[0.5px] border-glow-border-soft bg-glow-hover-surface px-6 py-8 shadow-glow-sm sm:px-10 sm:py-10'

export const ONBOARDING_CONTRATAR_FORM_CLASS = 'flex w-full flex-col gap-6'

export const ONBOARDING_CONTRATAR_FIELD_CLASS = 'flex flex-col gap-2'

export const ONBOARDING_CONTRATAR_INPUT_CLASS =
  'h-[49px] w-full rounded-lg border-[0.3px] border-glow-border-soft bg-glow-hover-surface px-[18px] font-inter text-sm text-glow-text placeholder:font-inter placeholder:text-sm placeholder:text-glow-placeholder outline-none transition focus:border-glow-gold focus:ring-1 focus:ring-glow-gold'

export const ONBOARDING_CONTRATAR_LABEL_CLASS =
  'font-satoshi text-sm font-normal text-glow-text'

export const ONBOARDING_CONTRATAR_BTN_PRIMARY_CLASS =
  'flex h-10 w-full items-center justify-center rounded-xl bg-glow-gold-cta px-2.5 font-satoshi text-sm font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60'

export const ONBOARDING_CONTRATAR_BTN_SECONDARY_CLASS =
  'flex h-10 w-full items-center justify-center rounded-xl border-[0.5px] border-glow-border-soft bg-glow-surface px-3.5 font-satoshi text-sm font-medium text-glow-text transition hover:bg-glow-hover-surface disabled:cursor-not-allowed disabled:opacity-60'

export const ONBOARDING_CONTRATAR_DROPZONE_CLASS =
  'flex h-[49px] w-full cursor-pointer items-center rounded-lg border border-dashed border-glow-border-soft bg-glow-hover-surface transition hover:border-glow-gold'

export const ONBOARDING_CONTRATAR_DROPZONE_TEXT_CLASS =
  'font-inter text-sm text-glow-placeholder'

export const ONBOARDING_CONTRATAR_TELEFONE_PREFIX_CLASS =
  'inline-flex h-[49px] shrink-0 items-center rounded-l-lg border-[0.3px] border-r-0 border-glow-border-soft bg-glow-hover-surface px-[18px] font-inter text-sm text-glow-text-subtle'

/** Área cliente — Explorar lojas / Detalhe (Figma) */
export const CLIENTE_PAGE_HEADER_CLASS = 'cliente-page-header'

export const CLIENTE_PAGE_TITLE_CLASS =
  'font-satoshi text-2xl font-bold leading-tight text-glow-text'

export const CLIENTE_PAGE_SUBTITLE_CLASS =
  'font-satoshi text-base text-glow-text-subtle'

export const CLIENTE_PAGE_DIVIDER_CLASS = 'cliente-page-divider'

export const CLIENTE_BTN_OUTLINE_CLASS =
  'cliente-btn-outline inline-flex h-[34px] shrink-0 items-center justify-center gap-2.5 rounded-xl border-[0.5px] border-glow-border-soft bg-glow-surface px-4 font-urbanist text-sm font-normal text-glow-text transition hover:bg-glow-hover-surface disabled:cursor-not-allowed disabled:opacity-60'

export const CLIENTE_CARD_CLASS = 'cliente-card glow-card'

export const CLIENTE_BTN_CTA_CLASS =
  'cliente-btn-cta inline-flex h-10 w-full items-center justify-center gap-2.5 rounded-xl bg-glow-gold-cta px-2.5 font-satoshi text-sm font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60'

/** Wizard agendamento interno (dashboard) */
export const AGENDAR_INTERNO_CONTENT_CLASS = 'mx-auto w-full max-w-[926px]'

/** Módulo Serviços (dashboard — Figma node 696:3155) */
export const SERVICOS_PAGE_CLASS = 'servicos-page'

export const SERVICOS_FORM_INPUT_CLASS =
  'servicos-form-input'

export const SERVICOS_FORM_LABEL_CLASS =
  'servicos-form-label'

/** Módulo Equipe (dashboard — Figma node 766:3783) */
export const EQUIPE_PAGE_CLASS = 'equipe-page'

/** Módulo Financeiro (dashboard) */
export const FINANCEIRO_PAGE_CLASS = 'financeiro-page'

/** Sidebar nav — item ativo com accent premium */
export const SIDEBAR_NAV_ITEM_CLASS =
  'group flex h-11 w-full items-center gap-3 rounded-lg py-2 pl-2 pr-2 transition-colors hover:bg-glow-surface-tint'

export const SIDEBAR_NAV_ITEM_ACTIVE_CLASS =
  'bg-glow-gold-selected pl-4 font-medium text-glow-text shadow-[inset_3px_0_0_var(--glow-gold-cta)]'

/** Design tokens extraídos do Figma — Glow Up Connect */
export const GLOW_COLORS = {
  gold: '#ffbf00',
  goldDark: '#c59400',
  text: '#282828',
  textMuted: 'rgba(40, 40, 40, 0.4)',
  textSoft: 'rgba(40, 40, 40, 0.8)',
  primary: '#3c5ccf',
  secondary: '#a38a2d',
  gradientFrom: 'rgba(163, 138, 45, 0.2)',
  gradientTo: 'rgba(60, 92, 207, 0.2)',
} as const

/** Posicionamento da imagem de splash conforme Figma (ImgBackground) */
export const GLOW_SPLASH_IMAGE_CLASS =
  'absolute top-0 left-[-47.86%] h-full w-[202.63%] max-w-none'

/** Largura do painel esquerdo no layout 1920px (955px) */
export const GLOW_SPLASH_PANEL_CLASS =
  'relative hidden min-h-screen shrink-0 overflow-hidden lg:block lg:w-[955px] lg:max-w-[50%]'

export const GLOW_INPUT_CLASS =
  'h-[49px] w-full rounded-lg border-[0.3px] border-glow-text/40 px-4 font-satoshi text-zinc-800 placeholder:font-inter placeholder:text-sm placeholder:font-normal placeholder:text-zinc-600/60 outline-none transition focus:border-glow-gold focus:ring-1 focus:ring-glow-gold'

export const GLOW_LABEL_CLASS = 'font-satoshi text-sm font-normal text-zinc-800'

export const GLOW_PLACEHOLDER_TEXT_CLASS = 'font-inter text-sm font-normal text-zinc-600/60'

export const GLOW_LINK_ACCENT_CLASS = 'font-satoshi text-sm font-bold text-yellow-600 hover:underline'

export const GLOW_BODY_TEXT_CLASS = 'font-satoshi text-sm font-normal text-zinc-800'

export const GLOW_LOGIN_PAGE_CLASS =
  'flex min-h-screen items-center justify-center bg-glow-hover-surface px-6 py-10'

export const GLOW_LOGIN_CONTENT_CLASS = 'flex w-full max-w-[494px] flex-col items-center'

export const GLOW_AUTH_PANEL_CLASS =
  'relative z-10 flex min-h-screen w-full flex-1 items-center justify-center bg-white px-6 py-10 lg:-ml-[54px] lg:rounded-l-panel lg:px-16'

export const GLOW_AUTH_PANEL_BORDERED_CLASS =
  'relative z-10 flex min-h-screen w-full flex-1 items-center justify-center border-glow-text/40 bg-white px-6 py-10 lg:-ml-[54px] lg:rounded-l-panel lg:border lg:px-16'

export const GLOW_AVATAR_DROPZONE_CLASS =
  'flex h-[49px] w-full cursor-pointer items-center rounded-lg border border-dashed border-glow-text/60 transition hover:border-glow-gold'

export const GLOW_BUTTON_PRIMARY_CLASS =
  'flex h-[53px] w-full items-center justify-center rounded bg-glow-gold px-[10px] text-xl font-medium text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70'

export const GLOW_LINK_CLASS = 'text-sm font-bold text-glow-gold-dark hover:underline'

export const GLOW_RECOVERY_LAYOUT_CLASS =
  'flex min-h-screen flex-col items-center justify-start bg-white px-6 pb-10 pt-10 sm:pt-16'

export const GLOW_RECOVERY_CONTENT_CLASS = 'flex w-full max-w-[461px] shrink-0 flex-col items-stretch'

export const GLOW_RECOVERY_TITLE_CLASS =
  'text-center font-inter text-[36px] font-semibold leading-normal text-glow-text'

export const GLOW_RECOVERY_SUBTITLE_CLASS =
  'text-center font-inter text-base font-normal text-glow-text-muted'

export const GLOW_RECOVERY_LABEL_CLASS = 'font-inter text-base font-normal text-glow-text'

export const GLOW_RECOVERY_INPUT_CLASS =
  'h-[50px] w-full rounded border-[0.5px] border-glow-text/40 px-4 font-inter text-base text-glow-text placeholder:font-inter placeholder:text-sm placeholder:text-zinc-600/60 outline-none transition focus:border-glow-gold focus:ring-1 focus:ring-glow-gold'

export const GLOW_RECOVERY_BTN_SECONDARY_CLASS =
  'flex h-[53px] w-full items-center justify-center rounded border-[0.5px] border-glow-text/60 bg-white font-inter text-base font-medium text-glow-text transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60'

export const GLOW_RECOVERY_BTN_LOCKED_CLASS =
  'flex h-[53px] w-full items-center justify-center gap-2.5 rounded border-[0.5px] border-[#a3a3a3] bg-white font-inter text-base font-medium text-[#a3a3a3] cursor-not-allowed'

export const GLOW_RECOVERY_BACK_LINK_CLASS =
  'inline-flex items-center gap-2.5 py-2.5 font-inter text-xs font-normal text-glow-text/60 transition hover:text-glow-text'

export const GLOW_RECOVERY_ALERT_CLASS =
  'flex w-full items-center gap-2.5 rounded bg-[rgba(207,63,63,0.1)] px-2.5 py-2.5 font-inter text-xs font-medium text-[#cf3f3f]'

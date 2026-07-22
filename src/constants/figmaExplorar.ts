/**
 * Tokens extraídos do Figma MCP — nó 637:1555 (Explorar lojas)
 * Fonte: Aw8s774w1D9yQjD2aBHQM4
 */
import { GLOW_COLORS } from './designTokens'

export const FIGMA_EXPLORAR = {
  title: {
    fontFamily: 'Satoshi',
    fontSize: '24px',
    fontWeight: 700,
    color: GLOW_COLORS.text,
    lineHeight: '32px',
  },
  subtitle: {
    fontFamily: 'Satoshi',
    fontSize: '16px',
    fontWeight: 400,
    color: 'rgba(40, 40, 40, 0.5)',
    lineHeight: '22px',
  },
  intro: {
    titleToSubtitleGap: '6px',
    subtitleToDividerGap: '34px',
  },
  divider: {
    borderWidth: '0.5px',
    color: 'rgba(40, 40, 40, 0.25)',
  },
  toolbar: {
    dividerToButtonGap: '38px',
    buttonToGridGap: '38px',
  },
  btnLocalizacao: {
    width: '195px',
    height: '34px',
    borderRadius: '12px',
    background: GLOW_COLORS.surface,
    border: '0.5px solid rgba(40, 40, 40, 0.25)',
    gap: '10px',
    iconSize: '20px',
    fontFamily: 'Urbanist',
    fontSize: '14px',
    fontWeight: 400,
    color: GLOW_COLORS.text,
  },
  grid: {
    gap: '10px',
    cardWidth: '388px',
    cardHeight: '126px',
  },
  card: {
    padding: '20px',
    logoSize: '56px',
    logoRadius: '4px',
    logoToContentGap: '15px',
    rowGap: '6px',
    name: {
      fontFamily: 'Urbanist',
      fontSize: '16px',
      fontWeight: 700,
      color: GLOW_COLORS.text,
    },
    distancia: {
      gap: '4px',
      iconSize: '16px',
      fontSize: '12px',
      color: 'rgba(40, 40, 40, 0.6)',
    },
    avaliacao: {
      gap: '6px',
      iconSize: '16px',
      fontSize: '12px',
      valueColor: GLOW_COLORS.text,
      countColor: 'rgba(40, 40, 40, 0.6)',
    },
    endereco: {
      gap: '10px',
      iconSize: '14px',
      fontSize: '14px',
      color: GLOW_COLORS.text,
    },
  },
} as const

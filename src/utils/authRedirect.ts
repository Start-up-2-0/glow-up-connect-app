import type { RouteLocationRaw } from 'vue-router'
import { LANDING_URL, ROUTE_PATHS } from '@/constants/routes'

function isLandingAbsoluteUrl(value: string): boolean {
  try {
    const url = new URL(value)
    const landing = new URL(LANDING_URL)
    return url.origin === landing.origin
  } catch {
    return false
  }
}

/** Aceita path relativo do app ou URL absoluta da landing. */
export function readRedirectParam(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value) return undefined
  if (value.startsWith('/')) return value
  if (isLandingAbsoluteUrl(value)) return value
  return undefined
}

export function isExternalRedirect(path: string): boolean {
  return path.startsWith('http://') || path.startsWith('https://')
}

export function isOnboardingCheckoutPath(path: string): boolean {
  const normalized = path.startsWith('http') ? new URL(path).pathname : path
  return (
    normalized.startsWith(ROUTE_PATHS.ONBOARDING_ASSINATURA) ||
    normalized.startsWith(ROUTE_PATHS.ONBOARDING_CHECKOUT)
  )
}

export function redirectQuery(redirect?: string): { redirect: string } | undefined {
  return redirect ? { redirect } : undefined
}

export function authRouteWithRedirect(
  path: string,
  redirect?: string,
): RouteLocationRaw {
  const query = redirectQuery(redirect)
  return query ? { path, query } : path
}

export function isConviteResponderPath(path: string): boolean {
  return path.startsWith(`${ROUTE_PATHS.CONVITES}/`) && path.length > ROUTE_PATHS.CONVITES.length + 1
}

export function extractConviteTokenFromPath(path: string): string | undefined {
  if (!isConviteResponderPath(path)) return undefined
  return decodeURIComponent(path.slice(ROUTE_PATHS.CONVITES.length + 1))
}

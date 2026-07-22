import type { RouteLocationRaw } from 'vue-router'
import { ROUTE_PATHS } from '@/constants/routes'

export function readRedirectParam(value: unknown): string | undefined {
  return typeof value === 'string' && value.startsWith('/') ? value : undefined
}

export function isOnboardingCheckoutPath(path: string): boolean {
  return (
    path.startsWith(ROUTE_PATHS.ONBOARDING_ASSINATURA) ||
    path.startsWith(ROUTE_PATHS.ONBOARDING_CHECKOUT)
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

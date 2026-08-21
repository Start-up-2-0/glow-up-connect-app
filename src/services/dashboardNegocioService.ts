import api from './api'
import { unwrapApi } from './negocioApiHelper'
import { negocioPath } from '@/utils/negocioApi'
import type { ApiSuccessResponse } from '@/types/api.types'
import type { DashboardNegocioResponse } from '@/types/dashboard.types'

export const dashboardNegocioService = {
  obter(estabelecimentoId: number) {
    return api
      .get<ApiSuccessResponse<DashboardNegocioResponse>>(
        negocioPath(estabelecimentoId, '/dashboard'),
      )
      .then(unwrapApi)
  },
}

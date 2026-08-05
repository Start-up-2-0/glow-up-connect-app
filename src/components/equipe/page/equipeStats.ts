import type { Component } from 'vue'
import { Headphones, Shield, UserPlus, Users, UserRound } from 'lucide-vue-next'

export interface EquipeStatItem {
  id: string
  label: string
  value: string | number
  hint: string
  icon: Component
  iconClass?: string
}

export const EQUIPE_STAT_ICONS = {
  total: Users,
  admin: Shield,
  profissional: UserRound,
  recepcionista: Headphones,
  convidado: UserPlus,
} as const

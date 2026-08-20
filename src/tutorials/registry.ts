import type { TutorialDefinition } from '@/tutorials/types'
import { businessHoursTutorial } from '@/tutorials/modules/business-hours'
import { firstServiceMission, servicesTutorial } from '@/tutorials/modules/services'
import { agendaTutorial } from '@/tutorials/modules/agenda'
import {
  auditTutorial,
  clientsTutorial,
  dashboardTutorial,
  financeTutorial,
  integrationsTutorial,
  preferencesTutorial,
  profileTutorial,
  storeProfileTutorial,
  storesTutorial,
  subscriptionTutorial,
  teamTutorial,
} from '@/tutorials/modules/common'

const tutorials = new Map<string, TutorialDefinition>()

function register(def: TutorialDefinition) {
  tutorials.set(def.id, def)
}

const ALL: TutorialDefinition[] = [
  businessHoursTutorial,
  firstServiceMission,
  servicesTutorial,
  agendaTutorial,
  dashboardTutorial,
  storesTutorial,
  clientsTutorial,
  financeTutorial,
  subscriptionTutorial,
  storeProfileTutorial,
  teamTutorial,
  integrationsTutorial,
  auditTutorial,
  preferencesTutorial,
  profileTutorial,
]

ALL.forEach(register)

export function registerTutorial(def: TutorialDefinition) {
  register(def)
}

export function getTutorial(id: string): TutorialDefinition | undefined {
  return tutorials.get(id)
}

export function listTutorials(): TutorialDefinition[] {
  return Array.from(tutorials.values())
}

export function getTutorialByRoute(
  routeName?: string | null,
  routePath?: string | null,
): TutorialDefinition | undefined {
  const all = listTutorials()
  // Prefer tutorial over mission when both share the same route
  if (routeName) {
    const byName = all.filter((t) => t.routeName === routeName)
    const tutorial = byName.find((t) => t.kind === 'tutorial')
    if (tutorial) return tutorial
    if (byName[0]) return byName[0]
  }
  if (routePath) {
    const byPath = all.filter((t) => t.routePath === routePath)
    const tutorial = byPath.find((t) => t.kind === 'tutorial')
    if (tutorial) return tutorial
    if (byPath[0]) return byPath[0]
  }
  return undefined
}

export const tutorialRegistry = {
  register: registerTutorial,
  get: getTutorial,
  list: listTutorials,
  byRoute: getTutorialByRoute,
}

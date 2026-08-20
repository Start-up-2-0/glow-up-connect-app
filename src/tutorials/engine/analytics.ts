export type TutorialAnalyticsEvent =
  | 'tutorial_started'
  | 'tutorial_step_viewed'
  | 'tutorial_step_completed'
  | 'tutorial_abandoned'
  | 'tutorial_resumed'
  | 'tutorial_skipped'
  | 'tutorial_completed'
  | 'tutorial_restarted'

export interface TutorialAnalyticsPayload {
  tutorialId: string
  tutorialVersion: number
  stepId?: string
  module?: string
  userRole?: string
  timestamp: string
}

type AnalyticsSink = (event: TutorialAnalyticsEvent, payload: TutorialAnalyticsPayload) => void

let sink: AnalyticsSink = () => {
  // no-op — provider externo pode ser ligado depois
}

export const tutorialAnalytics = {
  setSink(next: AnalyticsSink) {
    sink = next
  },

  track(event: TutorialAnalyticsEvent, payload: Omit<TutorialAnalyticsPayload, 'timestamp'>) {
    sink(event, { ...payload, timestamp: new Date().toISOString() })
  },
}

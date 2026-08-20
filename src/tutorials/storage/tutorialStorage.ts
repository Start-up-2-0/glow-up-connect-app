import { STORAGE_KEYS } from '@/constants/storageKeys'
import { storage } from '@/utils/storage'
import type {
  GlowGuideStoragePayload,
  TutorialProgressRecord,
  TutorialStatus,
} from '@/tutorials/types'

const EMPTY_PAYLOAD: GlowGuideStoragePayload = {
  tutorials: {},
  dismissedSuggestions: {},
  onboardingChecklist: {},
}

function storageKey(userId: number | null): string {
  const uid = userId ?? 'anon'
  return `${STORAGE_KEYS.GLOW_GUIDE}:${uid}`
}

function readPayload(userId: number | null): GlowGuideStoragePayload {
  const raw = storage.get(storageKey(userId))
  if (!raw) return { ...EMPTY_PAYLOAD, tutorials: {}, dismissedSuggestions: {}, onboardingChecklist: {} }
  try {
    const parsed = JSON.parse(raw) as GlowGuideStoragePayload
    return {
      tutorials: parsed.tutorials ?? {},
      dismissedSuggestions: parsed.dismissedSuggestions ?? {},
      onboardingChecklist: parsed.onboardingChecklist ?? {},
    }
  } catch {
    return { ...EMPTY_PAYLOAD, tutorials: {}, dismissedSuggestions: {}, onboardingChecklist: {} }
  }
}

function writePayload(userId: number | null, payload: GlowGuideStoragePayload): void {
  storage.set(storageKey(userId), JSON.stringify(payload))
}

export const tutorialStorage = {
  getProgress(userId: number | null, tutorialId: string): TutorialProgressRecord | null {
    return readPayload(userId).tutorials[tutorialId] ?? null
  },

  setProgress(
    userId: number | null,
    tutorialId: string,
    record: TutorialProgressRecord,
  ): void {
    const payload = readPayload(userId)
    payload.tutorials[tutorialId] = record
    writePayload(userId, payload)
  },

  updateProgress(
    userId: number | null,
    tutorialId: string,
    patch: Partial<TutorialProgressRecord> & { version: number },
  ): TutorialProgressRecord {
    const current = tutorialStorage.getProgress(userId, tutorialId)
    const next: TutorialProgressRecord = {
      version: patch.version,
      currentStepId: patch.currentStepId ?? current?.currentStepId ?? null,
      status: (patch.status ?? current?.status ?? 'not_started') as TutorialStatus,
      updatedAt: new Date().toISOString(),
    }
    tutorialStorage.setProgress(userId, tutorialId, next)
    return next
  },

  restart(userId: number | null, tutorialId: string, version: number): void {
    tutorialStorage.setProgress(userId, tutorialId, {
      version,
      currentStepId: null,
      status: 'not_started',
      updatedAt: new Date().toISOString(),
    })
  },

  isSuggestionDismissed(userId: number | null, tutorialId: string): boolean {
    return Boolean(readPayload(userId).dismissedSuggestions[tutorialId])
  },

  dismissSuggestion(userId: number | null, tutorialId: string): void {
    const payload = readPayload(userId)
    payload.dismissedSuggestions[tutorialId] = true
    writePayload(userId, payload)
  },

  getAllProgress(userId: number | null): Record<string, TutorialProgressRecord> {
    return readPayload(userId).tutorials
  },
}

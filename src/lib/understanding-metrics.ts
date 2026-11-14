export interface AdViewEvent {
  id: string;
  viewer_id: string;
  ad_id: string;
  points_earned: number;
  watched_at: string;
  earned: boolean;
}

export interface AdUnderstandingDefinition {
  id: string;
  questions?: unknown[] | null;
}

export interface UnderstandingView extends AdViewEvent {
  understanding_score: 0 | 100;
  verified_at?: string;
}

export interface UnderstandingAnalytics {
  completedViews: UnderstandingView[];
  verifiedViews: UnderstandingView[];
  understandingRate: number;
}

export const ADVERTISEMENT_REWARD_POINTS = 2;

const KEY_MESSAGE_MARKER = '\n<!--rewardad-key-message:';

export function encodeAdvertisementDetails(description: string, keyMessage: string): string {
  const markerIndex = description.lastIndexOf(KEY_MESSAGE_MARKER);
  const cleanDescription = markerIndex >= 0 ? description.slice(0, markerIndex) : description;
  return `${cleanDescription}${KEY_MESSAGE_MARKER}${encodeURIComponent(keyMessage)}-->`;
}

export function decodeAdvertisementDetails(description: string | null | undefined): {
  description: string;
  keyMessage: string;
} {
  const value = description || '';
  const markerIndex = value.lastIndexOf(KEY_MESSAGE_MARKER);
  if (markerIndex < 0) return { description: value, keyMessage: '' };

  const encodedValue = value.slice(markerIndex + KEY_MESSAGE_MARKER.length).replace(/-->\s*$/, '');
  try {
    return {
      description: value.slice(0, markerIndex),
      keyMessage: decodeURIComponent(encodedValue),
    };
  } catch {
    return { description: value, keyMessage: '' };
  }
}

export function calculateUnderstandingAnalytics(
  events: AdViewEvent[],
  advertisements: AdUnderstandingDefinition[],
): UnderstandingAnalytics {
  const adsRequiringVerification = new Set(
    advertisements
      .filter((ad) => Array.isArray(ad.questions) && ad.questions.length > 0)
      .map((ad) => ad.id),
  );
  const sortedEvents = [...events].sort((a, b) => {
    const timeDifference = Date.parse(a.watched_at) - Date.parse(b.watched_at);
    return timeDifference || Number(a.earned) - Number(b.earned);
  });
  const completedViews: UnderstandingView[] = [];
  const unmatchedCompletions = new Map<string, number[]>();

  sortedEvents.forEach((event) => {
    const pairKey = `${event.viewer_id}:${event.ad_id}`;

    if (!event.earned) {
      const completionIndex = completedViews.push({
        ...event,
        understanding_score: 0,
      }) - 1;
      const unmatched = unmatchedCompletions.get(pairKey) ?? [];
      unmatched.push(completionIndex);
      unmatchedCompletions.set(pairKey, unmatched);
      return;
    }

    if (!adsRequiringVerification.has(event.ad_id)) return;

    const unmatched = unmatchedCompletions.get(pairKey) ?? [];
    const completionIndex = unmatched.shift();
    unmatchedCompletions.set(pairKey, unmatched);

    if (completionIndex === undefined) {
      return;
    }

    completedViews[completionIndex] = {
      ...completedViews[completionIndex],
      points_earned: event.points_earned,
      understanding_score: 100,
      verified_at: event.watched_at,
    };
  });

  const verifiedViews = completedViews.filter((view) => view.understanding_score === 100);
  const understandingRate = completedViews.length === 0
    ? 0
    : (verifiedViews.length / completedViews.length) * 100;

  return {
    completedViews: [...completedViews].sort((a, b) => b.watched_at.localeCompare(a.watched_at)),
    verifiedViews: [...verifiedViews].sort((a, b) => (b.verified_at ?? b.watched_at).localeCompare(a.verified_at ?? a.watched_at)),
    understandingRate,
  };
}
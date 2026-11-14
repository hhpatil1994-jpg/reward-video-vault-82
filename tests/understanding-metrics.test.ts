import { describe, expect, it } from 'bun:test';
import {
  calculateUnderstandingAnalytics,
  decodeAdvertisementDetails,
  encodeAdvertisementDetails,
  ADVERTISEMENT_REWARD_POINTS,
  type AdViewEvent,
} from '../src/lib/understanding-metrics';

const events: AdViewEvent[] = [
  { id: 'view-1', viewer_id: 'viewer-a', ad_id: 'ad-1', points_earned: 0, watched_at: '2026-11-08T10:00:00Z', earned: false },
  { id: 'pass-1', viewer_id: 'viewer-a', ad_id: 'ad-1', points_earned: 2, watched_at: '2026-11-08T10:01:00Z', earned: true },
  { id: 'view-2', viewer_id: 'viewer-b', ad_id: 'ad-1', points_earned: 0, watched_at: '2026-11-08T10:02:00Z', earned: false },
];

describe('understanding verification analytics', () => {
  it('sets every advertisement reward to exactly 2 points', () => {
    expect(ADVERTISEMENT_REWARD_POINTS).toBe(2);
  });

  it('round-trips key messages without exposing storage metadata in the description', () => {
    const encoded = encodeAdvertisementDetails('Product overview', 'Keep food fresh & safe');
    const decoded = decodeAdvertisementDetails(encoded);

    expect(decoded.description).toBe('Product overview');
    expect(decoded.keyMessage).toBe('Keep food fresh & safe');
  });

  it('calculates verified views divided by completed views and assigns 100% or 0%', () => {
    const result = calculateUnderstandingAnalytics(events, [{ id: 'ad-1', questions: [{ question: 'What is the message?' }] }]);

    expect(result.completedViews).toHaveLength(2);
    expect(result.verifiedViews).toHaveLength(1);
    expect(result.verifiedViews[0]?.understanding_score).toBe(100);
    expect(result.completedViews.find((view) => view.id === 'view-2')?.understanding_score).toBe(0);
    expect(result.understandingRate).toBe(50);
  });

  it('does not count direct rewards without an understanding check as verified', () => {
    const directRewardEvents: AdViewEvent[] = [
      { id: 'view-3', viewer_id: 'viewer-c', ad_id: 'ad-2', points_earned: 0, watched_at: '2026-11-08T11:00:00Z', earned: false },
      { id: 'reward-3', viewer_id: 'viewer-c', ad_id: 'ad-2', points_earned: 2, watched_at: '2026-11-08T11:01:00Z', earned: true },
    ];
    const result = calculateUnderstandingAnalytics(directRewardEvents, [{ id: 'ad-2', questions: [] }]);

    expect(result.completedViews).toHaveLength(1);
    expect(result.completedViews[0]?.understanding_score).toBe(0);
    expect(result.understandingRate).toBe(0);
  });

  it('does not count an unmatched verification reward as a completed view', () => {
    const orphanReward: AdViewEvent[] = [
      { id: 'reward-only', viewer_id: 'viewer-d', ad_id: 'ad-1', points_earned: 2, watched_at: '2026-11-08T12:00:00Z', earned: true },
    ];
    const result = calculateUnderstandingAnalytics(orphanReward, [{ id: 'ad-1', questions: [{ question: 'What is the key message?' }] }]);

    expect(result.completedViews).toHaveLength(0);
    expect(result.verifiedViews).toHaveLength(0);
    expect(result.understandingRate).toBe(0);
  });
});
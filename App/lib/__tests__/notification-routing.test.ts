import { describe, expect, it } from 'vitest';
import {
  resolveLinkPath,
  resolvePushNotificationTarget
} from '../notification-routing-resolve';

describe('resolveLinkPath', () => {
  it('routes promote link_path to hunt detail', () => {
    expect(resolveLinkPath('/mostwanted/hunt-abc')).toEqual({
      type: 'mw_detail',
      huntId: 'hunt-abc'
    });
  });

  it('routes contributions and solved list paths', () => {
    expect(resolveLinkPath('/mostwanted/contributions')).toEqual({ type: 'mw_contributions' });
    expect(resolveLinkPath('/mostwanted/solved')).toEqual({ type: 'mw_solved' });
  });

  it('routes wishlist paths', () => {
    expect(resolveLinkPath('/database/wishlist')).toEqual({ type: 'wishlist' });
  });

  it('routes advocacy campaign paths', () => {
    expect(resolveLinkPath('/advocacy/camp-1')).toEqual({
      type: 'advocacy_detail',
      campaignId: 'camp-1'
    });
    expect(resolveLinkPath('/advocacy')).toEqual({ type: 'advocacy' });
  });
});

describe('resolvePushNotificationTarget', () => {
  it('prefers link_path for wishlist_promoted_to_most_wanted', () => {
    expect(
      resolvePushNotificationTarget({
        kind: 'wishlist_promoted_to_most_wanted',
        link_path: '/mostwanted/h1'
      })
    ).toEqual({ type: 'mw_detail', huntId: 'h1' });
  });

  it('falls back to wishlist when promote has no link', () => {
    expect(
      resolvePushNotificationTarget({ kind: 'wishlist_promoted_to_most_wanted' })
    ).toEqual({ type: 'wishlist' });
  });

  it('routes evidence review outcomes to contributions', () => {
    expect(
      resolvePushNotificationTarget({ kind: 'most_wanted_evidence_needs_more_info' })
    ).toEqual({ type: 'mw_contributions' });
  });

  it('routes solved to solved list when no link', () => {
    expect(resolvePushNotificationTarget({ kind: 'most_wanted_solved' })).toEqual({
      type: 'mw_solved'
    });
  });
});

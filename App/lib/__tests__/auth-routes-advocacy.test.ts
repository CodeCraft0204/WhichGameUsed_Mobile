import { describe, expect, it } from 'vitest';
import { isPublicAuthRoute } from '../auth-routes';

describe('isPublicAuthRoute advocacy', () => {
  it('allows guest browse of list and detail', () => {
    expect(isPublicAuthRoute(['advocacy', 'advocacy'])).toBe(true);
    expect(isPublicAuthRoute(['advocacy', 'init-uuid'])).toBe(true);
  });

  it('requires auth for my advocacy and submit flows', () => {
    expect(isPublicAuthRoute(['advocacy', 'my-advocacy'])).toBe(false);
    expect(isPublicAuthRoute(['advocacy', 'my-support'])).toBe(false);
    expect(isPublicAuthRoute(['advocacy', 'submit-issue'])).toBe(false);
    expect(isPublicAuthRoute(['advocacy', 'submit-evidence'])).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import { describeApiError } from '@/lib/adminApi';

describe('describeApiError', () => {
  it('includes backend validation details in the returned message', () => {
    const error = new Error(JSON.stringify({
      message: 'Validation failed',
      errors: ['dailySchedule must be an array', 'dailySchedule items must be objects'],
    }));

    expect(describeApiError(error, 'Failed to save event')).toBe(
      'Validation failed: dailySchedule must be an array; dailySchedule items must be objects',
    );
  });

  it('uses the fallback for an empty error message', () => {
    expect(describeApiError(new Error(''), 'Failed to save event')).toBe('Failed to save event');
  });
});
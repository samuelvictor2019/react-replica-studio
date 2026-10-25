import { dailyScheduleTransformer } from './event.entity';

describe('dailyScheduleTransformer', () => {
  const schedule = [{ day: 'Monday', session: 'Morning', time: '9:00 AM' }];

  it('serializes arrays and restores them from stored JSON text', () => {
    const serialized = dailyScheduleTransformer.to(schedule);

    expect(serialized).toBe(JSON.stringify(schedule));
    expect(dailyScheduleTransformer.from(serialized)).toEqual(schedule);
  });

  it('normalizes empty and malformed legacy values to an empty array', () => {
    expect(dailyScheduleTransformer.from('')).toEqual([]);
    expect(dailyScheduleTransformer.from('not-json')).toEqual([]);
    expect(dailyScheduleTransformer.from(null)).toEqual([]);
  });
});

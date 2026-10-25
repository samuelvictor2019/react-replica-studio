import { describe, expect, it } from 'vitest';
import { sanitizeCssColor } from '@/components/ui/chart';
import { getStorageItem, setStorageItem } from '@/lib/storage';

describe('security hardening', () => {
  it('rejects unsafe CSS color values before they reach dangerouslySetInnerHTML', () => {
    expect(sanitizeCssColor('red')).toBe('red');
    expect(sanitizeCssColor('#00ff88')).toBe('#00ff88');
    expect(sanitizeCssColor('rgb(12 34 56 / 0.5)')).toBe('rgb(12 34 56 / 0.5)');
    expect(sanitizeCssColor('url(javascript:alert(1))')).toBeNull();
    expect(sanitizeCssColor('linear-gradient(red, blue)')).toBeNull();
  });

  it('reads and writes browser storage defensively without crashing when storage is unavailable', () => {
    const mockStorage = {
      getItem: () => 'saved-theme',
      setItem: () => undefined,
      removeItem: () => undefined,
    } as Storage;

    expect(getStorageItem('theme', mockStorage)).toBe('saved-theme');
    expect(() => setStorageItem('theme', 'dark', mockStorage)).not.toThrow();
  });
});

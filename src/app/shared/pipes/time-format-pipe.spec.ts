import { describe, it, expect, beforeEach } from 'vitest';
import { TimeFormatPipe } from './time-format-pipe';

describe('TimeFormatPipe', () => {
  let pipe: TimeFormatPipe;

  beforeEach(() => {
    pipe = new TimeFormatPipe();
  });

  it('should handle null and undefined', () => {
    expect(pipe.transform(null)).toBe('0:00');
    expect(pipe.transform(undefined as any)).toBe('0:00');
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return 0:00 if value is null', () => {
    expect(pipe.transform(null)).toBe('0:00');
  });

  it('should format seconds correctly into M:SS', () => {
    expect(pipe.transform(65)).toBe('1:05');

    expect(pipe.transform(120)).toBe('2:00');

    expect(pipe.transform(59)).toBe('0:59');
  });

  it('should handle 0 seconds', () => {
    expect(pipe.transform(0)).toBe('0:00');
  });
});

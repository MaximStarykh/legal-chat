import { describe, it, expect, vi } from 'vitest';
import { apiClient } from './apiClient';

global.fetch = vi.fn(
  () =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ text: 'ok', sources: [] }),
    }) as any
);

describe('apiClient', () => {
  it('returns data on success', async () => {
    const { data, error } = await apiClient.postChat<{ text: string }>({
      a: 1,
    });
    expect(error).toBeUndefined();
    expect(data?.text).toBe('ok');
  });
});

export interface ApiResponse<T> {
  data: T | null;
  error?: string;
}

const getApiUrl = () => {
  const base = import.meta.env.VITE_API_URL;
  if (base) {
    return `${base.replace(/\/$/, '')}/api/chat`;
  }
  return import.meta.env.PROD ? '/api/chat' : 'http://localhost:3001/api/chat';
};

export const apiClient = {
  async postChat<T>(payload: unknown): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(getApiUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        return { data: null, error: text };
      }
      const data = (await res.json()) as T;
      return { data };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'error' };
    }
  },
};

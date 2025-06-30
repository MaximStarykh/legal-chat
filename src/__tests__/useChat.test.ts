import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { useChat } from '../hooks/useChat';
import * as service from '../services/geminiService';

vi.mock('../services/geminiService');

describe('useChat', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useChat());
    expect(result.current.messages).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sends a message and appends response', async () => {
    (service.sendMessage as unknown as vi.Mock).mockResolvedValue({ text: 'answer', sources: [] });
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.handleSendMessage('hello');
    });

    await waitFor(() => expect(service.sendMessage).toHaveBeenCalled());

    expect(result.current.messages[0].parts[0].text).toBe('hello');
    expect(result.current.messages[1].parts[0].text).toBe('answer');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});

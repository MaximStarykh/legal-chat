import type { GroundingSource, Message } from '../types';
import { apiClient } from './apiClient';

export const sendMessage = async (
  history: Message[],
  message: string
): Promise<{ text: string; sources: GroundingSource[] }> => {
  if (!message?.trim()) {
    throw new Error('Message cannot be empty.');
  }

  try {
    // Pre-process the history to send only the required fields
    const processedHistory = history.map(({ role, parts }) => ({
      role,
      parts: parts.map((p) => ({
        text: typeof p === 'string' ? p : p.text,
      })),
    }));

    const payload = {
      history: processedHistory,
      message: message.trim(),
    };

    const { data, error } = await apiClient.postChat<{
      text: string;
      sources: GroundingSource[];
    }>(payload);
    if (error || !data) {
      throw new Error(error || 'Request failed');
    }

    return {
      text: data.text || '',
      sources: Array.isArray(data.sources) ? data.sources : [],
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Failed to connect to the server. Please try again.');
      }
      throw error;
    }
    throw new Error('An unknown error occurred while processing your request');
  }
};

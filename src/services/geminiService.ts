import type { GroundingSource, Message } from "../types";

// Get the API URL from environment variables with fallback
const getApiUrl = (): string => {
  // In production, use relative URL (handled by Vercel rewrites)
  if (import.meta.env.PROD) return '/api/chat';
  
  // In development, use the VITE_API_URL or default to localhost:3000
  return import.meta.env.VITE_API_URL || 'http://localhost:3000/api/chat';
};

export const sendMessage = async (
  history: Message[],
  message: string
): Promise<{ text: string; sources: GroundingSource[] }> => {
  if (!message?.trim()) {
    throw new Error("Message cannot be empty.");
  }

  try {
    // Pre-process the history to send only the required fields
    const processedHistory = history.map(({ role, parts }) => ({ 
      role, 
      parts: parts.map(p => ({
        text: typeof p === 'string' ? p : p.text
      }))
    }));

    const apiUrl = getApiUrl();
    console.log('Sending request to:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ 
        history: processedHistory, 
        message: message.trim() 
      }),
    });

    const data = await response.json().catch(() => ({
      error: 'Invalid JSON response from server',
    }));

    if (!response.ok) {
      const errorMessage = data?.error || 
                         data?.message || 
                         `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return {
      text: data.text || '',
      sources: Array.isArray(data.sources) ? data.sources : []
    };
  } catch (error) {
    console.error('Error in sendMessage:', error);
    throw error instanceof Error 
      ? error 
      : new Error('An unknown error occurred while processing your request');
  }
};


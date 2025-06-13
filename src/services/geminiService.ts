import type { GroundingSource, Message } from "../types";

// Get the API URL from environment variables with fallback
const getApiUrl = (): string => {
  // Use VITE_API_URL if it's set in .env file, otherwise use the default
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  return `${baseUrl}/api/chat`;
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
    
    const payload = { 
      history: processedHistory, 
      message: message.trim() 
    };

    console.log('Request payload:', JSON.stringify(payload, null, 2));
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    let data;
    
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      console.error('Failed to parse JSON response:', responseText);
      throw new Error('Invalid JSON response from server');
    }

    if (!response.ok) {
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        data
      });
      
      // Create a more detailed error object
      const error = new Error(data?.message || `Request failed with status ${response.status}`) as any;
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return {
      text: data.text || '',
      sources: Array.isArray(data.sources) ? data.sources : []
    };
  } catch (error) {
    console.error('Error in sendMessage:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Failed to connect to the server. Please check your internet connection and try again.');
      }
      throw error;
    }
    
    throw new Error('An unknown error occurred while processing your request');
  }
};


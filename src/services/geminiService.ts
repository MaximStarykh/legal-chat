import type { GroundingSource, Message } from "../types";

export const sendMessage = async (
  history: Message[],
  message: string
): Promise<{ text: string; sources: GroundingSource[] }> => {
  if (!message?.trim()) {
    throw new Error("Message cannot be empty.");
  }

  // Pre-process the history to send only the required fields.
  const processedHistory = history.map(({ role, parts }) => ({ role, parts }));

  try {
    // In production, the API is at the same origin, but in development we need to use the full URL
    const apiUrl = import.meta.env.DEV 
      ? 'http://localhost:3000/api/chat' 
      : '/api/chat';
      
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ history: processedHistory, message }),
    });

    if (!response.ok) {
      let errorText = `API request failed with status ${response.status}`;
      try {
        const errorBody = await response.json();
        errorText = errorBody.error || errorText;
      } catch (e) {
        // The response was not valid JSON, use the status text.
        errorText = response.statusText;
      }
      throw new Error(errorText);
    }

    return await response.json();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("Failed to send message:", errorMessage);
    throw new Error(`Failed to get a response from the server: ${errorMessage}`);
  }
};


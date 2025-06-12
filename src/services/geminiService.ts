import { API_ERROR_MESSAGE, CHAT_SESSION_ERROR } from "../constants";
import type { GroundingSource } from "../types";

export interface Chat {
  history: any[];
}

/**
 * Service for handling all Gemini API interactions
 */

// Error codes for specific error handling
export enum GeminiErrorCode {
  INVALID_API_KEY = "INVALID_API_KEY",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  CONTENT_FILTERED = "CONTENT_FILTERED",
  MODEL_OVERLOADED = "MODEL_OVERLOADED",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * Creates a new chat session with Gemini API
 * @returns A new chat session or null if initialization fails
 * @throws {Error} If there's an error during initialization
 */
export const initializeChatSession = (): Chat => ({ history: [] });

/**
 * Sends a message to the Gemini chat API
 * @param chat - The chat session to use
 * @param userQuery - The user's message
 * @returns The AI's response text and any sources
 * @throws {Error} If there's an error during the API call
 */
export const sendMessageToChat = async (
  chat: Chat,
  userQuery: string,
): Promise<{ text: string; sources: GroundingSource[] }> => {
  if (!chat) {
    throw new Error("Chat session is not initialized");
  }

  if (!userQuery?.trim()) {
    throw new Error("Message cannot be empty");
  }

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history: chat.history, message: userQuery }),
    });

    if (!response.ok) {
      throw new Error("API request failed");
    }

    const data = await response.json();

    chat.history = data.history || [];

    return {
      text: data.text as string,
      sources: (data.sources || []) as GroundingSource[],
    };
  } catch (error) {
    console.error("Error in sendMessageToChat:", error);

    const errorObj = new Error(API_ERROR_MESSAGE);
    (errorObj as any).cause = {
      code: GeminiErrorCode.UNKNOWN_ERROR,
      originalError: error,
    };
    throw errorObj;
  }
};

import { GoogleGenAI, type GroundingChunk, type Chat } from "@google/genai";
import {
  GEMINI_MODEL_NAME,
  API_KEY_MISSING_MESSAGE,
  API_ERROR_MESSAGE,
  SYSTEM_INSTRUCTION,
  CHAT_SESSION_ERROR,
} from "../constants";
import type { GroundingSource } from "../types";

/**
 * Service for handling all Gemini API interactions
 */

// Gemini API client instance
let ai: GoogleGenAI | null = null;

/**
 * Fetch API key from backend
 */
const fetchApiKey = async (): Promise<string | null> => {
  try {
    const response = await fetch("/api/api-key");
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as { apiKey?: string };
    return data.apiKey ?? null;
  } catch (error) {
    console.error("Failed to fetch API key", error);
    return null;
  }
};

const getGeminiClient = async (): Promise<GoogleGenAI | null> => {
  if (ai) return ai;

  const key = await fetchApiKey();
  if (!key) return null;

  ai = new GoogleGenAI({ apiKey: key });
  return ai;
};

// Error codes for specific error handling
export enum GeminiErrorCode {
  INVALID_API_KEY = "INVALID_API_KEY",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  CONTENT_FILTERED = "CONTENT_FILTERED",
  MODEL_OVERLOADED = "MODEL_OVERLOADED",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * Extracts source information from Gemini API response
 */
const extractSources = (groundingMetadata?: {
  groundingChunks?: GroundingChunk[];
}): GroundingSource[] => {
  if (!groundingMetadata?.groundingChunks?.length) {
    return [];
  }

  try {
    return groundingMetadata.groundingChunks
      .filter(
        (
          chunk,
        ): chunk is GroundingChunk & { web: { uri: string; title?: string } } =>
          !!chunk.web?.uri,
      )
      .map((chunk) => ({
        uri: chunk.web.uri,
        title: chunk.web.title || chunk.web.uri,
      }));
  } catch (error) {
    console.error("Error extracting sources:", error);
    return [];
  }
};

/**
 * Creates a new chat session with Gemini API
 * @returns A new chat session or null if initialization fails
 * @throws {Error} If there's an error during initialization
 */
export const initializeChatSession = async (): Promise<Chat | null> => {
  const client = await getGeminiClient();
  if (!client) {
    console.error(API_KEY_MISSING_MESSAGE);
    return null;
  }

  try {
    return client.chats.create({
      model: GEMINI_MODEL_NAME,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
      },
    });
  } catch (error) {
    console.error("Error initializing chat session:", error);
    const errorMessage =
      error instanceof Error
        ? `${CHAT_SESSION_ERROR} ${error.message}`
        : CHAT_SESSION_ERROR;
    const errorObj = new Error(errorMessage);
    // Using type assertion as a workaround for TypeScript error
    (errorObj as any).cause = error;
    throw errorObj;
  }
};

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
    const response = await chat.sendMessage({ message: userQuery });

    if (!response?.text) {
      throw new Error("Empty response from API");
    }

    const sources = extractSources(response.candidates?.[0]?.groundingMetadata);

    return {
      text: response.text,
      sources,
    };
  } catch (error) {
    console.error("Error in sendMessageToChat:", error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes("API key not valid")) {
        const err = new Error(API_KEY_MISSING_MESSAGE);
        // Using type assertion as a workaround for TypeScript error
        (err as any).cause = { code: GeminiErrorCode.INVALID_API_KEY };
        throw err;
      } else if (error.message.includes("quota")) {
        const err = new Error(
          "Ви перевищили квоту запитів. Спробуйте пізніше.",
        );
        // Using type assertion as a workaround for TypeScript error
        (err as any).cause = { code: GeminiErrorCode.RATE_LIMIT_EXCEEDED };
        throw err;
      }
    }

    // Default error
    const errorObj = new Error(API_ERROR_MESSAGE);
    // Using type assertion as a workaround for TypeScript error
    (errorObj as any).cause = {
      code: GeminiErrorCode.UNKNOWN_ERROR,
      originalError: error,
    };
    throw errorObj;
  }
};

/**
 * Validates the API key format
 * @param key - The API key to validate
 * @returns True if the key appears to be valid
 */
export const validateApiKey = (key: string): boolean => {
  // Basic validation - adjust according to Gemini's key format
  return key?.length > 20 && key.startsWith("AI");
};

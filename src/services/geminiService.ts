import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  ChatSession,
} from "@google/generative-ai";

import {
  GEMINI_MODEL_NAME,
  API_ERROR_MESSAGE,
  CHAT_SESSION_ERROR,
} from "../constants";
import type { GroundingSource } from "../types";

// Re-exporting these types and enums for use in other parts of the application
export type { ChatSession };
export { HarmCategory, HarmBlockThreshold };

export enum GeminiErrorCode {
  INVALID_API_KEY = "INVALID_API_KEY",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  CONTENT_FILTERED = "CONTENT_FILTERED",
  MODEL_OVERLOADED = "MODEL_OVERLOADED",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

// Singleton instance of the Gemini AI client
let ai: GoogleGenerativeAI | null = null;

const fetchApiKey = async (): Promise<string | null> => {
  try {
    const response = await fetch("/api/api-key");
    if (!response.ok) {
      console.error(`Failed to fetch API key: ${response.statusText}`);
      return null;
    }
    const data = (await response.json()) as { apiKey?: string };
    if (!data.apiKey) {
      console.error("API key not found in response");
      return null;
    }
    return data.apiKey;
  } catch (error) {
    console.error("Error fetching API key:", error);
    return null;
  }
};

const getGeminiClient = async (): Promise<GoogleGenerativeAI> => {
  if (ai) return ai;

  const key = await fetchApiKey();
  if (!key) {
    throw new Error("API key is missing. Please check your server configuration.");
  }

  try {
    ai = new GoogleGenerativeAI(key);
    return ai;
  } catch (error) {
    console.error("Failed to initialize Gemini client:", error);
    throw new Error("Could not initialize the Gemini client.");
  }
};

export const initializeChatSession = async (): Promise<ChatSession> => {
  const client = await getGeminiClient();

  try {
    const model = client.getGenerativeModel({
      model: GEMINI_MODEL_NAME,
      generationConfig: {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    return model.startChat({
      history: [],
    });
  } catch (error) {
    console.error("Error initializing chat session:", error);
    const errorMessage =
      error instanceof Error
        ? `${CHAT_SESSION_ERROR} ${error.message}`
        : CHAT_SESSION_ERROR;
    throw new Error(errorMessage);
  }
};

export const sendMessageToChat = async (
  chat: ChatSession,
  userQuery: string,
): Promise<{ text: string; sources: GroundingSource[] }> => {
  if (!chat) {
    throw new Error("Chat session is not initialized.");
  }

  if (!userQuery?.trim()) {
    throw new Error("Message cannot be empty.");
  }

  try {
    const result = await chat.sendMessage(userQuery);
    const response = result.response;
    const text = response.text();

    return {
      text,
      sources: [], // Placeholder for future grounding sources
    };
  } catch (error: any) {
    console.error("Error sending message to chat:", error);

    if (error.message?.includes("API key")) {
      const err = new Error("Invalid API key. Please check your configuration.");
      (err as any).cause = { code: GeminiErrorCode.INVALID_API_KEY };
      throw err;
    }

    if (error.message?.includes("quota")) {
      const err = new Error("You have exceeded your request quota. Please try again later.");
      (err as any).cause = { code: GeminiErrorCode.RATE_LIMIT_EXCEEDED };
      throw err;
    }

    if (error.message?.includes("safety")) {
      const err = new Error("The response was blocked due to safety policies.");
      (err as any).cause = { code: GeminiErrorCode.CONTENT_FILTERED };
      throw err;
    }

    const errorMessage = error instanceof Error ? error.message : API_ERROR_MESSAGE;
    const errorObj = new Error(errorMessage);
    (errorObj as any).cause = { code: GeminiErrorCode.UNKNOWN_ERROR };
    throw errorObj;
  }
};

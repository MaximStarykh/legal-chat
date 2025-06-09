import { GoogleGenAI, GenerateContentResponse, GroundingChunk, Chat } from "@google/genai";
import { GEMINI_MODEL_NAME, API_KEY_MISSING_MESSAGE, API_ERROR_MESSAGE, SYSTEM_INSTRUCTION } from '../constants';
import { GroundingSource } from "../types";

const API_KEY = process.env.API_KEY;

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const extractSources = (groundingMetadata?: { groundingChunks?: GroundingChunk[] }): GroundingSource[] => {
  if (!groundingMetadata || !groundingMetadata.groundingChunks) {
    return [];
  }
  return groundingMetadata.groundingChunks
    .filter(chunk => chunk.web && chunk.web.uri)
    .map(chunk => ({
      uri: chunk.web!.uri!,
      title: chunk.web!.title || chunk.web!.uri!,
    }));
};

export const initializeChatSession = (): Chat | null => {
  if (!ai) {
    console.error(API_KEY_MISSING_MESSAGE);
    // UI should handle this by preventing chat initialization or showing a persistent error
    return null; 
  }
  try {
    const chat = ai.chats.create({
      model: GEMINI_MODEL_NAME,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
      },
    });
    return chat;
  } catch (error) {
    console.error("Error initializing chat session:", error);
    let message = API_ERROR_MESSAGE;
     if (error instanceof Error) {
        message = `${API_ERROR_MESSAGE} Details: ${error.message}`;
    }
    // Optionally, re-throw or handle more gracefully
    throw new Error(message);
  }
};

export const sendMessageToChat = async (
  chat: Chat,
  userQuery: string,
): Promise<{ text: string; sources: GroundingSource[] }> => {
  if (!chat) {
    // This should ideally not happen if chat initialization is handled correctly
    throw new Error("Chat session is not initialized.");
  }

  try {
    const response: GenerateContentResponse = await chat.sendMessage({message: userQuery});
    
    const text = response.text;
    const sources = extractSources(response.candidates?.[0]?.groundingMetadata);
    
    return { text, sources };

  } catch (error) {
    console.error("Error calling Gemini API (sendMessageToChat):", error);
    let message = API_ERROR_MESSAGE;
    if (error instanceof Error) {
        // Check for specific Gemini API error structures if available
        message = `${API_ERROR_MESSAGE} Details: ${error.message}`;
    }
    throw new Error(message);
  }
};
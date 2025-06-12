import { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI, type GroundingChunk } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const model = process.env.GEMINI_MODEL_NAME || "gemini-2.5-flash-preview-04-17";
const systemInstruction = process.env.SYSTEM_INSTRUCTION || "";

const extractSources = (groundingMetadata?: {
  groundingChunks?: GroundingChunk[];
}): { uri: string; title: string }[] => {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  const { history = [], message } = req.body as {
    history: any[];
    message: string;
  };

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const chat = ai.chats.create({
      model,
      history,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
      },
    });

    const response = await chat.sendMessage({ message });

    const sources = extractSources(response.candidates?.[0]?.groundingMetadata);

    res
      .status(200)
      .json({ text: response.text, sources, history: chat.getHistory() });
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
}

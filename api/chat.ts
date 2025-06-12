import { VercelRequest, VercelResponse } from "@vercel/node";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";



const safetySettings = [
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
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set.");
      return res.status(500).json({ error: "Server configuration error: API key not found." });
    }

    const { history = [], message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const modelName = process.env.GEMINI_MODEL_NAME || "gemini-1.5-flash-latest";
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: modelName, safetySettings });

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(message);
    const response = result.response;
    const text = response.text();

    return res.status(200).json({ text, sources: [] });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("API handler error:", error);
    return res.status(500).json({ error: `Failed to generate response from the AI: ${errorMessage}` });
  }
}


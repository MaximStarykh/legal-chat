import { VercelRequest, VercelResponse } from "@vercel/node";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  Tool,
  Content,
  CitationSource,
} from "@google/generative-ai";

// Safety settings for the generative model
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// Configuration for the generative model's tools, enabling web search
const tools: Tool[] = [{
  googleSearchRetrieval: {},
}];

// Type for chat history messages from the client
interface ChatMessage {
    role: "user" | "model";
    text: string;
}

// Function to format chat history for the generative model
const formatHistory = (history: ChatMessage[]): Content[] => {
  return history.map(turn => ({
    role: turn.role,
    parts: [{ text: turn.text }],
  }));
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set.");
      return res.status(500).json({ error: "Server configuration error: API key not found." });
    }

    const { history = [], message } = req.body as { history: ChatMessage[], message: string };
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // IMPORTANT: Using a model that supports grounding is crucial.
    // 'gemini-1.5-pro-latest' is a good choice.
    const modelName = process.env.GEMINI_MODEL_NAME || "gemini-1.5-pro-latest";
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Initialize the model with the web search tool and specify the beta API version
    const model = genAI.getGenerativeModel({ model: modelName, safetySettings, tools }, { apiVersion: "v1beta" });

    const formattedHistory = formatHistory(history);
    const fullHistory: Content[] = [...formattedHistory, { role: "user", parts: [{ text: message }] }];
    
    const result = await model.generateContent({
        contents: fullHistory,
    });
    
    const response = result.response;
    const text = response.text();
    
    // Extract grounding metadata for citations
    const citationSources = response.candidates?.[0]?.citationMetadata?.citationSources ?? [];
    const sources = citationSources.map((source: CitationSource) => ({
        uri: source.uri,
        title: source.uri, // Use URI as title since title property is not available
    }));

    return res.status(200).json({ text, sources });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("API handler error:", error);
    return res.status(500).json({ error: "Failed to generate response from the AI: " + errorMessage });
  }
}


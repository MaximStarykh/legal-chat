import { VercelRequest, VercelResponse } from "@vercel/node";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

// Safety settings for the generative model
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
  if (req.method !== "POST") {
    console.log(`Method Not Allowed: Received a ${req.method} request.`);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Check for API Key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set in environment variables.");
      return res.status(500).json({ error: "Server configuration error: API key not found." });
    }

    // Parse request body
    let body;
    try {
        // Vercel automatically parses the body for JSON content types
        body = req.body;
        if (!body) {
            throw new Error("Request body is empty.");
        }
    } catch (parseError) {
        console.error("Error parsing request body:", parseError);
        return res.status(400).json({ error: "Invalid request body." });
    }

    const { history = [], message } = body;

    if (!message) {
      return res.status(400).json({ error: "'message' is required in the request body" });
    }

    // Initialize the AI model
    const modelName = process.env.GEMINI_MODEL_NAME || "gemini-1.5-flash-latest";
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName, safetySettings });

    // Start chat and send message
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(message);
    const response = result.response;
    const text = response.text();

    // Send the successful response back to the client
    return res.status(200).json({ text, sources: [] });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("API handler error:", error);
    // Return a generic error message to the client
    return res.status(500).json({ error: `Failed to generate response from the AI: ${errorMessage}` });
  }
}


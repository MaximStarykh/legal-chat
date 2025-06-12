import { VercelRequest, VercelResponse } from "@vercel/node";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  Tool,
  Content,
  CitationSource,
} from "@google/generative-ai";

// --- AGGRESSIVE "FAIL-FAST" CHECK ---
// This will crash the server on startup if the API key is missing.
// This is necessary to expose the root cause of the silent crash.
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey || apiKey.trim() === "") {
  throw new Error("CRITICAL: The GEMINI_API_KEY environment variable is missing or empty. The application cannot start.");
}
// --- END OF CHECK ---

// Initialize the Gemini AI client once at the module level.
// The check above guarantees apiKey is a string.
const genAI = new GoogleGenerativeAI(apiKey);

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

const tools: Tool[] = [{ googleSearchRetrieval: {} }];

interface ClientMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

const formatHistory = (history: ClientMessage[]): Content[] => {
  return history.map((msg) => ({ role: msg.role, parts: msg.parts }));
};

// Add detailed logging middleware
const withErrorHandling = (handler: (req: VercelRequest, res: VercelResponse) => Promise<void>) => {
  return async (req: VercelRequest, res: VercelResponse): Promise<void> => {
    console.log(`[${new Date().toISOString()}] Incoming ${req.method} request to ${req.url}`);
    
    try {
      await handler(req, res);
    } catch (error) {
      console.error('Unhandled error in API route:', error);
      
      // Log additional error details
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      } else {
        console.error('Non-Error object thrown:', JSON.stringify(error));
      }
      
      // Send a more detailed error response
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        ...(process.env.NODE_ENV === 'development' && {
          stack: error instanceof Error ? error.stack : undefined,
          details: error
        })
      });
    }
  };
};

async function handleChatRequest(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { history = [], message } = req.body as { history: ClientMessage[]; message: string };
    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    console.log('Initializing model...');
    const modelName = process.env.GEMINI_MODEL_NAME || "gemini-2.5-flash-05-20";
    console.log(`Using model: ${modelName}`);
    
    const model = genAI.getGenerativeModel(
      { 
        model: modelName, 
        safetySettings, 
        tools 
      }, 
      { 
        apiVersion: "v1beta" 
      }
    );

    console.log('Formatting history...');
    const formattedHistory = formatHistory(history);
    const fullHistory: Content[] = [...formattedHistory, { role: "user", parts: [{ text: message }] }];
    
    console.log('Generating content...');
    const result = await model.generateContent({ 
      contents: fullHistory 
    });
    
    console.log('Content generated, processing response...');
    const response = result.response;
    const text = response.text();
    
    const citationSources = response.candidates?.[0]?.citationMetadata?.citationSources ?? [];
    const sources = citationSources.map((source: CitationSource) => ({
      uri: source.uri,
      title: source.uri,
    }));

    console.log('Sending successful response');
    res.status(200).json({ text, sources });
    return; // Explicitly return void

  } catch (error) {
    console.error('Error in handler:', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    res.status(500).json({ 
      error: "Failed to generate response from the AI",
      details: errorMessage,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error instanceof Error ? error.stack : undefined
      })
    });
    return; // Explicitly return void
  }
}

export default withErrorHandling(handleChatRequest);


import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize the Google Generative AI client
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY is not set');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

// Safety settings for content generation
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// Types
interface ChatMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string } | string>;
}

interface ChatRequest {
  history: ChatMessage[];
  message: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', message: 'Only POST method is allowed' });
  }

  try {
    const { history = [], message } = req.body as ChatRequest;
    
    if (!message?.trim()) {
      return res.status(400).json({ error: 'Bad Request', message: 'Message cannot be empty' });
    }

    // Format the chat history
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: msg.parts.map(part => ({
        text: typeof part === 'string' ? part : part.text
      }))
    }));

    // Get the Gemini model with fallback to gemini-1.5-flash
    const modelName = process.env.GEMINI_MODEL_NAME || 'gemini-1.5-flash';
    console.log('Using model:', modelName);
    
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      safetySettings,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    // Start a chat session
    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    // Send the message and get the response
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    // Return the response
    return res.status(200).json({
      text,
      sources: []
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error instanceof Error ? error.message : 'An unknown error occurred' 
    });
  }
}

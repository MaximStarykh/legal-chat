import { VercelRequest, VercelResponse } from "@vercel/node";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  Content,
} from "@google/generative-ai";

// --- ENVIRONMENT VALIDATION ---
const apiKey = process.env.GEMINI_API_KEY;
const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

if (!apiKey?.trim()) {
  const errorMessage = 'CRITICAL: GEMINI_API_KEY environment variable is missing or empty';
  console.error(errorMessage);
  if (isProduction) {
    throw new Error(errorMessage);
  }
}

// Initialize the Gemini AI client
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

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

interface ChatResponse {
  text: string;
  sources: Array<{
    url: string;
    title: string;
    text: string;
  }>;
}

// Format chat history for the API
const formatHistory = (history: ChatMessage[]): Content[] => {
  return history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: msg.parts.map(part => ({
      text: typeof part === 'string' ? part : part.text
    }))
  }));
};

// Error handling middleware
const withErrorHandling = (handler: (req: VercelRequest, res: VercelResponse) => Promise<void>) => {
  return async (req: VercelRequest, res: VercelResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error('Unhandled error in API handler:', error);
      
      const statusCode = 500;
      const errorMessage = 'Internal Server Error';
      const errorDetails = error instanceof Error ? error.message : 'An unknown error occurred';
      
      res.status(statusCode).json({
        error: errorMessage,
        message: errorDetails,
        ...(process.env.NODE_ENV !== 'production' && {
          stack: error instanceof Error ? error.stack : undefined
        })
      });
    }
  };
};

// Main chat request handler
const handleChatRequest = async (req: VercelRequest, res: VercelResponse): Promise<void> => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    res.status(405).json({
      error: 'Method Not Allowed',
      message: 'Only POST requests are supported',
      allowedMethods: ['POST']
    });
    return;
  }

  // Validate request body
  if (!req.body) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Request body is required'
    });
    return;
  }

  const { history = [], message } = req.body as ChatRequest;

  // Validate message
  if (!message?.trim()) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Message is required and cannot be empty'
    });
    return;
  }

  try {
    if (!genAI) {
      throw new Error('Gemini API client is not properly initialized');
    }

    console.log('Processing chat request with message:', message.substring(0, 100) + '...');
    
    // Initialize the model
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL_NAME || 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.9,
        topP: 1,
        topK: 40,
        maxOutputTokens: 4096,
      },
      safetySettings,
    });

    // Start chat with history
    const chat = model.startChat({
      history: formatHistory(history),
      generationConfig: {
        maxOutputTokens: 4096,
      },
    });

    // Send message and get response
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    // For now, return empty sources array
    // You can implement citation extraction based on your needs
    const sources: Array<{url: string; title: string; text: string}> = [];

    // Send success response
    res.status(200).json({
      text,
      sources
    });

  } catch (error) {
    console.error('Error processing chat request:', error);
    
    // More specific error handling
    let statusCode = 500;
    let errorMessage = 'Failed to process chat request';
    let errorDetails = error instanceof Error ? error.message : 'Unknown error';
    
    // Handle specific error cases
    if (errorDetails.includes('API key')) {
      statusCode = 401;
      errorMessage = 'Invalid API key';
    } else if (errorDetails.includes('quota')) {
      statusCode = 429;
      errorMessage = 'API quota exceeded';
    } else if (errorDetails.includes('safety')) {
      statusCode = 400;
      errorMessage = 'Content policy violation';
    }
    
    res.status(statusCode).json({
      error: errorMessage,
      message: errorDetails,
      ...(process.env.NODE_ENV !== 'production' && {
        stack: error instanceof Error ? error.stack : undefined
      })
    });
  }
};

// Export the handler with error handling
export default withErrorHandling(handleChatRequest);

// Export types for client-side use
export type { ChatMessage, ChatRequest, ChatResponse };

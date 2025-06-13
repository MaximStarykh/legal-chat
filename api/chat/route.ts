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
  return async (req: VercelRequest, res: VercelResponse): Promise<void> => {
    // Helper function to send error response
    const sendErrorResponse = (statusCode: number, error: string, message: string) => {
      res.status(statusCode).json({ error, message });
    };

    try {
      await handler(req, res);
    } catch (error: any) {
      console.error('Unhandled error:', error);
      
      const statusCode = error.statusCode || 500;
      const errorMessage = error.error || 'Internal Server Error';
      const errorDetails = error.message || (error instanceof Error ? error.message : 'An unknown error occurred');
      
      sendErrorResponse(statusCode, errorMessage, errorDetails);
    }
  };
};

// Main chat request handler
const handleChatRequest = async (req: VercelRequest, res: VercelResponse): Promise<void> => {
  console.log('=== CHAT REQUEST HANDLER STARTED ===');
  
  // Helper function to send error response
  const sendErrorResponse = (statusCode: number, error: string, message: string) => {
    console.error(`Sending error response (${statusCode}):`, { error, message });
    res.status(statusCode).json({ error, message });
  };
  
  // Helper function to send success response
  const sendSuccessResponse = (data: { text: string; sources?: any[] }) => {
    console.log('Sending success response with data:', { 
      text: data.text.substring(0, 100) + (data.text.length > 100 ? '...' : ''),
      sourcesCount: data.sources?.length || 0
    });
    
    res.status(200).json({
      text: data.text,
      sources: data.sources || []
    });
  };
  console.log('Setting CORS headers');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request in chat handler');
    res.status(200).end();
    return;
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    const errorMsg = `Method ${req.method} not allowed`;
    console.error(errorMsg);
    res.setHeader('Allow', 'POST');
    sendErrorResponse(405, 'Method Not Allowed', 'Only POST method is allowed');
    return;
  }

  // Validate request body
  if (!req.body) {
    console.error('No request body provided');
    sendErrorResponse(400, 'Bad Request', 'Request body is required');
    return;
  }
  
  // Parse body if it's a string
  let requestBody: any;
  try {
    console.log('Request body type:', typeof req.body);
    requestBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    console.log('Parsed request body:', JSON.stringify(requestBody, null, 2));
  } catch (e) {
    const error = e as Error;
    console.error('Failed to parse request body:', error.message);
    console.error('Request body that failed to parse:', req.body);
    sendErrorResponse(400, 'Bad Request', 'Invalid JSON in request body');
    return;
  }
  
  const { history = [], message } = requestBody as ChatRequest;
  console.log('Extracted from request:', { 
    messageLength: message?.length || 0,
    historyLength: history?.length || 0 
  });
  
  // Validate message
  if (!message?.trim()) {
    console.error('Empty or invalid message received');
    sendErrorResponse(400, 'Bad Request', 'Message is required');
    return;
  }

  try {
    if (!genAI) {
      const errorMsg = 'Gemini API client is not properly initialized';
      console.error(errorMsg);
      sendErrorResponse(500, 'Server Error', errorMsg);
      return;
    }
    
    try {
      const modelName = process.env.GEMINI_MODEL_NAME || 'gemini-1.5-flash';
      console.log('Using model:', modelName);
      
      try {
        console.log('Initializing model with config:', {
          model: modelName,
          generationConfig: { 
            temperature: 0.9,
            maxOutputTokens: 1000,
          },
          safetySettings: safetySettings.map(s => ({
            category: s.category,
            threshold: s.threshold
          }))
        });

        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: { 
            temperature: 0.9,
            maxOutputTokens: 1000,
          }, 
          safetySettings 
        });
        
        console.log('Model initialized, starting chat...');
        
        // Convert history to the format expected by the API
        const chat = model.startChat({
          history: formatHistory(history),
        });

        console.log('Sending message to Gemini API...', {
          messageLength: message.length,
          historyLength: history.length
        });
        
        // Send the message and get the response
        const result = await chat.sendMessage(message);
        
        console.log('Received response from Gemini API, processing...');
        const response = await result.response;
        const text = response.text();
        
        console.log('Successfully processed response from Gemini API');

        // Send success response
        sendSuccessResponse({ text, sources: [] });
        return;
      } catch (modelError: any) {
        console.error('Model initialization or execution error:', {
          error: modelError,
          errorMessage: modelError.message,
          errorStack: modelError.stack,
          modelName,
          hasApiKey: !!apiKey,
          apiKeyPrefix: apiKey ? `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 3)}` : 'none'
        });
        
        // Check for specific model-related errors
        if (modelError.message?.includes('model')) {
          throw new Error(`Invalid model '${modelName}'. Please check your GEMINI_MODEL_NAME environment variable.`);
        }
        
        throw modelError; // Re-throw to be caught by the outer catch
      }
    } catch (apiError: any) {
      console.error('Gemini API Error:', {
        error: apiError,
        errorMessage: apiError?.message,
        errorStack: apiError?.stack,
        status: apiError?.response?.status,
        statusText: apiError?.response?.statusText,
        headers: apiError?.response?.headers,
        responseData: apiError?.response?.data,
        requestConfig: {
          url: apiError?.config?.url,
          method: apiError?.config?.method,
          headers: apiError?.config?.headers ? Object.keys(apiError.config.headers) : undefined,
          data: apiError?.config?.data ? JSON.parse(apiError.config.data) : undefined,
        },
        model: process.env.GEMINI_MODEL_NAME,
        apiKeyPresent: !!process.env.GEMINI_API_KEY,
        nodeEnv: process.env.NODE_ENV
      });
      
      let statusCode = apiError?.response?.status || 500;
      let errorMessage = apiError?.message || 'Failed to process chat request with Gemini API';
      
      // Handle specific error cases
      if (apiError?.response?.data?.error) {
        errorMessage = apiError.response.data.error.message || errorMessage;
      } else if (apiError.code === 'ENOTFOUND') {
        errorMessage = 'Failed to connect to Gemini API. Please check your internet connection.';
        statusCode = 503; // Service Unavailable
      } else if (apiError.code === 'ECONNABORTED') {
        errorMessage = 'Connection to Gemini API timed out. Please try again.';
        statusCode = 504; // Gateway Timeout
      } else if (apiError.message?.includes('model')) {
        errorMessage = `Model '${process.env.GEMINI_MODEL_NAME}' might not be accessible. Please verify the model name and your API key permissions.`;
        statusCode = 400; // Bad Request
      }
      
      sendErrorResponse(
        statusCode, 
        'Gemini API Error',
        errorMessage
      );
      return;
    }
  } catch (error: any) {
    console.error('Unexpected error in chat handler:', error);
    
    let errorMessage = 'An unexpected error occurred while processing your request';
    let errorDetails = error instanceof Error ? error.message : 'Unknown error';
    let statusCode = 500;
    
    if (errorDetails.includes('API key')) {
      statusCode = 401;
      errorMessage = 'Invalid API key';
    } else if (errorDetails.includes('quota')) {
      statusCode = 429;
      errorMessage = 'API quota exceeded';
    }
    
    sendErrorResponse(statusCode, errorMessage, errorDetails);
    return;
  }
};

// Export the handler with error handling
const handler = withErrorHandling(handleChatRequest);

// Export the handler for Vercel
export default async function(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle the request
  try {
    await handler(req, res);
  } catch (error) {
    console.error('Unhandled error in API route:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  }
};

// Export types for client-side use
export type { ChatMessage, ChatRequest, ChatResponse };

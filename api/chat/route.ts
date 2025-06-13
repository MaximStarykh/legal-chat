import { VercelRequest, VercelResponse } from '@vercel/node';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  Content,
} from '@google/generative-ai';

// --- GEMINI CLIENT SETUP ---
let genAI: GoogleGenerativeAI | null = null;
let cachedApiKey: string | null = null;

const getGeminiClient = (): GoogleGenerativeAI | null => {
  const currentKey = process.env.GEMINI_API_KEY?.trim();
  if (!currentKey) {
    return null;
  }

  if (!genAI || currentKey !== cachedApiKey) {
    try {
      genAI = new GoogleGenerativeAI(currentKey);
      cachedApiKey = currentKey;
      if (process.env.NODE_ENV === 'development') console.log('Gemini AI client initialized');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Failed to initialize Gemini AI client:', error);
      genAI = null;
    }
  }

  return genAI;
};

// Safety settings for content generation
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
  return history.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: msg.parts.map((part) => ({
      text: typeof part === 'string' ? part : part.text,
    })),
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
      if (process.env.NODE_ENV === 'development') console.error('Unhandled error:', error);

      const statusCode = error.statusCode || 500;
      const errorMessage = error.error || 'Internal Server Error';
      const errorDetails =
        error.message || (error instanceof Error ? error.message : 'An unknown error occurred');

      sendErrorResponse(statusCode, errorMessage, errorDetails);
    }
  };
};

// Main chat request handler
const handleChatRequest = async (req: VercelRequest, res: VercelResponse): Promise<void> => {
  if (process.env.NODE_ENV === 'development') console.log('=== CHAT REQUEST HANDLER STARTED ===');

  // Helper function to send error response
  const sendErrorResponse = (statusCode: number, error: string, message: string) => {
    if (process.env.NODE_ENV === 'development')
      console.error(`Sending error response (${statusCode}):`, { error, message });
    res.status(statusCode).json({ error, message });
  };

  // Helper function to send success response
  const sendSuccessResponse = (data: { text: string; sources?: any[] }) => {
    if (process.env.NODE_ENV === 'development')
      console.log('Sending success response with data:', {
        text: data.text.substring(0, 100) + (data.text.length > 100 ? '...' : ''),
        sourcesCount: data.sources?.length || 0,
      });

    res.status(200).json({
      text: data.text,
      sources: data.sources || [],
    });
  };
  if (process.env.NODE_ENV === 'development') console.log('Setting CORS headers');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    if (process.env.NODE_ENV === 'development') console.log('Handling OPTIONS preflight request in chat handler');
    res.status(200).end();
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') console.error('GEMINI_API_KEY is not configured');
    res.setHeader('Retry-After', '60');
    sendErrorResponse(
      503,
      'Server Configuration Error',
      'GEMINI_API_KEY environment variable is missing or empty'
    );
    return;
  }

  const gemini = getGeminiClient();
  if (!gemini) {
    sendErrorResponse(500, 'Server Configuration Error', 'Failed to initialize Gemini API client');
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    const errorMsg = `Method ${req.method} not allowed`;
    if (process.env.NODE_ENV === 'development') console.error(errorMsg);
    res.setHeader('Allow', 'POST');
    sendErrorResponse(405, 'Method Not Allowed', 'Only POST method is allowed');
    return;
  }

  // Log request details for debugging
  if (process.env.NODE_ENV === 'development')
    console.log('Request details:', {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body ? JSON.stringify(req.body).substring(0, 500) + '...' : 'empty',
    });

  // Validate request body with better error handling
  if (!req.body) {
    const errorMsg = 'No request body provided';
    if (process.env.NODE_ENV === 'development') console.error(errorMsg, { headers: req.headers });
    sendErrorResponse(400, 'Bad Request', errorMsg);
    return;
  }

  // Parse body if it's a string with better error handling
  let requestBody: any;
  try {
    if (process.env.NODE_ENV === 'development') console.log('Request body type:', typeof req.body);

    // If body is a string, parse it as JSON
    if (typeof req.body === 'string') {
      try {
        requestBody = JSON.parse(req.body);
      } catch (parseError) {
        if (process.env.NODE_ENV === 'development') console.error('Failed to parse JSON body:', parseError);
        sendErrorResponse(400, 'Bad Request', 'Invalid JSON in request body');
        return;
      }
    } else if (typeof req.body === 'object' && req.body !== null) {
      // Body is already an object (parsed by body parser middleware)
      requestBody = req.body;
    } else {
      if (process.env.NODE_ENV === 'development') console.error('Unexpected request body type:', typeof req.body);
      sendErrorResponse(400, 'Bad Request', 'Invalid request body format');
      return;
    }

    if (process.env.NODE_ENV === 'development')
      console.log(
        'Parsed request body:',
        JSON.stringify(
          {
            ...requestBody,
            message:
              requestBody?.message?.substring(0, 100) +
              (requestBody?.message?.length > 100 ? '...' : ''),
            historyLength: requestBody?.history?.length || 0,
          },
          null,
          2
        )
      );
  } catch (e) {
    const error = e as Error;
    if (process.env.NODE_ENV === 'development') console.error('Failed to process request body:', error);
    if (process.env.NODE_ENV === 'development') console.error('Request body that caused error:', req.body);
    sendErrorResponse(400, 'Bad Request', 'Failed to process request body');
    return;
  }

  const { history = [], message } = requestBody as ChatRequest;
  if (process.env.NODE_ENV === 'development')
    console.log('Extracted from request:', {
      messageLength: message?.length || 0,
      historyLength: history?.length || 0,
    });

  // Validate message with better error handling
  if (typeof message !== 'string' || !message.trim()) {
    const errorMsg = `Invalid message format. Expected non-empty string, got: ${typeof message}`;
    if (process.env.NODE_ENV === 'development') console.error(errorMsg, { message });
    sendErrorResponse(400, 'Bad Request', 'A non-empty message is required');
    return;
  }

  try {
    if (!gemini) {
      const errorMsg =
        'Gemini API client is not properly initialized. Please check your API key and configuration.';
      if (process.env.NODE_ENV === 'development')
        console.error(errorMsg, {
          hasApiKey: !!apiKey,
          apiKeyPrefix: apiKey ? `${apiKey.substring(0, 3)}...` : 'none',
          nodeEnv: process.env.NODE_ENV,
          model: process.env.GEMINI_MODEL_NAME,
        });
      sendErrorResponse(500, 'Server Configuration Error', errorMsg);
      return;
    }

    try {
      const modelName = process.env.GEMINI_MODEL_NAME || 'gemini-1.5-flash';
      if (process.env.NODE_ENV === 'development') console.log('Using model:', modelName);

      if (!modelName) {
        throw new Error('GEMINI_MODEL_NAME environment variable is not set');
      }

      try {
        const modelConfig = {
          model: modelName,
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 1000,
          },
          safetySettings: safetySettings.map((s) => ({
            category: s.category,
            threshold: s.threshold,
          })),
        };

        if (process.env.NODE_ENV === 'development')
          console.log('Initializing model with config:', JSON.stringify(modelConfig, null, 2));

        const model = gemini.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 1000,
          },
          safetySettings,
        });

        if (process.env.NODE_ENV === 'development') console.log('Model initialized, starting chat...');

        // Convert history to the format expected by the API
        const chat = model.startChat({
          history: formatHistory(history),
        });

        try {
          if (process.env.NODE_ENV === 'development')
            console.log('Sending message to Gemini API...', {
              messageLength: message.length,
              historyLength: history.length,
              historyPreview: history.slice(0, 2).map((h) => ({
                role: h.role,
                text:
                  typeof h.parts[0] === 'string'
                    ? h.parts[0].substring(0, 50) + '...'
                    : h.parts[0].text.substring(0, 50) + '...',
              })),
            });

          // Send the message and get the response
          const result = await chat.sendMessage(message);

          if (process.env.NODE_ENV === 'development') console.log('Received response from Gemini API, processing...');
          const response = await result.response;
          const text = response.text();

          if (process.env.NODE_ENV === 'development') console.log('Successfully processed response from Gemini API');

          // Log a small part of the response for debugging
          if (process.env.NODE_ENV === 'development')
            console.log(
              'Response preview:',
              text.substring(0, 100) + (text.length > 100 ? '...' : '')
            );

          // Send success response
          sendSuccessResponse({ text, sources: [] });
          return;
        } catch (sendError) {
          if (process.env.NODE_ENV === 'development')
            console.error('Error sending message to Gemini API:', {
              error: sendError,
              message: sendError.message,
              stack: sendError.stack,
              messageLength: message.length,
              historyLength: history.length,
            });
          throw sendError;
        }
      } catch (modelError: any) {
        if (process.env.NODE_ENV === 'development')
          console.error('Model initialization or execution error:', {
            error: modelError,
            errorMessage: modelError.message,
            errorStack: modelError.stack,
            modelName,
            hasApiKey: !!apiKey,
            apiKeyPrefix: apiKey
              ? `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 3)}`
              : 'none',
          });

        // Check for specific model-related errors
        if (modelError.message?.includes('model')) {
          throw new Error(
            `Invalid model '${modelName}'. Please check your GEMINI_MODEL_NAME environment variable.`
          );
        }

        throw modelError; // Re-throw to be caught by the outer catch
      }
    } catch (apiError: any) {
      if (process.env.NODE_ENV === 'development')
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
          nodeEnv: process.env.NODE_ENV,
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

      sendErrorResponse(statusCode, 'Gemini API Error', errorMessage);
      return;
    }
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') console.error('Unexpected error in chat handler:', error);

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
export default async function (req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Log incoming request
  if (process.env.NODE_ENV === 'development')
    console.log('Incoming request:', {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body ? JSON.stringify(req.body).substring(0, 500) + '...' : 'empty',
    });

  // Handle preflight
  if (req.method === 'OPTIONS') {
    if (process.env.NODE_ENV === 'development') console.log('Handling OPTIONS preflight request');
    res.status(200).end();
    return;
  }

  // Handle the request
  try {
    if (process.env.NODE_ENV === 'development') console.log('Processing request...');
    await handler(req, res);
    if (process.env.NODE_ENV === 'development') console.log('Request processed successfully');
  } catch (error) {
    if (process.env.NODE_ENV === 'development')
      console.error('Unhandled error in API route:', {
        error: error.message,
        stack: error.stack,
        method: req.method,
        url: req.url,
        body: req.body ? JSON.stringify(req.body).substring(0, 500) + '...' : 'empty',
      });

    // Ensure we haven't already sent a response
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        // Only include error details in development
        ...(process.env.NODE_ENV !== 'production' ? { details: error.message } : {}),
      });
    } else {
      if (process.env.NODE_ENV === 'development') console.error('Headers already sent, cannot send error response');
    }
  }
}

// Export types for client-side use
export type { ChatMessage, ChatRequest, ChatResponse };

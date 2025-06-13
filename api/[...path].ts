import { VercelRequest, VercelResponse } from '@vercel/node';
import chatHandler from './chat';

// This is a simple router for Vercel serverless functions
const handler = async (req: VercelRequest, res: VercelResponse) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    res.status(200).end();
    return;
  }

  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Request headers:', JSON.stringify(req.headers, null, 2));
  console.log('Request body:', req.body ? JSON.stringify(req.body, null, 2) : 'No body');

  try {

    // Handle /api/chat route
    if (req.url?.startsWith('/api/chat') || req.url === '/chat') {
      console.log('Routing to chat handler');
      return await chatHandler(req, res);
    }

    // Handle 404 for unknown routes
    res.status(404).json({
      error: 'Not Found',
      message: `The requested resource ${req.url} was not found.`
    });
  } catch (error) {
    console.error('Unhandled error in API handler:', error);
    
    const statusCode = 500;
    const errorMessage = 'Internal Server Error';
    const errorDetails = error instanceof Error ? error.message : 'An unknown error occurred';
    
    console.error(`Error details: ${errorDetails}`);
    if (error instanceof Error && error.stack) {
      console.error('Error stack:', error.stack);
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

export default handler;

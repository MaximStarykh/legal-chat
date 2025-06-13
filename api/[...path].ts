import { VercelRequest, VercelResponse } from '@vercel/node';
import chatHandler from './chat';

// This is a simple router for Vercel serverless functions
// It forwards all requests to the chat handler
const handler = async (req: VercelRequest, res: VercelResponse) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // For now, all requests go to the chat handler
  // You can add more routes here if needed
  return chatHandler(req, res);
};

export default handler;

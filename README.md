# Legal Chat

Legal Chat is a simple chat interface for obtaining quick legal information using Google Gemini. All communication with Gemini is handled through a serverless API to keep secrets secure.

## Getting Started

1. **Install dependencies**
   ```sh
   npm install
   ```
2. **Configure environment variables**
   - Copy `.env.example` to `.env`.
   - Provide a valid `GEMINI_API_KEY`.
   - Optional: set `VITE_API_URL=http://localhost:3001` for local API calls.
   - Adjust `GEMINI_MODEL_NAME` if needed.
3. **Start development servers**
   ```sh
   npm run dev
   ```
   This runs the Vercel serverless API on port `3001` and the Vite frontend on `http://localhost:3000`.
4. **Visit the app**
   Open <http://localhost:3000> in your browser.
5. **Production build**
   ```sh
   npm run build
   ```

## Project Structure

- `src/` – React components and hooks.
- `api/` – Serverless function for Gemini API requests.
- `src/store/` – Zustand state stores.

## License

[MIT](LICENSE)

## Deploying to Vercel

1. Install the Vercel CLI if you haven't already:
   ```sh
   npm install -g vercel
   ```
2. Run the deployment command and follow the prompts:
   ```sh
   vercel
   ```
   Set your `GEMINI_API_KEY` and any other variables in the Vercel dashboard.
3. After deployment, your API and frontend will be served from the same Vercel URL.

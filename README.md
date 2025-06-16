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
3. **Start the API server**
   ```sh
   npm install -g vercel # if not installed
   vercel dev --listen 3001
   ```
4. **Start the frontend** (in another terminal)
   ```sh
   npm run dev
   ```
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

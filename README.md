# Legal Chat

Legal Chat is a simple chat interface for obtaining quick legal information using Google Gemini. All communication with Gemini is handled through a serverless API to keep secrets secure.

## Getting Started

1. **Install dependencies**
   ```sh
   npm install
   ```
2. **Configure environment variables**
   - Copy `.env.example` to `.env`.
   - Provide a valid `GEMINI_API_KEY`. This key is used only on the server.
   - Optionally adjust `GEMINI_MODEL_NAME` and other settings.
3. **Development**
   ```sh
   npm run dev
   ```
4. **Production build**
   ```sh
   npm run build
   ```

## Project Structure

- `src/` – React components and hooks.
- `api/` – Serverless function for Gemini API requests.
- `src/store/` – Zustand state stores.

## License

[MIT](LICENSE)

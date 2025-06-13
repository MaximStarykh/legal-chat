# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`

2. Set up your environment:

   - Copy `.env.example` to `.env`
   - Provide `GEMINI_API_KEY` and a private `API_TOKEN` used for server requests. Never expose them client-side.

3. Build the project:
   `npm run build`

4. Run the app in development mode:
   `npm run dev`

## Internationalisation

UI strings are handled with `react-i18next`. Ukrainian translations live under `src/locales/uk/translation.json`.

## License

This project is licensed under the [MIT License](LICENSE).

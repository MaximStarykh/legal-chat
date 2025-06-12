# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`

2. Set up your environment:

   - Copy `.env.example` to `.env`
   - Add your Gemini API key to the `GEMINI_API_KEY` variable in an environment configuration for your deployment platform. The key is no longer exposed to the client.

3. Build the project:
   `npm run build`

4. Run the app in development mode:
   `npm run dev`

## License

This project is licensed under the [MIT License](LICENSE).

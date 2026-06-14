<img width="1300" height="620" alt="image" src="https://github.com/user-attachments/assets/853572fc-4242-4ffa-b8d9-1f6b515a1bd5" />


# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View the app: https://ai-form-filler-chrome-extension-598579038076.asia-southeast1.run.app/

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

   # AI Form Filler Extension

## Setup
1. Clone this repo.
2. Open Chrome Browser.
3. Go to `chrome://extensions/`.
4. Enable **Developer Mode** (top right toggle).
5. Click **Load unpacked**.
6. Select the `/ai-form-filler` folder.

## Configuration
1. Click extension icon.
2. Paste Gemini API Key into settings field.
3. Key save to `chrome.storage.local`. 
4. No hardcoding keys in source. Use popup UI.

## How it work
- `content.js` read DOM form fields.
- `popup.js` send fields to Gemini API.
- AI return JSON.
- `content.js` inject values into inputs.

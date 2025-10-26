# Gemini API Setup Guide

## Getting Your Gemini API Key

The TicketBuddy Copilot uses Google's Gemini 2.5 Flash API. Follow these steps to get your API key:

### Step 1: Visit Google AI Studio
Go to [Google AI Studio](https://makersuite.google.com/app/apikey)

### Step 2: Sign In
Sign in with your Google account

### Step 3: Create API Key
1. Click on "Create API Key" button
2. Select a Google Cloud project (or create a new one)
3. Click "Create API key in existing project" or "Create API key in new project"
4. Copy the generated API key

### Step 4: Add to Your Project
Open `edge-mcp-worker/.dev.vars` and replace `your_gemini_api_key_here` with your actual API key:

```
GITHUB_TOKEN=your_github_token
GITHUB_WEBHOOK_SECRET=temp_secret_for_local_dev_only
GEMINI_API_KEY=AIzaSy...your_actual_key_here
```

### Step 5: Restart the Server
After adding the API key, restart your backend server:

```bash
cd edge-mcp-worker
npm run dev
```

## Features of the Copilot

✅ **Context-Aware**: Knows what page you're on and your app state  
✅ **Helpful Guidance**: Provides step-by-step instructions  
✅ **Smart Assistance**: Can help with:
- Creating and managing tickets
- GitHub integration setup
- Understanding analytics
- Troubleshooting issues
- General app navigation

## Usage

Once set up, you'll see a purple floating button in the bottom-right corner of all pages. Click it to open the Copilot chat!

## API Limits

Gemini 2.5 Flash offers generous free tier limits:
- **Free Tier**: 15 requests per minute (RPM)
- **Rate Limit**: 1 million tokens per minute (TPM)

For most development use cases, this is more than sufficient!

## Troubleshooting

### "Failed to get response from Gemini API"
- Check that your API key is correct in `.dev.vars`
- Ensure the backend server has restarted after adding the key
- Verify your API key is active in Google AI Studio

### Copilot button not showing
- Make sure you're logged in (Auth0)
- Check browser console for errors
- Ensure frontend is running on correct port

## Security Note

⚠️ **Never commit your `.dev.vars` file to git!** It contains sensitive API keys.

The `.dev.vars` file is already in `.gitignore`, but always double-check before committing.


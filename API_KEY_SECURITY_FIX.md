# 🚨 CRITICAL SECURITY: API Key Exposed
# Your Gemini API key was logged in the browser console and is now public.
# Follow these steps IMMEDIATELY:

## Step 1: Revoke the Exposed Key
1. Go to https://aistudio.google.com/app/apikey
2. Find the key: `AIzaSyC424S-HHeYt7Fio20xGyaCimKRq-6oh64`
3. Click the trash icon to delete/revoke it

## Step 2: Generate New API Key
1. In Google AI Studio, click "Create API Key"
2. Copy the new key (it will start with "AIzaSy...")
3. **NEVER log or expose this key publicly**

## Step 3: Update Your Code
1. Open `visit_runtime_config.js`
2. Replace `"REPLACE_WITH_NEW_API_KEY"` with your new key
3. Save the file

## Step 4: Test the Fix
1. Start your dev server: `npm run dev`
2. Open http://localhost:5175
3. Try chatting with Nashmi
4. Check console logs - you should see:
   - "AI Model Selected: gemini-2.5-flash" (or similar)
   - "Successfully got response from gemini-2.5-flash"

## Why This Happened
- API keys in runtime config are exposed to browser console
- Never log full API keys in production
- Use environment variables for sensitive data

## Security Best Practices Going Forward
- Store API keys in `.env` files (not committed to git)
- Use different keys for development/production
- Rotate keys regularly
- Monitor API usage for unauthorized access
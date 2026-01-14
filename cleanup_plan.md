# Cleanup Plan

The following files and folders are no longer needed and can be safely deleted:

- `jordan-hotels-app/api/chatbot_logic.js`: This file contained the local chatbot logic, which has been replaced by the Gemini API implementation.
- `jordan-hotels-app/lambda/chat`: This folder contained a lambda function for the chatbot, which is no longer used. The new implementation uses a Vercel serverless function.
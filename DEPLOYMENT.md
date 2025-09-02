# Render Deployment Guide

## Prerequisites
- GitHub repository with your code
- Render account (free tier available)
- Gemini API key

## Deployment Steps

### 1. Push Code to GitHub
Make sure all your code is committed and pushed to a GitHub repository.

### 2. Create New Web Service on Render
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select your AI chatbot repository

### 3. Configure Service Settings
- **Name**: `ai-chatbot` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

### 4. Set Environment Variables
In the Render dashboard, add these environment variables:
- `NODE_ENV` = `production`
- `GEMINI_API_KEY` = `your_actual_gemini_api_key_here`

### 5. Deploy
Click "Create Web Service" and wait for deployment to complete.

## Project Structure for Render
```
ai-chatbot/
├── client/          # React frontend
├── server/          # Express backend
├── render.yaml      # Render configuration
├── package.json     # Root package.json with build scripts
└── DEPLOYMENT.md    # This file
```

## How It Works
1. Render runs `npm run build` which:
   - Installs client dependencies
   - Builds React app to `client/dist/`
   - Installs server dependencies
2. Render runs `npm start` which starts the Express server
3. Server serves React build files and handles API routes
4. All requests to `/api/*` go to Express backend
5. All other requests serve the React app

## Troubleshooting
- Check Render logs for build/runtime errors
- Ensure GEMINI_API_KEY is set correctly
- Verify all dependencies are in package.json files

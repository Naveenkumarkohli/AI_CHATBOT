# AI Chatbot with Google Gemini API

A modern AI chatbot built with React and Node.js, powered by Google Gemini API for intelligent conversations.

## 🚀 Features

- **Real-time AI Chat**: Powered by Google Gemini 1.5 Flash
- **Modern UI**: Clean, responsive React interface
- **Robust Error Handling**: Fallback responses when API is unavailable
- **Retry Logic**: Automatic retries for network failures
- **Secure**: API keys stored in environment variables

## 🛠️ Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **AI**: Google Gemini API
- **Styling**: CSS with modern design

## 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Naveenkumarkohli/AI_CHATBOT.git
   cd AI_CHATBOT
   ```

2. **Install dependencies:**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Set up environment variables:**
   
   Create `server/.env` file:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=5001
   ```

4. **Get your Gemini API key:**
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a free API key
   - Enable the Generative Language API in Google Cloud Console

## 🚀 Running the Application

1. **Start the server:**
   ```bash
   cd server
   npm start
   ```

2. **Start the client (in a new terminal):**
   ```bash
   cd client
   npm run dev
   ```

3. **Open your browser:**
   - Go to `http://localhost:5173`
   - Start chatting with your AI assistant!

## 📁 Project Structure

```
AI_CHATBOT/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   └── App.jsx         # Main app component
│   └── package.json
├── server/                 # Node.js backend
│   ├── server.js          # Express server
│   ├── .env               # Environment variables
│   └── package.json
├── netlify/               # Netlify deployment files
│   └── functions/
└── README.md
```

## 🔑 Environment Variables

- `GEMINI_API_KEY`: Your Google Gemini API key
- `PORT`: Server port (default: 5001)
- `VITE_API_BASE`: Client API base URL (default: http://localhost:5001)

## 🌟 API Features

- **Smart Retry Logic**: Automatically retries failed requests
- **Fallback Responses**: Graceful handling when AI API is unavailable
- **Detailed Logging**: Comprehensive logs for debugging
- **CORS Support**: Cross-origin requests enabled

## 🔧 Troubleshooting

**Common Issues:**

1. **API Key Issues:**
   - Ensure Gemini API key is valid
   - Enable Generative Language API in Google Cloud Console

2. **Port Conflicts:**
   - Server runs on port 5001
   - Client runs on port 5173

3. **Network Errors:**
   - Check internet connection
   - Retry logic handles temporary failures

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to fork this repository and submit pull requests for improvements!

## 📞 Support

If you encounter any issues, please open an issue on GitHub.

---

**Built with ❤️ using Google Gemini AI**

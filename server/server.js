const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

// ✅ Only Gemini API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
console.log("GEMINI_API_KEY:", GEMINI_API_KEY ? "Loaded ✅" : "Missing ❌");
console.log("Starting server setup...");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
}

const PORT = process.env.PORT || 5002;

// Health check
app.get("/api/health", (req, res) => res.json({ ok: true }));

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    console.log("📨 Received request:", { messageCount: messages.length });

    const lastMessage = messages[messages.length - 1];
    const prompt = lastMessage.content;
    console.log("🔤 Formatted prompt:", prompt);

    if (GEMINI_API_KEY && GEMINI_API_KEY !== "your_gemini_api_key_here" && GEMINI_API_KEY !== "paste_your_actual_gemini_api_key_here") {
      for (let attempt = 1; attempt <= 3; attempt++) {
        console.log(`🔍 Attempting Gemini API call (attempt ${attempt}/3)...`);
        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
          console.log("🌐 Gemini URL:", geminiUrl.replace(GEMINI_API_KEY, "***"));

          const geminiRes = await fetch(geminiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: prompt }]
              }]
            }),
            timeout: 10000
          });

          console.log("🤖 Gemini Response status:", geminiRes.status);

          const responseText = await geminiRes.text();
          console.log("🤖 Gemini Raw response:", responseText);

          let geminiData;
          try {
            geminiData = JSON.parse(responseText);
          } catch (parseError) {
            console.error("❌ Gemini JSON parse error:", parseError.message);
            throw new Error(`Invalid JSON response: ${responseText}`);
          }

          if (geminiRes.ok && geminiData.candidates && geminiData.candidates[0]) {
            const text = geminiData.candidates[0].content.parts[0].text;
            console.log("✅ Gemini response:", text);
            return res.json({ text: text || "I couldn't generate a response. Please try again." });
          } else if (geminiRes.status === 403) {
            console.log("❌ Gemini API 403 - service still activating, using fallback");
            break;
          } else {
            console.log("❌ Gemini API failed or no candidates returned:", geminiData);
            if (attempt === 3) break;
          }
        } catch (geminiError) {
          console.error(`❌ Gemini API Error (attempt ${attempt}):`, geminiError.message);
          if (attempt < 3 && (geminiError.message.includes("ENOTFOUND") || geminiError.message.includes("timeout"))) {
            console.log("⏳ Retrying in 1 second...");
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          break;
        }
      }
    } else {
      console.log("⚠️ Gemini API key not properly configured, using fallback");
    }

    // Fallback responses
    const fallbackResponses = [
      "Hello! I'm your AI assistant. How can I help you today?",
      "Hi there! I'm here to chat and assist you with any questions.",
      "Hey! Thanks for reaching out. What would you like to talk about?",
      "Greetings! I'm ready to help you with whatever you need.",
      "Hello! I'm here and ready to assist you. What's on your mind?"
    ];

    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    console.log("🔄 Using fallback response:", randomResponse);

    res.json({ text: randomResponse });
  } catch (err) {
    console.error("💥 Server error:", err);
    res.status(500).json({ error: `Server error: ${err.message}` });
  }
});

// Catch-all handler: send back React's index.html file for any non-API routes
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);

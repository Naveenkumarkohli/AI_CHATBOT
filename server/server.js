import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
console.log("HF_API_KEY:", HF_API_KEY ? "Loaded ✅" : "Missing ❌");
console.log("GEMINI_API_KEY:", GEMINI_API_KEY ? "Loaded ✅" : "Missing ❌");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/api/health", (req, res) => res.json({ ok: true }));

// Test endpoint to verify HF API key
app.get("/api/test-hf", async (req, res) => {
  try {
    const testRes = await fetch("https://api-inference.huggingface.co/models/bigscience/bloom-560m", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: "Hello",
        parameters: { max_new_tokens: 10 }
      }),
    });
    
    const responseText = await testRes.text();
    console.log("🧪 Test API Response:", testRes.status, responseText);
    
    res.json({ 
      status: testRes.status, 
      response: responseText,
      apiKeyPresent: !!HF_API_KEY 
    });
  } catch (err) {
    console.error("🧪 Test API Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    console.log("📨 Received request:", { messageCount: messages.length });

    // Format messages for Gemini
    const lastMessage = messages[messages.length - 1];
    const prompt = lastMessage.content;

    console.log("🔤 Formatted prompt:", prompt);

    // Try Gemini API with retry logic
    console.log("🔍 Checking Gemini API key:", GEMINI_API_KEY ? "Present" : "Missing");
    
    if (GEMINI_API_KEY && GEMINI_API_KEY !== "your_gemini_api_key_here" && GEMINI_API_KEY !== "paste_your_actual_gemini_api_key_here") {
      // Retry logic for network failures
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
                parts: [{
                  text: prompt
                }]
              }]
            }),
            timeout: 10000 // 10 second timeout
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
            return res.json({ text: text || "I apologize, but I couldn't generate a response. Please try again." });
          } else if (geminiRes.status === 403) {
            console.log("❌ Gemini API 403 - service still activating, using fallback");
            break; // Don't retry 403 errors
          } else {
            console.log("❌ Gemini API failed or no candidates returned:", geminiData);
            if (attempt === 3) break; // Last attempt
          }
        } catch (geminiError) {
          console.error(`❌ Gemini API Error (attempt ${attempt}):`, geminiError.message);
          if (attempt < 3 && (geminiError.message.includes('ENOTFOUND') || geminiError.message.includes('timeout'))) {
            console.log(`⏳ Retrying in 1 second...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          break;
        }
      }
    } else {
      console.log("⚠️ Gemini API key not properly configured, using fallback");
    }

    // Fallback responses when API fails
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

app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);

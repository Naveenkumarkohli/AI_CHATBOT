const fetch = require('node-fetch');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { messages } = JSON.parse(event.body);
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
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({ text: text || "I apologize, but I couldn't generate a response. Please try again." }),
            };
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
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ text: randomResponse }),
    };
  } catch (err) {
    console.error("💥 Server error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: `Server error: ${err.message}` }),
    };
  }
};

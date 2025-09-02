export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { model, messages } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages are required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.log('GEMINI_API_KEY not found, using fallback response');
      return res.json({
        text: "Hi! I'm your AI assistant. I'm currently running in demo mode. To enable full AI capabilities, please configure the Gemini API key."
      });
    }

    // Get the latest user message
    const userMessage = messages[messages.length - 1];
    const prompt = userMessage.content || userMessage.text || String(userMessage);

    console.log('Calling Gemini API with prompt:', prompt);

    // Retry logic for network issues
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: prompt
                }]
              }]
            })
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Gemini API error (attempt ${attempt}):`, response.status, errorText);
          
          if (response.status === 403) {
            return res.json({
              text: "I'm having trouble accessing the AI service. Please check that the Gemini API is enabled in your Google Cloud project."
            });
          }
          
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('Gemini API response received');

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
          const aiResponse = data.candidates[0].content.parts[0].text;
          return res.json({ text: aiResponse });
        } else {
          throw new Error('Invalid response format from Gemini API');
        }

      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error.message);
        lastError = error;
        
        if (attempt < 3 && (error.code === 'ENOTFOUND' || error.code === 'ECONNRESET')) {
          console.log(`Retrying in 1 second... (attempt ${attempt + 1}/3)`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        break;
      }
    }

    // If all retries failed, return fallback
    console.error('All Gemini API attempts failed:', lastError.message);
    return res.json({
      text: "I'm experiencing some technical difficulties right now. Please try again in a moment, or check your internet connection."
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      text: "Sorry, I'm having trouble processing your request right now. Please try again later."
    });
  }
}

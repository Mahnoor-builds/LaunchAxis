export default async function handler(req, res) {
  // 1. Approve browser CORS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. Only allow POST requests for the actual AI data
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured on server' });
    }

    // 3. Connect to the CORRECT model: gemini-1.5-flash
    const googleRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await googleRes.json();

    // 4. Safety Net: Catch Google's rejections (like High Demand) before it crashes
    if (!googleRes.ok || data.error) {
      const errorMsg = data.error?.message || "Google AI request failed.";
      
      if (errorMsg.toLowerCase().includes("high demand") || googleRes.status === 503) {
        return res.status(503).json({ error: "The AI architects are experiencing extreme traffic. Please wait 30 seconds and try again." });
      }
      
      return res.status(500).json({ error: `AI Engine Error: ${errorMsg}` });
    }

    // 5. Send the clean text back to your React frontend
    const textOutput = data.candidates[0].content.parts[0].text;
    return res.status(200).json({ text: textOutput });

  } catch (error) {
    console.error("Vercel Serverless Error:", error);
    return res.status(500).json({ error: "Backend network crash: " + error.message });
  }
}
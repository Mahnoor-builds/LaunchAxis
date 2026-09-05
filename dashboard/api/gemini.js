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

    // 3. Make the call to Google Gemini using the active 3.5 model
    const googleRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await googleRes.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    // 4. Send the clean text back to your React frontend
    const textOutput = data.candidates[0].content.parts[0].text;
    return res.status(200).json({ text: textOutput });

  } catch (error) {
    console.error("Vercel Serverless Error:", error);
    return res.status(500).json({ error: 'Failed to generate content' });
  }
}
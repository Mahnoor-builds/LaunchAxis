export default async function handler(req, res) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 2. Grab the prompt sent from your React frontend
    const { prompt } = req.body;
    
    // 3. Securely grab the API key from Vercel's environment variables
    // Notice it no longer has "REACT_APP_" in front of it!
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured on server' });
    }

    // 4. Make the call to Google Gemini
    const googleRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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

    // 5. Send the clean text back to your React frontend
    const textOutput = data.candidates[0].content.parts[0].text;
    return res.status(200).json({ text: textOutput });

  } catch (error) {
    console.error("Vercel Serverless Error:", error);
    return res.status(500).json({ error: 'Failed to generate content' });
  }
}
export default async function handler(req, res) {
  // 1. Only allow POST requests for security
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { domain } = req.body;

  if (!domain) {
    return res.status(400).json({ error: 'Domain parameter is required.' });
  }

  try {
    // 2. Securely pull the key from Vercel's environment variables
    const apiKey = process.env.API_NINJAS_KEY;

    if (!apiKey) {
      throw new Error('API Ninjas Key is missing from server environment.');
    }

    // 3. Ping API Ninjas securely from the backend
    const response = await fetch(`https://api.api-ninjas.com/v1/whois?domain=${encodeURIComponent(domain)}`, {
      headers: {
        'X-Api-Key': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`API Ninjas rejected the request (Status: ${response.status})`);
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Domain Check Server Error:', error);
    return res.status(500).json({ error: 'Failed to communicate with the domain registry.' });
  }
}
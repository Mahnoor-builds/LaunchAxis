export default async function handler(req, res) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Search keyword is required.' });
  }

  try {
    // 2. Securely pull the key from Vercel's environment variables
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;

    if (!accessKey) {
      throw new Error('Unsplash Access Key is missing from server environment.');
    }

    // 3. Ping Unsplash securely from the backend
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`, 
      {
        headers: {
          'Authorization': `Client-ID ${accessKey}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash rejected the request (Status: ${response.status})`);
    }

    const data = await response.json();

    // 4. Return the image URL to the frontend
    if (data.results && data.results.length > 0) {
      return res.status(200).json({ url: data.results[0].urls.regular });
    } else {
      return res.status(404).json({ error: 'No images found for this keyword.' });
    }

  } catch (error) {
    console.error('Unsplash Server Error:', error);
    return res.status(500).json({ error: 'Failed to communicate with the image server.' });
  }
}
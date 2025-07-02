// Vercel serverless function to handle all API routes
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // For now, proxy to our working Cloudflare Worker
    const backendUrl = 'https://attendance-api-backup.lizhien277.workers.dev';
    const path = req.query.path.join('/');
    const url = `${backendUrl}/${path}`;
    
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization || '',
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.text();
    res.status(response.status).json(data ? JSON.parse(data) : {});
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy server error' });
  }
} 
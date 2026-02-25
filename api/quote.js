export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch('https://api.protectgroup.com/test/dynamic/quote', {
      method: 'POST',
      headers: {
        'Content-Type':       'application/json',
        'x-pg-client-id':     req.headers['x-pg-client-id'] ?? '',
        'x-pg-client-secret': req.headers['x-pg-client-secret'] ?? '',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

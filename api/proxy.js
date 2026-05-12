export default async function handler(req, res) {
    // req.url contiene la ruta original que pidió Apps Script
    // (gracias al rewrite de vercel.json) — ejemplo: /users/@me
    const targetUrl = `https://discord.com/api/v10${req.url}`;

    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': req.headers['user-agent'] || 'DiscordBot (https://vercel.com, 1.0)'
    };
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }

    let body;
    if (!['GET', 'HEAD'].includes(req.method) && req.body !== undefined) {
      body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    try {
      const response = await fetch(targetUrl, { method: req.method, headers, body });
      const text = await response.text();
      res.status(response.status);
      res.setHeader('content-type', response.headers.get('content-type') || 'text/plain');
      res.send(text);
    } catch (error) {
      res.status(502).json({ error: 'Proxy error', message: error.message });
    }
  }

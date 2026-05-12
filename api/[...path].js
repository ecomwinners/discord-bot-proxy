export default async function handler(req, res) {
    const pathArray = req.query.path || [];
    const pathString = Array.isArray(pathArray) ? pathArray.join('/') : pathArray;

    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(req.query)) {
      if (key === 'path') continue;
      if (Array.isArray(value)) {
        value.forEach(v => queryParams.append(key, v));
      } else {
        queryParams.set(key, value);
      }
    }
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

    const targetUrl = `https://discord.com/api/v10/${pathString}${queryString}`;

    // Solo reenviar las cabeceras que Discord necesita.
    // Esto evita que cf-*, x-forwarded-* delaten el origen original.
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

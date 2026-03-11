const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = 3000;

const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
};

async function proxyPost(req, res, targetUrl, transformBody) {
  let raw = '';
  req.on('data', chunk => raw += chunk);
  req.on('end', async () => {
    try {
      let body = raw;
      if (transformBody) {
        const parsed = JSON.parse(raw);
        body = JSON.stringify(transformBody(parsed));
      }
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type':       'application/json',
          'x-pg-client-id':     req.headers['x-pg-client-id']     ?? '',
          'x-pg-client-secret': req.headers['x-pg-client-secret'] ?? '',
        },
        body,
      });
      const data = await response.json();
      res.writeHead(response.status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/quote') {
    return proxyPost(req, res, 'https://api.protectgroup.com/test/dynamic/quote');
  }

  if (req.method === 'POST' && req.url === '/api/sale') {
    return proxyPost(
      req, res,
      'https://api.protectgroup.com/test/dynamic/sale',
      ({ method, Method, ...rest }) => rest
    );
  }

  // Static files
  const filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(data);
  });
});

server.listen(PORT, () => console.log(`ztix → http://localhost:${PORT}`));

#!/usr/bin/env node
'use strict';

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT        = process.env.PORT || 3000;
const SCRIPT_PATH = path.join(__dirname, 'scripts', 'install-skills.sh');

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  if (url === '/api/install-skills') {
    fs.readFile(SCRIPT_PATH, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal server error: could not read install script\n');
        return;
      }
      res.writeHead(200, {
        'Content-Type':        'text/plain; charset=utf-8',
        'Cache-Control':       'no-store',
        'X-Content-Type-Options': 'nosniff',
      });
      res.end(data);
    });
    return;
  }

  if (url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found\n');
});

server.listen(PORT, () => {
  console.log(`interfacecraft API listening on http://localhost:${PORT}`);
  console.log(`  GET /api/install-skills  – returns the skill installer script`);
  console.log(`  GET /health              – health check`);
});

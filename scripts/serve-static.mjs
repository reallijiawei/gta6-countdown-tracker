import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { createPollState, recordVote, serializePolls } from './polls-core.mjs';

const root = join(process.cwd(), 'dist');
const port = Number(process.env.PORT || 4321);
let localPollState = createPollState();

const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

function resolvePath(url) {
  const pathname = decodeURIComponent(new URL(url, `http://127.0.0.1:${port}`).pathname);
  const safePath = normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  const target = join(root, safePath);

  if (existsSync(target) && statSync(target).isFile()) return target;
  if (existsSync(join(target, 'index.html'))) return join(target, 'index.html');
  return join(root, '404.html');
}

const server = createServer((request, response) => {
  if (request.url?.startsWith('/api/polls')) {
    const chunks = [];
    request.on('data', (chunk) => chunks.push(chunk));
    request.on('end', async () => {
      try {
        const upstream = await fetch('https://gta6-countdown-tracker.pages.dev/api/polls', {
          method: request.method,
          headers: {
            'content-type': request.headers['content-type'] || 'application/json',
            accept: 'application/json',
          },
          body: request.method === 'GET' || request.method === 'HEAD' ? undefined : Buffer.concat(chunks),
        });
        response.writeHead(upstream.status, { 'content-type': 'application/json; charset=utf-8' });
        response.end(await upstream.text());
      } catch {
        if (request.method === 'POST') {
          try {
            const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
            localPollState = recordVote(localPollState, body.pollId, body.optionId);
          } catch (error) {
            response.writeHead(400, { 'content-type': 'application/json; charset=utf-8' });
            response.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Unable to record vote.' }));
            return;
          }
        }

        response.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
        response.end(JSON.stringify({ polls: serializePolls(localPollState), localFallback: true }));
      }
    });
    return;
  }

  const file = resolvePath(request.url || '/');
  if (!existsSync(file)) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }

  response.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' });
  createReadStream(file)
    .on('error', (error) => {
      console.error(error);
      if (!response.headersSent) response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('Server error');
    })
    .pipe(response);
});

server.on('clientError', (error, socket) => {
  console.error(error);
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

process.on('uncaughtException', (error) => {
  console.error(error);
});

process.on('unhandledRejection', (error) => {
  console.error(error);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Static preview running at http://127.0.0.1:${port}/`);
});

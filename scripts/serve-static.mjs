import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const root = join(process.cwd(), 'dist');
const port = Number(process.env.PORT || 4321);

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

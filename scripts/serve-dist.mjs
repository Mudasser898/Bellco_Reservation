/**
 * Serveur statique minimal pour dist/client.
 *
 * Mesurer la performance sur le serveur de développement n'aurait aucun sens :
 * les fichiers y sont non minifiés et le rechargement à chaud ajoute son
 * propre trafic. On sert donc la construction de production.
 *
 * Usage : node scripts/serve-dist.mjs [port]
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';

const RACINE = 'dist/client';
const PORT = Number(process.argv[2] ?? 4322);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json',
};

const existe = async (chemin) => {
  try {
    return (await stat(chemin)).isFile();
  } catch {
    return false;
  }
};

createServer(async (requete, reponse) => {
  const url = new URL(requete.url ?? '/', 'http://localhost');
  let chemin = join(RACINE, decodeURIComponent(url.pathname));

  if (!(await existe(chemin))) {
    const avecIndex = join(chemin, 'index.html');
    chemin = (await existe(avecIndex)) ? avecIndex : join(RACINE, '404.html');
  }

  try {
    const contenu = await readFile(chemin);
    reponse.writeHead(200, {
      'Content-Type': TYPES[extname(chemin)] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    reponse.end(contenu);
  } catch {
    reponse.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    reponse.end('Introuvable');
  }
}).listen(PORT, () => console.log(`dist/client servi sur http://localhost:${PORT}`));

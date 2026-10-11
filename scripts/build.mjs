/** Prepara dist/ apenas com arquivos públicos do site. Execute: node scripts/build.mjs */
import { copyFile, mkdir, readdir } from 'node:fs/promises';
import { dirname, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'dist');
const publicFiles = ['index.html', 'contact.html', 'images.js'];
// Capturas configuradas na raiz também precisam acompanhar a publicação.
const rootImages = (await readdir(root)).filter(name => /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(name));
publicFiles.push(...rootImages);

async function copyDirectory(relativePath, imagesOnly = false) {
  const entries = await readdir(resolve(root, relativePath), { withFileTypes: true });
  await mkdir(resolve(output, relativePath), { recursive: true });
  for (const entry of entries) {
    const relative = relativePath + '/' + entry.name;
    if (entry.isDirectory()) await copyDirectory(relative, imagesOnly);
    else if (!imagesOnly || /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(extname(entry.name))) {
      await copyFile(resolve(root, relative), resolve(output, relative));
    }
  }
}

await mkdir(output, { recursive: true });
for (const file of publicFiles) await copyFile(resolve(root, file), resolve(output, file));
await copyDirectory('css');
await copyDirectory('js');
await copyDirectory('assets', true);
console.log('Arquivos de publicação preparados em dist/.');

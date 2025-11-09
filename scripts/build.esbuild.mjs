// scripts/build.esbuild.mjs
import { build } from 'esbuild';
import { promises as fs } from 'fs';
import path from 'path';

const outdir = 'out';

(async () => {
  try {
    await fs.rm(outdir, { recursive: true, force: true });
  }
  catch (_) {}

  const result = await build({
    entryPoints: ['src/extension.ts'],
    bundle: true,
    platform: 'node',
    target: ['node18'],
    outdir,
    format: 'cjs',
    sourcemap: false,
    minify: true,
    metafile: true,
    external: ['vscode'],
    logLevel: 'info',
    treeShaking: true,
    legalComments: 'none',
  });

  const meta = result.metafile;
  if (meta) {
    const totalBytes = Object.values(meta.outputs).reduce((acc, o) => acc + (o.bytes || 0), 0);
    const summary = Object.entries(meta.outputs).map(([file, info]) => (
      `${file} :: ${(info.bytes/1024).toFixed(2)} KB`
    )).join('\n');
    await fs.writeFile(path.join(outdir, 'bundle-size.txt'), `TOTAL: ${(totalBytes/1024).toFixed(2)} KB\n${summary}`);
  }

  console.log('[build] done');
})();

// ESM ve CJS build'leri tek bir yerde toplanmalı
import { build } from 'esbuild';

// Tek build fonksiyonu
const buildAll = async () => {
  await build({
    entryPoints: ['src/index.js'],
    outfile: 'dist/cjs/index.cjs',
    format: 'cjs',
    platform: 'neutral'
  });

  await build({
    entryPoints: ['src/index.js'],
    outfile: 'dist/esm/index.js',
    format: 'esm',
    platform: 'neutral'
  });

  await build({
    entryPoints: ['src/bin/create-integrator.js'],
    outfile: 'bin/create-integrator.cjs',
    format: 'cjs',
    platform: 'node'
  });
};

buildAll();
import { build } from 'esbuild';

const buildAll = async () => {
  // Ana ESM build
  await build({
    entryPoints: ['src/index.js'],
    outfile: 'dist/esm/index.js',
    format: 'esm',
    bundle: true,
    platform: 'browser',
    external: ['axios', 'sweetalert2'],
    minify: true,
    logLevel: 'info'
  });

  // Ana CJS build
  await build({
    entryPoints: ['src/index.js'],
    outfile: 'dist/cjs/index.cjs',
    format: 'cjs',
    bundle: true,
    platform: 'node',
    external: ['axios', 'sweetalert2'],
    minify: true,
    logLevel: 'info'
  });

  // CLI CJS build
  await build({
    entryPoints: ['src/bin/create-integrator.cjs'],
    outfile: 'dist/cjs/bin/create-integrator.cjs',
    format: 'cjs',
    platform: 'node',
    bundle: true
  });

  // CLI ESM build
  await build({
    entryPoints: ['src/bin/create-integrator.mjs'],
    outfile: 'dist/esm/bin/create-integrator.js',
    format: 'esm',
    platform: 'node',
    bundle: true
  });
};

buildAll();
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import babel from '@rollup/plugin-babel';

const isProduction = process.env.NODE_ENV === 'production';

export default [{
  // Ana Modül
  input: 'src/index.js',
  output: [
    {
      dir: 'dist/esm',
      format: 'esm',
      preserveModules: true,
      exports: 'named',
      plugins: [ // SADECE ÇIKTI BAZINDA
        terser({
          format: {
            comments: false
          }
        })
      ]
    },
    {
      dir: 'dist/cjs',
      format: 'cjs',
      exports: 'named',
      preserveModules: true,
      plugins: [ // SADECE ÇIKTI BAZINDA
        terser({
          format: {
            comments: false
          }
        })
      ]
    }
  ],
  plugins: [
    nodeResolve(),
    commonjs(),
    terser({
      format: {
        comments: false,
        // UTF-8 kodlamayı zorla
        ascii_only: true
      }
    }),
    babel({ 
      babelHelpers: 'runtime',
      skipPreflightCheck: true,
      exclude: 'node_modules/**',
      presets: [['@babel/preset-env', { 
        modules: false,
        targets: { esmodules: true }
      }]]
    })
  ],
  external: [
    'axios', 
    'sweetalert2',
    /@babel\/runtime-corejs3/,
    'core-js',
    '@babel/runtime-corejs3',
    '@babel/runtime-corejs3/core-js-stable/*',
    '@babel/runtime-corejs3/helpers/*',
    '@babel/runtime-corejs3/core-js-stable/instance/bind',
    '@babel/runtime-corejs3/core-js-stable/object/assign'
]
},
{
  input: 'src/bin/create-integrator.js',
  output: {
    file: "dist/cjs/bin/create-integrator.cjs",
    format: "cjs",
    banner: "#!/usr/bin/env node",
    exports: "auto",
    sourcemap: false
  },
  plugins: [
    nodeResolve(),
    commonjs()
  ]
}
];
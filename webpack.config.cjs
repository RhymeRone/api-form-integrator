const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'integrator.cdn.js',
    library: {
      name: 'ApiFormIntegrator',
      type: 'umd',
      export: 'default'
    },
    globalObject: 'typeof self !== "undefined" ? self : this'
  },
  resolve: {
    extensions: ['.js', '.cjs', '.mjs'] // Uzantıları belirttik
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  externals: {
    axios: {
      commonjs: 'axios',
      commonjs2: 'axios',
      amd: 'axios',
      root: 'axios'
    },
    sweetalert2: {
      commonjs: 'sweetalert2',
      commonjs2: 'sweetalert2',
      amd: 'sweetalert2',
      root: 'Swal'
    }
  }
};
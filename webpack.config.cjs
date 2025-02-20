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
    globalObject: 'this'
  },
  resolve: {
    extensions: ['.js']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            configFile: './babel.config.cjs'
          }
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
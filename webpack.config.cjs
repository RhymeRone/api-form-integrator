const path = require('path');

module.exports = {
  entry: './src/index.js', // Giriş dosyası
  output: {
    path: path.resolve(__dirname, 'dist'), // Çıktı dizini
    filename: 'integrator.cdn.js', // Çıktı dosyası adı
    library: 'ApiFormIntegrator', // Global değişken adı
    libraryTarget: 'umd', // UMD formatı
    globalObject: 'this', // Tarayıcı ve Node.js uyumluluğu
  },
  externals: {
    axios: 'axios',
    sweetalert2: 'Swal'
  },
  module: {
    rules: [
      {
        test: /\.js$/, // .js uzantılı dosyaları işle
        exclude: /node_modules/, // node_modules klasörünü hariç tut
        use: {
          loader: 'babel-loader', // Babel kullan
          options: {
            presets: ['@babel/preset-env']
          }
        },
      },
    ],
  },
}; 
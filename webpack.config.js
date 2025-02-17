const path = require('path');

module.exports = {
  entry: './src/index.js', // Giriş dosyası
  output: {
    path: path.resolve(__dirname, 'dist'), // Çıktı dizini
    filename: 'index.js', // Çıktı dosyası adı
    library: 'ApiFormIntegrator', // Global değişken adı
    libraryTarget: 'umd', // UMD formatı
    globalObject: 'this', // Tarayıcı ve Node.js uyumluluğu
  },
  module: {
    rules: [
      {
        test: /\.js$/, // .js uzantılı dosyaları işle
        exclude: /node_modules/, // node_modules klasörünü hariç tut
        use: {
          loader: 'babel-loader', // Babel kullan
        },
      },
    ],
  },
}; 
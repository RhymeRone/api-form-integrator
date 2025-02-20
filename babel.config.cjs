module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        esmodules: true,
        node: '14'
      },
      bugfixes: true,
      useBuiltIns: 'entry',
      corejs: '3.30',
      modules: false
    }]
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      corejs: 3,
      version: '^7.23.4'
    }]
  ]
};
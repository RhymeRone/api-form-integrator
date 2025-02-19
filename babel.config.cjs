module.exports = {
  env: {
    cjs: {
      presets: [
        ['@babel/preset-env', {
          modules: 'commonjs',
          targets: { node: '14' }
        }]
      ],
      plugins: [
        ['@babel/plugin-transform-modules-commonjs', {
          strict: true,
          allowTopLevelThis: false
        }]
      ]
    },
    esm: {
      presets: [
        ['@babel/preset-env', {
          modules: false,
          targets: { node: '14' }
        }]
      ]
    }
  }
};
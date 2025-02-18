module.exports = {
  presets: [
    ["@babel/preset-env", { 
      targets: { node: "14" },
      modules: "commonjs"
    }]
  ],
  plugins: [
    ["@babel/plugin-transform-modules-commonjs", {
      allowTopLevelThis: true // Global scope için gerekli
    }],
    "babel-plugin-add-module-exports"
  ]
};
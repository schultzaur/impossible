const path = require('path');

module.exports = {
  mode: "development",
  entry: {
    main: './app/index.js',
    worker: './app/worker.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    contentBase: path.join(__dirname),
    compress: true,
    port: 9000
  },
  resolve: {
    alias: {
      vue: 'vue/dist/vue.min.js'
    }
  }
};
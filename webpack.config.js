const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');

module.exports = {
  mode: "development",
  entry: {
    main: './app/index.js',
    worker: './app/worker.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'var',
    library: '[name]'
  },
  module: {
    rules: [      
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin()
  ],
  resolve: {
    alias: {
      vue: 'vue/dist/vue.min.js'
    }
  },
  devServer: {
    contentBase: path.join(__dirname),
    compress: true,
    port: 9000
  }
};
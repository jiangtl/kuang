var webpack = require('webpack');
var path = require('path');

var publicPath = 'http://localhost:3000/build/';
var hotMiddlewareScript = 'webpack-hot-middleware/client?reload=true';

module.exports = {
  entry: {
    app: ['./public/index.js', hotMiddlewareScript]
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './build'),
    publicPath: publicPath
  },
  devtool: 'eval-source-map',
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel-loader',
      query: {
        presets: ['es2015']
      }
    }, {
      test: /\.less$/,
      loader: 'style-loader!css-loader!less-loader'
    }, {
      test: /\.css$/,
      loader: 'style-loader!css-loader'
    }, {
      test: /\.(png|jpg)$/,
      loader: 'url-loader?limit=8192'
    }],    
    resolve: {
      extensions: ['', '.js', '.json', '.coffee'],
      alias: {
        d3: 'd3/build/d3.v3.min.js',
        echarts$: 'echarts/src/echarts.js',
        echarts: 'echarts/src',
        zrender$: 'zrender/src/zrender.js',
        zrender: 'zrender/src'
      }
    },
  },
  externals: {
    jquery: 'window.$'
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ]
}
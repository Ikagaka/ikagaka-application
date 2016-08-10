require('babel-core/register');

import webpack from 'webpack';
import path from 'path';

export default {
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules/,
      },
      {
        test: /\.json$/,
        loader: 'json',
      },
    ],
  },
  entry: {
    'ikagaka_application': './src/lib/ikagaka_application.js',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/dist',
    library: 'ikagakaApplication',
    libraryTarget: 'var',
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
//    new webpack.optimize.UglifyJsPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.ProvidePlugin({
      'Promise': 'bluebird'
    }),
  ],
  resolve: {
    alias: {
      'eventEmitter/EventEmitter': 'wolfy87-eventemitter/EventEmitter',
    },
  },
};

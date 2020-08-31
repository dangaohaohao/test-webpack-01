const path = require('path');
const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'none',
  entry: {
    'large-number': './utils/testBuild.js',
    'large-number.min': './utils/testBuild.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist'),
    library: 'largeNumber',
    libraryTarget: 'umd',
    libraryExport: 'default',
  },
  plugins: [new CleanWebpackPlugin()],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserWebpackPlugin({
        include: /\.min\.js$/,
      })
    ],
  }
};

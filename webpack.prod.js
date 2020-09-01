const path = require('path');
const webpack = require('webpack');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const {
  merge
} = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  output: {
    filename: '[name]_[chunkhash:8].js',
    path: path.join(__dirname, 'dist'),
  },
  plugins: [
    new TerserWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name]_[contenthash:8].css',
    }),
    new TerserWebpackPlugin(),
    // webpack4 中 会默认设置
    // new webpack.DefinePlugin({
    //   'process.env.NODE_ENV': JSON.stringify('production')
    // })
  ],
  devtool: 'none',
  // 只有构建失败时才会提示
  stats: "errors-only"
});

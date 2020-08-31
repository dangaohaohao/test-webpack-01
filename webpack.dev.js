const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const {
  merge
} = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  output: {
    filename: '[name]_[hash:8].js',
    path: path.join(__dirname, 'dist'),
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name]_[hash:8].css',
    }),
  ],
  // 热更新不输出实际文件，而是放在内存中，不用磁盘io，速度更快,不用手动刷新
  devServer: {
    contentBase: './dist',
    hot: true,
  },
  devtool: 'eval-source-map',
});

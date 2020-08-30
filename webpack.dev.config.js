const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: {
    // hello: './src/index.js',
    search: './src/search.js',
  },
  output: {
    filename: '[name]_[hash:8].js',
    path: path.join(__dirname, 'dist'),
  },
  module: {
    rules: [{
        test: /\.js$/,
        use: 'babel-loader',
        include: path.resolve(__dirname, './src'),
        exclude: path.resolve(__dirname, './node_modules'),
      },
      {
        test: /\.css$/,
        use: [
          // 'style-loader',
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            // options: {
            //   plugins: [
            //     // overrideBrowserslist 可以指定浏览器版本 使用人比例等等
            //     require('autoprefixer')({
            //       overrideBrowserslist: ['last 15 versions'],
            //     }),
            //   ],
            // },
          },
        ],
      },
      {
        test: /\.less$/,
        use: [
          // 'style-loader',
          MiniCssExtractPlugin.loader,
          'css-loader',
          'less-loader',
          {
            loader: 'postcss-loader',
            // options: {
            //   plugins: [
            //     // overrideBrowserslist 可以指定浏览器版本 使用人比例等等
            //     require('autoprefixer')({
            //       overrideBrowserslist: ['last 15 versions'],
            //     }),
            //   ],
            // },
          },
        ],
      },
      // {
      //   test: /\.(png|jpg|jpeg|svg|gif)$/,
      //   use: {
      //     loader: 'url-loader',
      //     options: {
      //       limit: 100000,
      //       output: './assets/'
      //     }
      //   }
      // },
      // {
      //   test: /\.(png|jpg|jpeg|svg|gif)$/,
      //   use: 'file-loader',
      // },
      {
        test: /\.(ttf|eot|woff|woff2|otf)$/,
        use: 'file-loader',
      },
      {
        test: /\.(png|jpg|jpeg|svg|gif)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 1100000,
            name: '[name]_[hash:8].[ext]',
            outputPath: 'assets/',
            publicPath: 'assets/',
          },
        }, ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      // 可以使用 ejs 模版语法
      template: path.join(__dirname, '/src/index.html'),
      filename: 'index.html',
      chunks: ['search'],
      inject: true,
      minify: {
        html5: true,
        minifyCSS: true,
        minifyJS: true,
        removeComments: false,
        collapseWhitespace: true,
        preserveLineBreaks: false,
      }
    }),
    new webpack.HotModuleReplacementPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name]_[hash:8].css',
    }),
    new OptimizeCssAssetsWebpackPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: require('cssnano'),
    }),
    new UglifyJsPlugin()
  ],
  // 热更新不输出实际文件，而是放在内存中，不用磁盘io，速度更快,不用手动刷新
  devServer: {
    contentBase: './dist',
    hot: true,
  },
  // watch: true, // 文件监听 轮训判断文件的最后编辑时间是否变化，如果发生变化，不会立即告诉监听者，而是先缓存起来，等 aggregateTimeout,缺点需要手动刷新
  // // 只有开启监听模式，watchOptions才有意义
  // watchOptions: {
  //   // 不监听的文件，支持正则匹配
  //   ignored: /node_modules/,
  //   // 监听到文件变化，等 3000 ms 再去执行
  //   aggregateTimeout: 3000,
  //   // 判断文件是否变化是通过不停询问系统指定文件有没有变化得到的，默认每秒访问1000次
  //   poll: 1000,
  // }
  // 关闭性能提示
  performance: {
    hints: false
  }
};

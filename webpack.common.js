const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const webpack = require('webpack');
const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const glob = require('glob');
// const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin');
// const TerserWebpackPlugin = require('terser-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

const ROOT_PATH = path.resolve(__dirname);
const ENTRY_FILE_REG = /src\/(.*)\/index\.js/;

const setMPA = () => {
  const entry = {};
  const htmlWebpackPlugins = [];

  const entryFiles = glob.sync(path.resolve(ROOT_PATH, './src/*/index.js'));

  entryFiles.map((entryFile) => {
    const match = entryFile.match(ENTRY_FILE_REG);
    const pageName = match && match[1];

    entry[pageName] = entryFile;
    htmlWebpackPlugins.push(
      new HtmlWebpackPlugin({
        template: path.join(__dirname, `/src/${pageName}/index.html`),
        filename: `${pageName}.html`,
        chunks: ['vendors', pageName],
        inject: true,
        minify: {
          html5: true,
          minifyCSS: true,
          minifyJS: true,
          removeComments: false,
          collapseWhitespace: true,
          preserveLineBreaks: false,
        },
      }),
    );
  });

  return {
    entry,
    htmlWebpackPlugins,
  };
};

const {
  entry,
  htmlWebpackPlugins
} = setMPA();

module.exports = {
  entry: entry,
  // output: {
  //   filename: '[name]_[chunkhash:8].js',
  //   path: path.join(__dirname, 'dist'),
  // },
  module: {
    rules: [{
        test: /\.js$/,
        use: 'babel-loader',
        // 加上 eslint-loader 会在构建阶段报错
        // use: ['babel-loader', 'eslint-loader'],
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
          // 'postcss-loader',
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
          // {
          //   loader: 'px2rem-loader',
          //   options: {
          //     // remUnit 是指 1 rem 对应 多少 px， 最好是设计稿 / 10, 比如这里最好是 750 的设计稿
          //     remUnit: 75,
          //     // 转换成 rem 后小数点位数
          //     remPrecision: 8,
          //   },
          // },
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
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name]_[hash:8].[ext]',
          },
        }, ],
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
    // new HtmlWebpackPlugin({
    //   // 可以使用 ejs 模版语法
    //   template: path.join(__dirname, '/src/index.html'),
    //   filename: 'index.html',
    //   chunks: ['search'],
    //   inject: true,
    //   minify: {
    //     html5: true,
    //     minifyCSS: true,
    //     minifyJS: true,
    //     removeComments: false,
    //     collapseWhitespace: true,
    //     preserveLineBreaks: false,
    //   },
    // }),
    new OptimizeCssAssetsWebpackPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: require('cssnano'),
    }),
    // new MiniCssExtractPlugin({
    //   filename: '[name]_[contenthash:8].css',
    // }),
    // new TerserWebpackPlugin(),
    // new webpack.HotModuleReplacementPlugin(),
    // new HtmlWebpackExternalsPlugin({
    //   externals: [{
    //       module: 'react',
    //       entry: 'https://now8.gtimg.com/now/lib/16.8.6/react.min.js',
    //       global: 'React',
    //     },
    //     {
    //       module: 'react-dom',
    //       entry: 'https://now8.gtimg.com/now/lib/16.8.6/react-dom.min.js',
    //       global: 'ReactDom',
    //     },
    //   ],
    // }),
    // new webpack.optimize.ModuleConcatenationPlugin(),
    new FriendlyErrorsWebpackPlugin(),
    function () {
      this.hooks.done.tap('done', (stats) => {
        if (stats.compilation.errors && stats.compilation.errors.length && process.argv.indexOf('--watch') == -1) {
          // console.log('build error');
          process.exit(1);
        }
      });
    }
  ].concat(htmlWebpackPlugins),
  // 热更新不输出实际文件，而是放在内存中，不用磁盘io，速度更快,不用手动刷新
  // devServer: {
  //   contentBase: './dist',
  //   hot: true,
  // },
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
    hints: false,
  },
  devtool: 'none',
  optimization: {
    splitChunks: {
      chunks: 'all',
      name: true,
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
        },
      },
    },
  },
};

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const glob = require('glob');
// const TerserWebpackPlugin = require('terser-webpack-plugin');

const ROOT_PATH = path.resolve(__dirname);
const ENTRY_FILE_REG = /src\/(.*)\/index-server\.js/;

const setMPA = () => {
  const entry = {};
  const htmlWebpackPlugins = [];

  const entryFiles = glob.sync(path.resolve(ROOT_PATH, './src/*/index-server.js'));

  entryFiles.map((entryFile) => {
    const match = entryFile.match(ENTRY_FILE_REG);
    const pageName = match && match[1];
    if (!pageName) return
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
  mode: 'production',
  entry: entry,
  output: {
    filename: '[name]-server.js',
    path: path.join(__dirname, 'dist'),
    libraryTarget: 'umd',
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
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader'
        ],
      },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'less-loader',
          'postcss-loader',
        ],
      },
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
    new OptimizeCssAssetsWebpackPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: require('cssnano'),
    }),
    new MiniCssExtractPlugin({
      filename: '[name]_[hash:8].css',
    }),
    // new TerserWebpackPlugin(),
  ].concat(htmlWebpackPlugins),
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

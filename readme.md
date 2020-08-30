# webpack 学习

#### 热更新

###### 热更新实现

- 配置 `watch: true`, 需要手动刷新
- webpack.HotModuleReplacementPlugin 和 webpack-dev-server 配置使用，不输出实际文件，而是放在内存中，不用磁盘 io，速度更快,不用手动刷新
- webpack-dev-middleware,将 webpack 的输出文件传输给服务器，适用于灵活定制的场景

```js
const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

const app = express();
const config = require('./webpack.dev.config.js');
const compiler = webpack(config);

app.use(
  webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
  }),
);

app.listen(3000, () => {
  console.log('运行在 3000 端口');
});
```

###### 热更新原理

- webpack compiler 将 js 编译成 bundle
- HMR Server 将热更新的文件输出给 HMR Runtime
- Bundle Server 提供在浏览器中访问的方式
- HMR Runtime 会被注入到浏览器中，更新文件的变化
- bundle.js 构建输出的文件

文件编辑器更新了文件，检测到文件系统中的编辑，webpack compiler 会进行打包，给 HMR Server，HMR Server 是在服务器，通过 websocket 跟 HMR Runtime 通信, HMR Runtime 在客户端，就会更新 Js Code

#### 文件指纹

- hash: 和整个项目的构建相关，只要项目有改动，整个项目构建的 hash 值就会变动
- chunkhash: 和 webpack 打包的 chunk 相关，不同的 entry 生成不同的 chunkhash 值
- contenthash: 根据文件内容来定义 hash，文件内容不变，则 contenthash 不变

###### 文件指纹使用

- 设置 output 的 fileName, 使用 [chunkhash]
- css 使用 [contenthash], 如果使用 style-loader css-loader, 实际上是把经过 css-loader 转化的文件，传给 style-loader,由 style-loader 插入到文件的 style 头部，因此并不会产生一个 css 文件，通常会使用 MiniCssExtractPlugin 来把 style-loader 中的 css 提取出来，提取出一个单独的文件, 所以设置在 MiniCssExtractPlugin 里面, 但是跟 style-loader 是互斥的，因为这个是把 css 提取出单独的文件，但是 style-loader 是将 css 插入，所以要把 style-loader 删掉, 加上 MiniCssExtractPlugin.loader
- 图片的文件指纹使用 [hash], 设置在 file-loader / url-loader 里面

````text
问题一：
```Cannot use [chunkhash] or [contenthash] for chunk in '[name][chunkhash:8].js' (use [hash] instead)```
css的contenthash, 以及js的chunkhash, 这个跟hotModuleReplacementPlugin有冲突导致的。mode已经改成了development仍然报错
将new webpack.HotModuleReplacementPlugin()这一段注释掉，就ok了
````

#### 兼容性

###### 浏览器前缀自动添加

- css3 前缀，原因还是因为各浏览器的标准还没有统一，可以通过在构建时期加上 css3 前缀来避免一些兼容性问题, 插件 postcss-loader / autoprefixer 配合使用 , postcss 跟 less, sass 不同， less, sass 是预处理器，打包前进行处理，然后处理好了文件，postcss 在处理 @see https://github.com/postcss/postcss
  - IE Trident(-ms)
  - 火狐 Geko(-moz)
  - 谷歌 Webkit(-webkit)
  - O Presto(-O)
- 使用 @see https://github.com/browserslist/browserslist#readme https://github.com/postcss/autoprefixer

###### 浏览器前缀设置

```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader", "postcss-loader"]
      }
    ]
  }
}
// 在 package.json 中配置  或者 .browserslistrc 文件中配置
  "browserslist": [
    "last 2 version",
    "> 1%",
    "iOS >= 7",
    "Android > 4.1",
    "Firefox > 20"
  ]
// postcss.config.js 配置文件
module.exports = {
  plugins: [
    require('autoprefixer'),
  ]
}

```

#### 页面适配

###### rem 适配

- rem 是相对单位，相对于根元素，而 px 是绝对单位

###### rem 适配设置

- px2rem-loader / lib-flexible 配合使用, px2rem 转，转换单位， 使用 lib-flexible 来计算当页面打开之后 rem 的值
- px2rem-loader 使用有问题，issues 作者回复使用 postcss 代替 @see https://github.com/Jinjiang/px2rem-loader/issues/18

```js
// 使用 px2rem-loader 一直报错 Error: undefined:7:3: missing '}' 作者回复使用 postcss 代替
{
  loader: 'px2rem-loader',
  options: {
  // remUnit 是指 1 rem 对应 多少 px， 最好是设计稿 / 10, 比如这里最好是 750 的设计稿
  remUnit: 75,
  // 转换成 rem 后小数点位数
  remPrecision: 8,
        },
},
// @todo 使用 postcss 代替

// @todo lib-flexible 手动找到下载的 lib-flexible 库，在头部内联进来，但是这样很不方便

```

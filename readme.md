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

```js
问题一：
Cannot use [chunkhash] or [contenthash] for chunk in '[name][chunkhash:8].js' (use [hash] instead)
css的contenthash, 以及js的chunkhash, 这个跟hotModuleReplacementPlugin有冲突导致的。mode已经改成了development仍然报错
将new webpack.HotModuleReplacementPlugin()这一段注释掉，就ok了
```

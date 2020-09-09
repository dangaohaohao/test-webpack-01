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

#### 资源内联

###### 资源内联意义

- 代码层面
  - 页面框架初始化相关脚本
  - 上报相关打点
  - css 内联避免页面闪动
- 请求层面: 减少 http 网络请求数
  - 小图片 / 字体内联 (url-loader)

###### 资源内联方法

- 使用 row-loader 来对 html, js 库等内联进来
- css 内联可以使用 style-loader, options 中 singleon: true, 它会把所有的 style 标签合并成一个, 如果是打包好的 css 代码，可以使用 html-inline-css-webpack-plugin

#### 多页面打包

- 一个 entry 一个页面和一个 new HtmlWebpackPlugin() ， 缺点： 每次新增 / 删除都需要修改 webpack.config.js 中的配置
- 利用 glob.sync

###### 多页面打包实现

```js
const glob = require('glob');

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
        chunks: [pageName],
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
```

#### Source Map 定位源代码

- Source Map 科普文 @see http://www.ruanyifeng.com/blog/2013/01/javascript_source_map.html
- webpack 文章 @see https://www.webpackjs.com/configuration/devtool/
- 开发环境开启，线上环境关闭，线上排查问题的时候，可以将 source map 上传到错误监控系统
- Source Map 关键字
  - eval: 使用 eval 包裹模块代码
  - source map: 产生 .map 文件
  - cheap: 不包含列信息
  - inline: 将.map 作为 DataUrl 嵌入, 不单独生成 .map 文件
  - module: 不包含 loader 的 source map

###### Source Map 配置

```js
// 在 webpack 的 devtool 中配置
devtool: 'eval-source-map',
```

#### 提取公共资源

- 一些公共资源是可以提取出来的，这样就不用重复打包, 比如 vue / react 的基础包
- 方法一: 使用 html-webpack-externals-plugin,像 react / react-dom, 可以是本地的文件或者通过 cdn 引入(模板中引入)，不打入 bundle 中, @see https://www.npmjs.com/package/html-webpack-externals-plugin
- 方法二: 使用 SplitChunksPlugin 进行公共脚本分离, webpack4 内置的，替代 CommonsChunkPlugin 插件, @see https://www.webpackjs.com/plugins/split-chunks-plugin/

```text
Chunks 参数说明
- async 异步引入的库进行分离(默认)
- initial 同步引入的库进行分离
- all 所有引入的库进行分离(推荐)
```

#### 摇树优化 tree shaking

```text
概念：一个模块可能有多个方法，只要其中的某个方法用到了，整个文件都会被打到 bundle 中去,
tree shaking 就是只把用到的方法打入 bundle, 没用到的方法会在 uglify 阶段被擦除掉

webpack 默认支持,  mode 为 production 的情况下会默认开启

要求是 es6 的语法，commonJs 的方式不支持

原理：DCE
if (false) {
  console.log('代码不会执行到');
}

代码不会被执行，不可到达
代码的结果不会被用到
代码只会影响死变量(只写不读)
```

###### tree shaking 原理

- 利用 es6 模块的特点
  - 只能作为模块顶层的语句出现
  - import 的模块名只能是字符串常量
  - import binding 是 immutable 的
- 代码擦除，uglify (使用 terser-webpack-plugin 代替)阶段删除无用代码
- 对模块代码进行静态分析，在编译阶段会分析哪些代码没有用到，增加注释来标记(-p / --optimize-minimize)，在 uglify 阶段通过标记来删除无用代码
- tree shaking 要求使用到的代码是不能有副作用的，如果有副作用，tree shaking 会失效
- 「副作用」的定义是，在导入时会执行特殊行为的代码，而不是仅仅暴露一个 export 或多个 export。举例说明，例如 polyfill，它影响全局作用域，并且通常不提供 export。
- @see https://www.webpackjs.com/guides/tree-shaking/

###### 问题点

```text
production 环境报错： Unexpected token: keyword «const» [index_1202ed92.js:163,0]

问题原因:
1，是 UglifyJS 不支持 ES6 的语法。
2，发现 uglifyjs-webpack-plugin 2.0 版本的 Release 日志中，明确提示重新切换回到 uglify-js，因为 uglify-es 被废弃了，如果需要 ES6 代码压缩，请使用 terser-webpack-plugin

解决方案
使用terser-webpack-plugin 替换 uglifyjs-webpack-plugin进行代码压缩。

1: 安装terser-webpack-plugin
npm install terser-webpack-plugin --save-dev
2: 引入terser-webpack-plugin
const TerserPlugin = require('terser-webpack-plugin');
3: 使用TerserPlugin替换UglifyJsPlugin, terserOptions替换uglifyOptions
其他参数基本一致。

@see https://github.com/webpack-contrib/terser-webpack-plugin
```

#### 多环境配置

- @see https://www.webpackjs.com/guides/production/
- 使用 webpack-merge 工具来合并
- 官网引入有点问题，应该是 const {merge} = require('webpack-merge'), webpack-merge 源码是暴露来一个对象

#### 模块转换分析

- 模块 -> 模块初始化函数
- 结论
  - 被 webpack 转换后的函数会带上一层包裹
  - import 会转换成 \_webpack_require
  - export 会转换成 \_webpack_exports

###### Scope hoisting 原理

```text
将所有模块代码按照引用顺序放在函数作用域里，然后适当地重命名以防止变量名冲突

对比：通过 scope hoisting 可以减少函数声明代码和内存开销
```

- webpack4 中 mode 为 production 会默认开启, webpack3 中还需要手动添加配置

```js
new webpack.optimize.ModuleConcatenationPlugin(),
```

#### 代码分割 动态 import

- 抽离相同代码到一个共享块
- 脚本懒加载, 使得初始下载的代码更小

###### 懒加载 js 脚本的方式

- commonJs: require.ensure
- ES6: 动态 import(需要 babel 转换) @babel/plugin-syntax-dynamic-import
- @see https://babeljs.io/docs/en/babel-plugin-syntax-dynamic-import/
- @see https://webpack.js.org/api/module-methods/#import

```js
// 返回一个 promise, webpack 采用的是 jsonp 的形式
// example
handleClick() {
  import('./testDynamic.js').then((Text) => {
    this.setState({
      Text,
    })
  })
}
```

#### webpack 结合 ESLint 使用

- ESLint 规范实践
  - Airbnb: eslint-config-airbnb (使用 react) / eslint-config-airbnb-base (不使用 react)
  - @see https://www.npmjs.com/package/eslint-config-airbnb
  - @see https://eslint.bootcss.com/docs/user-guide/configuring
- ESLint 落地实现
  - 和 CI/CD 系统集成
  - 和构建工具集成(webpack), 遇到语法问题, 构建不成功

###### ESLint 落地实现

- 方案一：构建阶段报错

  - `npm i eslint eslint-plugin-import eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y -D`
  - `npm i babel-eslint eslint-loader -D`
  - 转换 js 加上 eslint-loader 配置
  - 添加 .eslintrc.json 文件，进行配置

- 方案二：git add / git commit 钩子报错

  - 安装 husky `npm install husky -D`
  - 安装 lint-staged `npm install lint-staged -D`
  - 增加 npm script, 通过 lint-staged 增量检查修改的文件
  - @see https://www.npmjs.com/package/husky
  - @see https://www.npmjs.com/package/lint-staged

- 跳过校验方式: `add --no-verify to bypass`

```js
 "scripts": {
    "precommit": "lint-staged",
    "lint:staged": "eslint"
  },
  "lint-staged": {
    "*.{js,ts,tsx,jsx}": [
      "npm run lint:staged"
    ]
  },
  "husky": {
    "hooks": {
      "pre-commit": "echo test-pre-commit && lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS",
      "pre-push": "echo test-pre-push"
    }
  },
```

#### webpack 打包组件库和组件

- webpack 可以打包应用，也可以打包 js 库
- 打包 压缩 / 非压缩 版本
- 支持 AMD / CMD / ESM 模块引入
- @see https://www.webpackjs.com/guides/author-libraries/#%E6%9A%B4%E9%9C%B2-library
- @see https://www.webpackjs.com/configuration/output/#output-librarytarget
- @see https://webpack.js.org/configuration/optimization/

###### 发布到 npm 上

- 配置 description 字段
- 配置 prepublish 钩子，使发布的时候也进行打包
- npm login ... npm publish 进行发布

```js
// large-number 库打包
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/large-number.min.js');
} else {
  module.exports = require('./dist/large-number.js');
}
```

#### 服务端渲染

- 客户端渲染
  - 开始加载
  - html 加载成功后，加载数据
  - 数据加载成功，渲染成功开始，加载图片资源
  - 图片加载成功，页面可交互
- 服务端渲染(使用 express)
  - 所有模板等资源都存储在客户端
  - 一个 html 返回所有数据
  - 优点：减少白屏时间 / 对于 SEO 优化
- 遇到的问题
  - 浏览器的全局变量，如 window 在 node 中是没有的，要做一个 hack
    - 组件适配，将不兼容的组件根据环境来进行适配
    - 请求适配，将 fetch / ajax 发送请求的写法改成 axios
  - 样式问题
    - 服务端打包通过 ignore-loader 忽略掉 css 的解析
    - 替换 style-loader 替换成 isomorphic-style-loader
- 解决服务端渲染样式不起作用问题，读取 html 模版, 放置占位符, 服务端使用字符串的 replace 方法替换
- 除了样式可以使用占位符进行替换，首屏初始化数据也可以使用占位符替换
- @see https://stackoverflow.com/questions/48248832/stylesheet-not-loaded-because-of-mime-type

#### 输出日志 stats

- @see https://www.webpackjs.com/configuration/stats/
- 优化输出日志效果 插件：friendly-errors-webpack-plugin @see https://www.npmjs.com/package/friendly-errors-webpack-plugin

#### 如何主动捕获并处理构建错误

- @see https://webpack.js.org/api/compiler-hooks/#root
- compiler 会在每次构建结束后触发 done 这个 hook
- process.exit 主动处理构建报错
- 在这里可以做日志上报的工作
- 在 plugin 中添加如下代码

```js
// this 对象是指 compiler
// webpack4
function () {
  this.hooks.done.tap('done', (stats) => {
    if (stats.compilation.errors && stats.compilation.errors.length && process.argv.indexOf('--watch') == -1) {
      console.log('build error');
      process.exit(1);
    }
  });
}
// webpack3
function () {
  this.plugin('done', (stats) => {
    if (stats.compilation.errors && stats.compilation.errors.length && process.argv.indexOf('--watch') == -1) {
      console.log('build error');
      process.exit(1);
    }
  });
}
```

#### 构建配置抽离成 npm 包

- 通用性：
  - 业务开发者不用关心构建配置
  - 统一团队构建脚本
- 可维护性
  - 构建配置合理的拆分
  - README 文件，ChangeLog 文档等
- 质量
  - 冒烟测试、单元测试、测试覆盖率
  - 持续集成

###### 构建配置

- 通过不同的配置文件管理不同环境的配置，比如 webpack --config 参数进行控制
- 将构建配置设计成一个库，比如 hjs-webpack
- 抽成一个工具进行管理: 比如 create-react-app
- 将所有的配置放在一个文件，通过 --env 参数控制分支选择

#### Travis CI 持续集成

- @see http://www.ruanyifeng.com/blog/2017/12/travis_ci_tutorial.html

#### 查看构建信息

- 注释掉 `stats: 'errors-only'`, 可以查看到很多详细的包大小信息
- 添加 `"build:stats": "webpack --config webpack.prod.js --json > stats.json"`, `--json > stats.json`将构建的信息生成一个 json 文件

#### 分析构建信息，提升构建速度

- 使用 `speed-measure-webpack-plugin` 插件来进行分析
- 分析整个打包总耗时
- 每个插件和 loader 的耗时情况
- https://www.npmjs.com/package/speed-measure-webpack-plugin

#### 分析 webpack 打包体积
- webpack-bundle-analyzer 分析体积
- https://www.npmjs.com/package/webpack-bundle-analyzer

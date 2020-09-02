// @see https://github.com/postcss/autoprefixer
module.exports = {
  plugins: [
    require('autoprefixer'),
    // 使用 px2rem 报错，但是 postcss-px2rem 也没找到解决办法
    // require('postcss-px2rem')({
    //   // remUnit 是指 1 rem 对应 多少 px， 最好是设计稿 / 10, 比如这里最好是 750 的设计稿
    //   remUnit: 75,
    //   // 转换成 rem 后小数点位数
    //   remPrecision: 8 // rem的小数点后位数
    // })
  ],
};

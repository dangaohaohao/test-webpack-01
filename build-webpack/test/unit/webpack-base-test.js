const assert = require('assert');
describe('webpack.base.js test case', () => {
  const baseConfig = require('../../lib/webpack.base');
  it('entry', () => {
    assert.equal(baseConfig.entry.index, '/Users/liuyuzhen/Documents/liuyuzhen workspace/React Webpack/test-webpack-01/build-webpack/test/smoke/template/src/index/index.js');
    assert.equal(baseConfig.entry.search, '/Users/liuyuzhen/Documents/liuyuzhen workspace/React Webpack/test-webpack-01/build-webpack/test/smoke/template/src/search/index.js');
  });
});

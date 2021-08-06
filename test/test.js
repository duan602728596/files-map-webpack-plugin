const fs = require('fs');
const path = require('path');
const { expect } = require('chai');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');

function build() {
  const compiler = webpack(webpackConfig);

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  }).catch((err) => {
    console.error(err);
  });
}

describe('files-map-webpack-plugin', function() {
  it('webpack build fileMap.json', async function() {
    await build();

    // 判断文件是否存在
    const hasFile = fs.existsSync(path.join(webpackConfig.output.path, 'filesMap.json'));

    expect(hasFile).to.be.true;

    // 判断name是否正确
    // eslint-disable-next-line import/no-unresolved
    const filesMap = require('./dist/filesMap.json');
    const { js } = filesMap.map;

    expect('module0' in js).to.be.true;
    expect('module1' in js).to.be.true;
    expect('module2' in js).to.be.true;
  });
});
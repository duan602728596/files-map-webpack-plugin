const path = require('path');
const FilesMapWebpackPlugin = require('./lib/cjs');

const dir = path.join(__dirname, 'example');

module.exports = {
  mode: 'production',
  target: ['web'],
  entry: {
    index: [path.join(dir, 'src/index.js')],
    text: [path.join(dir, 'src/text.js')]
  },
  output: {
    path: path.join(dir, 'dist'),
    filename: '[name].[chunkhash:5].js'
  },
  plugins: [
    new FilesMapWebpackPlugin()
  ]
};
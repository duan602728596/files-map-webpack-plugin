import path from 'path';
import FilesMapWebpackPlugin from './src/index';

export default {
  mode: 'development',
  entry: {
    index: [path.join(__dirname, 'example/index.js')],
    text: [path.join(__dirname, 'example/text.js')]
  },
  output: {
    path: path.join(__dirname, 'example-dist'),
    filename: '[name].build.js'
  },
  plugins: [
    new FilesMapWebpackPlugin()
  ]
};
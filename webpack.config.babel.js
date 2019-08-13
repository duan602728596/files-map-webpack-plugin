import path from 'path';
import FilesMapWebpackPlugin from './src/files-map-webpack-plugin';

const dir = path.join(__dirname, 'example');

export default {
  mode: 'production',
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
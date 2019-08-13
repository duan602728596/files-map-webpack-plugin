import path from 'path';
import FilesMapWebpackPlugin from '../cjs';

const dir = path.join(__dirname, 'src');

export default {
  mode: 'production',
  entry: {
    module0: path.join(dir, 'entry0.js'),
    module1: path.join(dir, 'entry1.js'),
    module2: path.join(dir, 'entry2.js')
  },
  output: {
    path: path.join(__dirname, 'dist')
  },
  plugins: [
    new FilesMapWebpackPlugin()
  ]
};
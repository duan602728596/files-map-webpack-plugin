# files-map-webpack-plugin

Generate the mapping of the source entry file, the entry name, and the packaged and compiled file.

## How to use

```javascript
// webpack.config
import FilesMapWebpackPlugin from '@bbkkbkk/files-map-webpack-plugin';

export default {
  plugins: [
    new FilesMapWebpackPlugin()
  ]
};
```

## API

| parameter | type   | description |
| ---       | ---    | ---         |
| path      | string | The output directory is output to the output folder configured by webpack by default. |
| name      | string | The name of the output file, the default is filesMap.json.                            |
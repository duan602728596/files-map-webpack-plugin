# files-map-webpack-plugin

生成源入口文件、入口名称和打包编译后的文件的映射。

## 如何使用

```javascript
// webpack.config
import FilesMapWebpackPlugin from '@bbkkbkk/files-map-webpack-plugin';

export default {
  ...,
  plugins: [
    ...,
    new FilesMapWebpackPlugin()
  ]
};
```

## API

| 参数 | 类型   | 说明 |
| ---  | ---    | ---  |
| path | string | 输出的目录，默认输出到webpack配置的输出文件夹内。 |
| name | string | 输出的文件名称，默认为filesMap.json。             |
import path from 'path';
import fse from 'fs-extra';
import _ from 'lodash';

class FilesMapWebpackPlugin {
  constructor(options = {}) {
    // 插件配置
    this.options = _.merge({
      path: undefined,      // 输出目录
      name: 'filesMap.json' // 输出文件名称
    }, options);

    // 插件名称
    this.pluginName = 'files-map-webpack-plugin';
  }

  // 获取文件入口
  getFileEntry(entryModule, context) {
    const dependencies = entryModule?.dependencies ?? [];

    if (dependencies.length === 0) {
      return undefined;
    }

    return path.relative(context, dependencies[0]?.request || dependencies[0]?.originModule?.request);
  }

  apply(compiler) {
    const { pluginName, options, getFileEntry } = this;

    compiler.hooks.afterEmit.tapPromise(`${ pluginName }-afterEmit`, async function(compilation) {
      const { options: compilationOptions, chunks } = compilation;
      const { output, context } = compilationOptions;
      const map = {};

      // 输出获取文件映射
      const outputDir = options.path ?? output.path;

      for (const chunk of chunks) {
        const {
          id,    // 模块id
          files, // 模块输出路径
          entryModule
        } = chunk;
        const entry = getFileEntry(entryModule, context);

        map[id] = {
          entry,
          output: files[0]
        };
      }

      // 输出文件
      await fse.writeJSON(
        path.join(outputDir, options.name),
        { map },
        { spaces: 2 }
      );
    });
  }
}

export default FilesMapWebpackPlugin;
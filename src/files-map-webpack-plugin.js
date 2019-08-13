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

  // 重写文件路径
  formatPath(p) {
    return p.replace(/\\/g, '/');
  }

  // 获取文件扩展名
  getExt(file) {
    const defaultExt = 'file';

    if (_.isNil(file)) {
      return defaultExt;
    }

    const outputParseResult = path.parse(file);

    return outputParseResult.ext ? outputParseResult.ext.substr(1) : defaultExt;
  }

  apply(compiler) {
    const { pluginName, options, getFileEntry, formatPath, getExt } = this;

    compiler.hooks.afterEmit.tapPromise(`${ pluginName }-afterEmit`, async function(compilation) {
      const { options: compilationOptions, chunks: compilationChunks } = compilation;
      const { output, context } = compilationOptions;
      const map = {}; // 输出映射
      const chunks = {};

      // 输出获取文件映射
      const outputDir = options.path ?? output.path;

      for (const chunk of compilationChunks) {
        const {
          name,  // 模块名称
          id,    // 模块id
          files, // 模块输出路径
          entryModule
        } = chunk;
        const entry = getFileEntry(entryModule, context);
        const key = name || id;

        chunks[key] = [];

        if (files && files.length > 0) {
          // 循环files
          for (const file of files) {
            chunks[key].push(formatPath(file));

            // 获取文件扩展名
            const ext = getExt(file);

            if (!_.isPlainObject(map[ext])) {
              map[ext] = {};
            }

            // 添加到映射
            map[ext][key] = {
              entry: entry ? formatPath(entry) : undefined,
              output: formatPath(file)
            };
          }
        }
      }

      await fse.writeJSON(
        path.join(outputDir, options.name),
        { map, chunks },
        { spaces: 2 }
      );
    });
  }
}

export default FilesMapWebpackPlugin;
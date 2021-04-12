import util from 'util';
import path from 'path';
import { formatPath, getExt } from './utils';

class FilesMapWebpackPlugin {
  static pluginName = 'files-map-webpack-plugin';

  constructor(options = {}) {
    // 插件配置
    this.options = Object.assign({
      path: undefined,      // 输出目录
      name: 'filesMap.json' // 输出文件名称
    }, options);

    // 插件名称
    this.pluginName = FilesMapWebpackPlugin.pluginName;
  }

  // 获取文件入口
  getFileEntry(chunkGraph, chunk, context) {
    let request = undefined;

    if (chunkGraph) {
      // webpack5
      const entryModules = chunkGraph.getChunkEntryModulesIterable(chunk);

      for (const entryModule of entryModules) {
        request ??= entryModule?.rawRequest ?? entryModule?.rootModule?.rawRequest;
      }
    } else {
      // webpack4
      const entryModule = chunk.entryModule;

      if (!entryModule?.dependencies?.length) {
        return undefined;
      }

      const dependencies = entryModule?.dependencies ?? [];

      request = dependencies[0]?.request           // webpack4
        ?? dependencies[0]?.originModule?.request; // webpack4 async-module
    }

    if (request) {
      return path.relative(context, request);
    }
  }

  // 判断文件是否存在
  createAccessFunc(access) {
    const accessPromise = util.promisify(access);

    return async function(f) {
      try {
        await accessPromise(f);

        return true;
      } catch (err) {
        return false;
      }
    };
  }

  // 判断文件是否存在并创建目录
  createMkdirFunc(outputFileSystem) {
    const { mkdirp, mkdir, access } = outputFileSystem;

    // webpack4
    if (mkdirp) {
      if (util.types.isPromise(mkdirp)) {
        return mkdirp;
      } else {
        return util.promisify(mkdirp);
      }
    }

    // webpack5
    const accessPromise = this.createAccessFunc(access);
    const mkdirPromise = util.promisify(mkdir);

    return async function(dir) {
      const fileExists = await accessPromise(dir);

      if (!fileExists) {
        await mkdirPromise(dir);
      }
    };
  }

  apply(compiler) {
    const _this = this;
    const { options, getFileEntry, createMkdirFunc } = this;

    compiler.hooks.afterEmit.tapPromise(`${ FilesMapWebpackPlugin.pluginName }-afterEmit`, async function(compilation) {
      const map = {};    // 输出映射
      const chunks = {}; // 输出的模块
      const { options: compilationOptions, chunks: compilationChunks, chunkGraph /* webpack5 */ } = compilation;
      const { output, context } = compilationOptions;
      const outputDir = options.path ?? output.path; // 输出获取文件映射

      for (const chunk of compilationChunks) {
        const { name, id, files } = chunk;                                                  // 模块的名称、id、输出路径
        const chunkFiles = files ? (Array.isArray(files) ? files : Array.from(files)) : []; // 获取模块的信息
        const entry = getFileEntry(chunkGraph, chunk, context);                             // 获取入口文件并格式化入口文件
        const key = name ?? id;                                                             // 模块id

        chunks[key] = [];

        if (chunkFiles?.length) {
          for (const file of chunkFiles) {
            const ext = getExt(file); // 获取文件扩展名

            chunks[key].push(formatPath(file));
            map[ext] ??= {};

            // 添加到映射
            map[ext][key] = {
              entry: entry ? formatPath(entry) : undefined,
              output: formatPath(file)
            };
          }
        }
      }

      // 判断文件夹是否存在并写入文件
      const { outputFileSystem } = compiler;
      const writeFilePromise = outputFileSystem.promises
        ? outputFileSystem.promises.writeFile : util.promisify(outputFileSystem.writeFile);
      const mkdirPromise = createMkdirFunc.call(_this, outputFileSystem);

      await mkdirPromise(outputDir);
      await writeFilePromise(
        path.join(outputDir, options.name),
        JSON.stringify({ map, chunks }, null, 2)
      );
    });
  }
}

export default FilesMapWebpackPlugin;
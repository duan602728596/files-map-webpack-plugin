import util from 'util';
import path from 'path';
import { isNil, isPlainObject } from './types';

class FilesMapWebpackPlugin {
  constructor(options = {}) {
    // 插件配置
    this.options = Object.assign({
      path: undefined,      // 输出目录
      name: 'filesMap.json' // 输出文件名称
    }, options);

    // 插件名称
    this.pluginName = 'files-map-webpack-plugin';
  }

  // 获取文件入口（webpack5）
  getFileEntryV5(entryModules, context) {
    let request = undefined;

    for (const entryModule of entryModules) {
      request = entryModule.request;
    }

    if (!request) {
      return undefined;
    }

    return path.relative(context, request);
  }

  // 获取文件入口
  getFileEntry(entryModule, context) {
    const dependencies = entryModule?.dependencies ?? [];

    if (dependencies.length === 0) {
      return undefined;
    }

    // 文件路径
    const request = dependencies[0]?.request     // webpack4
      ?? dependencies[0]?.originModule?.request; // webpack4 async-module

    if (!request) {
      return undefined;
    }

    return path.relative(context, request);
  }

  // 重写文件路径
  formatPath(p) {
    return p.replace(/\\/g, '/');
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
        mkdirPromise(dir);
      }
    };
  }

  // 获取文件扩展名
  getExt(file) {
    const defaultExt = 'file';

    if (isNil(file)) {
      return defaultExt;
    }

    const outputParseResult = path.parse(file);

    return outputParseResult.ext ? outputParseResult.ext.substr(1) : defaultExt;
  }

  apply(compiler) {
    const _this = this;
    const { pluginName, options, getFileEntry, getFileEntryV5, formatPath, getExt, createMkdirFunc } = this;

    compiler.hooks.afterEmit.tapPromise(`${ pluginName }-afterEmit`, async function(compilation) {
      const {
        options: compilationOptions,
        chunks: compilationChunks,
        chunkGraph // webpack5
      } = compilation;
      const { output, context } = compilationOptions;
      const map = {};    // 输出映射
      const chunks = {}; // 输出的模块

      // 输出获取文件映射
      const outputDir = options.path ?? output.path;

      for (const chunk of compilationChunks) {
        const {
          name,  // 模块名称
          id,    // 模块id
          files  // 模块输出路径
        } = chunk;

        // 获取模块的信息
        const chunkFiles = files ? (Array.isArray(files) ? files : Array.from(files)) : [];

        // 获取入口文件并格式化入口文件
        const entry = chunkGraph
          ? getFileEntryV5(chunkGraph.getChunkEntryModulesIterable(chunk), context) // webpack5
          : getFileEntry(chunk.entryModule, context);                               // webpack4

        // 模块id
        const key = name ?? id;

        chunks[key] = [];

        if (chunkFiles && chunkFiles.length > 0) {
          // 循环files
          for (const file of chunkFiles) {
            chunks[key].push(formatPath(file));

            // 获取文件扩展名
            const ext = getExt(file);

            if (!isPlainObject(map[ext])) {
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

      // 判断文件夹是否存在并写入文件
      const { outputFileSystem } = compiler;
      const writeFilePromise = outputFileSystem.promises
        ? outputFileSystem.promises.writeFile
        : util.promisify(outputFileSystem.writeFile);
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
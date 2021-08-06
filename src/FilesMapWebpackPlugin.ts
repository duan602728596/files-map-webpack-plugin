import { promisify } from 'util';
import * as path from 'path';
import type { Compiler, Compilation, WebpackOptionsNormalized, Chunk, ChunkGraph, Module } from 'webpack';
import { getFileExt, formatPath } from './utils';
import type { PluginOptions, OutputMap, OutputChunks, AccessPromiseFunc, FS } from './types';

class FilesMapWebpackPlugin {
  public options: {
    path?: string;
    name: string;
  };
  public pluginName: typeof FilesMapWebpackPlugin.pluginName;

  static pluginName: string = 'files-map-webpack-plugin';

  constructor(options: PluginOptions) {
    this.options = Object.assign({
      path: undefined,      // 输出目录
      name: 'filesMap.json' // 输出文件名称
    }, options);
    this.pluginName = FilesMapWebpackPlugin.pluginName;
  }

  /**
   * 获取文件系统
   * @param { Compiler } compiler
   */
  getFs(compiler: Compiler): FS {
    const { outputFileSystem: ofs }: Compiler = compiler;

    return {
      writeFilePromise: ofs?.['promises']?.writeFile ?? promisify(ofs.writeFile), // 写文件
      accessPromise: ofs?.['promises']?.['access'] ?? promisify(ofs['access']),   // 判断文件是否存在
      mkdirPromise: ofs?.['promises']?.mkdir ?? promisify(ofs.mkdir)              // 创建文件夹
    };
  }

  /**
   * 获取文件入口
   * @param { ChunkGraph } chunkGraph
   * @param { Chunk } chunk
   * @param { string | undefined } context
   */
  getFileEntry(chunkGraph: ChunkGraph, chunk: Chunk, context: string | undefined): string | undefined {
    const entryModules: Iterable<Module> = chunkGraph.getChunkEntryModulesIterable(chunk);
    let request: string | undefined = undefined;

    for (const entryModule of entryModules) {
      request ??= entryModule?.['rootModule']?.rawRequest ?? entryModule?.['rawRequest'];
    }

    if (!request) {
      // 异步模块
      const rootModules: Array<Module> = chunkGraph.getChunkRootModules(chunk);

      for (const rootModule of rootModules) {
        request ??= rootModule?.['request'];
      }
    }

    if (request) {
      return path.relative(context ?? '', request);
    }
  }

  /**
   * 判断文件是否存在
   * @param { AccessPromiseFunc } accessPromise
   * @param { string } file: 文件
   */
  async fileExists(accessPromise: AccessPromiseFunc, file: string): Promise<boolean> {
    try {
      await accessPromise(file);

      return true;
    } catch (err) {
      return false;
    }
  }

  async afterEmit(compiler: Compiler, compilation: Compilation): Promise<void> {
    const outputMap: OutputMap = {};       // 输出映射
    const outputChunks: OutputChunks = {}; // 输出的模块
    const { options: compilationOptions, chunks: compilationChunks, chunkGraph }: Compilation = compilation;
    const { output, context }: WebpackOptionsNormalized = compilationOptions;

    for (const chunk of compilationChunks) {
      const { name, id, files }: Chunk = chunk;
      const chunkFiles: Array<string> = files ? (Array.isArray(files) ? files : Array.from(files)) : []; // 获取模块的信息
      const entry: string | undefined = this.getFileEntry(chunkGraph, chunk, context); // 获取入口文件并格式化入口文件
      const key: string = name ?? id;

      outputChunks[key] = [];

      for (const chunkFile of chunkFiles) {
        const ext: string = getFileExt(chunkFile); // 获取文件扩展名

        outputChunks[key].push(formatPath(chunkFile));
        outputMap[ext] ??= {};
        outputMap[ext][key] = { // 添加到映射
          entry: entry ? formatPath(entry) : undefined,
          output: formatPath(chunkFile)
        };
      }
    }

    // 判断文件夹是否存在并写入文件
    const fs: FS = this.getFs(compiler);
    const outputDir: string = this.options.path ?? output.path!; // 输出获取文件映射

    if (!(await this.fileExists(fs.accessPromise, outputDir))) {
      await fs.mkdirPromise(outputDir);
    }

    await fs.writeFilePromise(
      path.join(outputDir, this.options.name),
      JSON.stringify({ map: outputMap, chunks: outputChunks }, null, 2)
    );
  }

  apply(compiler: Compiler): void {
    compiler.hooks.afterEmit.tapPromise(`${ this.pluginName }-afterEmit`, this.afterEmit.bind(this, compiler));
  }
}

export default FilesMapWebpackPlugin;
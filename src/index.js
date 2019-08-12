class FilesMapWebpackPlugin {
  constructor(options) {
    this.options = options;
    this.pluginName = 'files-map-webpack-plugin';
  }

  apply(compiler) {
    const { pluginName } = this;

    // eslint-disable-next-line require-await
    compiler.hooks.afterEmit.tapPromise(`${ pluginName }-apply`, async function(compilation) {
      const { options, chunks } = compilation;
      // 文件目录和入口（绝对路径）
      const {
        entry,
        output,
        context
      } = options;

      for (const chunk of chunks) {
        const {
          id,    // 模块id
          files, // 模块输出（相对路径）
          entryModule,
          _modules
        } = chunk;

        !entryModule && console.log(_modules);
      }
    });
  }
}

export default FilesMapWebpackPlugin;
import { PathLike } from 'fs';

export interface PluginOptions {
  path?: string;
  name?: string;
}

export interface OutputMap {
  [key: string]: {
    [key: string]: {
      entry: string | undefined;
      output: string;
    };
  };
}

export interface OutputChunks {
  [key: string]: Array<string>;
}

export interface WriteFilePromiseFunc {
  (arg0: string, arg1: string | Buffer): Promise<void>;
}

export interface AccessPromiseFunc {
  (arg0: PathLike, arg1?: string | number): Promise<void>;
}

export interface MkdirPromiseFunc {
  (arg0: string): Promise<void>;
}

export interface FS {
  writeFilePromise: WriteFilePromiseFunc;
  accessPromise: AccessPromiseFunc;
  mkdirPromise: MkdirPromiseFunc;
}
import { promises as fsP } from 'fs';

await fsP.writeFile(
  'esm/package.json',
  JSON.stringify({ type: 'module' }, null, 2) + '\n'
);
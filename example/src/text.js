import output from './utils/output';

const text = 'This is text module.';

output(text);

import(/* webpackChunkName: 'asyncModule' */'./asyncModule').then((text) => {
  output(text);
});
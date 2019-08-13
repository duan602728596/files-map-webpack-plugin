import output from './utils/output';

const text = 'This is text module.';

output(text);

import('./asyncModule').then((text) => {
  output(text);
});
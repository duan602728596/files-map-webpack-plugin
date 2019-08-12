import output from './output';

const text = 'My name is Lilei.';

output(text);

import('./asyncModule').then((text) => {
  output(text);
});
import { expect } from 'chai';

import demo from '../src/demo';

describe('demo', () => {
  it('removes spaces between', () => {
    expect(demo('abc def')).to.eql('Abc def');
  });
});

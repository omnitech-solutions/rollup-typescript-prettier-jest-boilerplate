import { chain, functions, includes, isFunction, noop } from 'lodash';

import sinon from 'sinon';

const throwIfFnNotStubbed = (stub: any, method: string) => {
  const sig = `.${method}(...)`;

  stub.callsFake((...args: any[]): any => {
    const err = new Error(`${sig} was called without being stubbed.
      ${sig} was called with arguments:
      ${args.map(JSON.stringify).join(', ')}
    `);

    err.stack = chain(err.stack)
      .split('\n')
      .reject((str) => includes(str, 'sinon'))
      .join('\n')
      .value();

    throw err;
  });
};

const $stub = sinon.stub;
// eslint-disable-next-line func-names
sinon.stub = function (obj: any, method: string) {
  /* eslint-disable prefer-rest-params */
  const stub = $stub.apply(this, arguments);

  let fns = [method];

  if (arguments.length === 1) {
    fns = functions(obj);
  }

  if (arguments.length === 0) {
    throwIfFnNotStubbed(stub, '[anonymous function]');

    return stub;
  }

  fns.forEach((name) => {
    const fn = obj[name];

    if (isFunction(fn)) {
      throwIfFnNotStubbed(fn, name);
    }
  });

  return stub;
};

/**
 * Create an object with stubbed out the method names contained in @methodNames
 * @param {string[]} methodNames
 *
 * @return {Object} new chainable stubbed out object.
 */
const createChainableStub = (methodNames: Array<string>) => {
  const obj = methodNames.reduce(
    (memo, method) => ({
      ...memo,
      [method]: noop
    }),
    {}
  );

  methodNames.forEach((method) => sinon.stub(obj, method).returns(obj));

  return obj;
};

Object.assign(sinon, { createChainableStub });
export default sinon;

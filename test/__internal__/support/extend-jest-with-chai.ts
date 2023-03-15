// Adding chai to jest reference: https://gist.github.com/pahund/3abcc5212431cef3dae455d5285b7bd7

import expect from 'expect';
import chai from './chai-matchers-ext';
import sinon from './sinon-ext';

// Make sure chai and jasmine ".not" play nice together
// @ts-ignore
const originalNot = Object.getOwnPropertyDescriptor(chai.Assertion.prototype, 'not').get;

Object.defineProperty(chai.Assertion.prototype, 'not', {
  get() {
    Object.assign(this, this.assignedNot);
    // @ts-ignore
    return originalNot.apply(this);
  },
  set(newNot) {
    this.assignedNot = newNot;
    return newNot;
  }
});

// @ts-ignore
global.context = describe;
// @ts-ignore
global.sinon = sinon;

// Combine both jest and chai matchers on expect
// @ts-ignore
const jestExpect = expect;

// @ts-ignore
global.expect = (actual) => {
  const originalMatchers = jestExpect(actual);
  const chaiMatchers = chai.expect(actual);
  return Object.assign(chaiMatchers, originalMatchers);
};

// @ts-ignore
Object.keys(jestExpect).forEach((key) => {
  // @ts-ignore
  global.expect[key] = jestExpect[key];
});

// eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle
const _beforeEach = global.beforeEach;
global.beforeEach = (fn) => {
  _beforeEach(async () => {
    try {
      // @ts-ignore
      await fn();
    } catch (ex) {
      // @ts-ignore
      const error = ex || _context.t0;

      // eslint-disable-next-line no-console
      console.error(error);
      throw error;
    }
  });
};

// https://jestjs.io/docs/en/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    }))
  });
}

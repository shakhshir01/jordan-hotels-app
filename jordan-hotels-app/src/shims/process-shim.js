// Minimal ESM-friendly process shim for browser dev server
const process = {
  env: {},
  argv: [],
  browser: true,
  title: 'browser',
  version: '',
  versions: {},
  nextTick(fn, ...args) {
    return Promise.resolve().then(() => fn(...args));
  },
  cwd() {
    return '/';
  },
  // no-op event methods
  on() {},
  addListener() {},
  once() {},
  off() {},
  removeListener() {},
  removeAllListeners() {},
  emit() {},
};

export default process;

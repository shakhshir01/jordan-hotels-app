// Minimal ESM-friendly module shim for browser
// This prevents "module is not defined" errors from CommonJS code
const moduleShim = {
  exports: {},
  require: () => {
    throw new Error('require() is not available in the browser');
  },
};

export default moduleShim;

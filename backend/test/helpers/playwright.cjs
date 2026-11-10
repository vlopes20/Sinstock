const { createRequire } = require('node:module');
const path = require('node:path');

// Browser tooling belongs to the frontend package, regardless of npm hoisting.
const frontendRequire = createRequire(
  path.resolve(__dirname, '../../../frontend/package.json'),
);
module.exports = frontendRequire('playwright');

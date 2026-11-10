const path = require('node:path');

const projectRoot = path.resolve(__dirname, '../..');
const environmentFile = path.join(projectRoot, '.env');
require('dotenv').config({ path: environmentFile, quiet: true });

module.exports = { projectRoot, environmentFile };

const path = require('path');
const config = require('./react-go.config');

const resolveApp = (relativePath) => path.resolve(config.root, relativePath);

module.exports = {
  appRoot: config.root,
  appPackageJson: resolveApp('./package.json'),
  appIndex: resolveApp(config.isTS ? './src/index.tsx' : './src/index.js'),
  appIndexHtml: resolveApp('./public/index.html'),
  appSrc: resolveApp('./src'),
  appPublic: resolveApp('./public'),
  appNodeModules: resolveApp('./node_modules'),
  appDist: resolveApp(config.dist),
};

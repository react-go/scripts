const ignoredFiles = require('react-dev-utils/ignoredFiles');
const errorOverlayMiddleware = require('react-dev-utils/errorOverlayMiddleware');
const evalSourceMapMiddleware = require('react-dev-utils/evalSourceMapMiddleware');
const redirectServedPath = require('react-dev-utils/redirectServedPathMiddleware');
const config = require('./react-go.config');
const paths = require('./paths');

const publicPath = config.publicPath !== '/' && config.publicPath.endsWith('/')
  ? config.publicPath.slice(0, -1)
  : config.publicPath;

module.exports = {
  publicPath,
  contentBase: paths.appPublic,
  contentBasePublicPath: publicPath,
  watchContentBase: true,
  hot: true,
  compress: true,
  clientLogLevel: 'none',
  quiet: true,
  transportMode: 'ws',
  overlay: false,
  watchOptions: {
    ignored: ignoredFiles(paths.appSrc),
  },
  disableHostCheck: typeof config.open === 'string',
  historyApiFallback: {
    disableDotRule: true,
    index: config.publicPath,
  },
  proxy: config.proxy,
  before(app, server) {
    app.use(evalSourceMapMiddleware(server));
    app.use(errorOverlayMiddleware());
  },
  after(app) {
    app.use(redirectServedPath(config.publicPath));
  },
};

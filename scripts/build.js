process.env.NODE_ENV = 'production';
process.env.BABEL_ENV = 'production';

const fs = require('fs-extra');
const webpack = require('webpack');
const webpackConfigFactory = require('../config/webpack.config');
const paths = require('../config/paths');

module.exports = () => {
  fs.emptyDirSync(paths.appDist);

  let compiler;
  try {
    compiler = webpack(webpackConfigFactory({ mode: 'production' }));
  } catch (error) {
    console.log(error);
    process.exit(1);
  }

  compiler.run((error, stats) => {
    if (error) {
      return console.log(error);
    }
    console.log(stats.toString({
      all: false,
      errors: true,
      warnings: true,
      assets: true,
      colors: true,
    }));
  });
};

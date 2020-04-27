process.env.NODE_ENV = 'production';
process.env.BABEL_ENV = 'production';

const fs = require('fs-extra');
const chalk = require('chalk');
const webpack = require('webpack');
const printBuildError = require('react-dev-utils/printBuildError');
const webpackConfigFactory = require('../config/webpack.config');
const paths = require('../config/paths');
const fileSizeReporter = require('../utils/fileSizeReporter');

module.exports = (opts) => {
  fs.emptyDirSync(paths.appDist);
  fs.copy(paths.appPublic, paths.appDist, {
    dereference: true,
    filter: file => file !== paths.appIndexHtml,
  });

  let compiler;
  try {
    compiler = webpack(
      webpackConfigFactory({
        mode: 'production',
        sourcemap: false,
        appEnv: opts.appEnv,
        analyze: opts.analyze,
      })
    );
  } catch (error) {
    console.log(error);
    process.exit(1);
  }

  compiler.run((error, stats) => {
    if (error) {
      console.log('\n');
      console.log(chalk.red('Failed to compile.'));
      console.log();
      printBuildError(error);
      process.exit(1);
    }
    console.log(chalk.green('Compiled successfully.\n'));
    console.log('File sizes after gzip:\n');
    fileSizeReporter(stats, paths.appDist);
    console.log();
    console.log(chalk.dim('Build with React Go ' + chalk.italic.underline('https://github.com/react-go')));
    console.log();
  });
};

process.env.NODE_ENV = 'development';
process.env.BABEL_ENV = 'development';

const url = require('url');
const chalk = require('chalk');
const address = require('address');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const clearConsole = require('react-dev-utils/clearConsole');
const openBrowser = require('react-dev-utils/openBrowser');
const config = require('../config/react-go.config');
const paths = require('../config/paths');
const webpackConfigFactory = require('../config/webpack.config');
const devServerConfig = require('../config/webpackDevServer');

const isInteractive = process.stdout.isTTY;

const isPrivateIP = (ip) => /^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(ip);

module.exports = () => {
  const appName = require(paths.appPackageJson).name;
  const localUrl = url.format({
    protocol: 'http',
    hostname: 'localhost',
    port: config.port,
  });
  const lanIP = address.ip();
  let lanUrl;
  if (isPrivateIP(lanIP)) {
    lanUrl = url.format({
      protocol: 'http',
      hostname: lanIP,
      port: config.port,
    });
  }

  let compiler;
  try {
    compiler = webpack(webpackConfigFactory({ mode: 'development' }));
  } catch (error) {
    console.log(error);
    process.exit(1);
  }

  compiler.hooks.invalid.tap('invalid', () => {
    if (isInteractive) {
      clearConsole();
    }
    console.log('Compiling...');
  });
  compiler.hooks.done.tap('done', async (stats) => {
    if (isInteractive) {
      clearConsole();
    }
    const statsData = stats.toString({
      all: false,
      errors: true,
      warnings: true,
      assets: true,
      colors: true,
    });
    console.log(chalk.green('Compiled successfully!'));
    console.log();
    console.log(`You can now view ${chalk.bold(appName)} in the browser.`);
    console.log();
    console.log(`- ${chalk.bold('Local:')}   ${localUrl}`);
    lanUrl && console.log(`- ${chalk.bold('Lan:')}     ${lanUrl}`);
    console.log();
    console.log(statsData);
  });

  const server = new WebpackDevServer(compiler, devServerConfig);

  server.listen(config.port, '0.0.0.0', (error) => {
    if (error) {
      return console.log(error);
    }
    if (isInteractive) {
      clearConsole();
      console.log(chalk.cyan('Starting the development server...\n'));
      openBrowser(localUrl);
    }

    ['SIGINT', 'SIGTERM'].forEach(function(sig) {
      process.on(sig, function() {
        server.close();
        process.exit();
      });
    });

    if (isInteractive) {
      // Gracefully exit when stdin ends
      process.stdin.on('end', function() {
        server.close();
        process.exit();
      });
      process.stdin.resume();
    }
  });
};

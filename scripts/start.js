process.env.NODE_ENV = 'development';
process.env.BABEL_ENV = 'development';

const url = require('url');
const chalk = require('chalk');
const address = require('address');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const clearConsole = require('react-dev-utils/clearConsole');
const openBrowser = require('react-dev-utils/openBrowser');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const config = require('../config/react-go.config');
const paths = require('../config/paths');
const webpackConfigFactory = require('../config/webpack.config');
const devServerConfig = require('../config/webpackDevServer');

const isInteractive = process.stdout.isTTY;

const isPrivateIP = (ip) => /^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(ip);

module.exports = (opts) => {
  const appName = require(paths.appPackageJson).name;

  const isOpen = Boolean(config.open);
  const openHost = !isOpen
    ? 'localhost'
    : (config.open === true ? 'localhost' : config.open);
  const isLocal = ['localhost', '127.0.0.1', '0.0.0.0'].includes(openHost);

  const localUrl = url.format({
    protocol: 'http',
    hostname: openHost,
    port: config.port,
    pathname: config.publicPath,
  });
  const lanIP = address.ip();
  let lanUrl;
  if (isLocal && isPrivateIP(lanIP)) {
    lanUrl = url.format({
      protocol: 'http',
      hostname: lanIP,
      port: config.port,
      pathname: config.publicPath,
    });
  }

  let compiler;
  try {
    compiler = webpack(
      webpackConfigFactory({
        mode: 'development',
        sourcemap: true,
        appEnv: opts.appEnv,
      })
    );
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
    const statsData = stats.toJson({
      all: false,
      errors: true,
      warnings: true,
    });
    const messages = formatWebpackMessages(statsData);
    if (messages.errors.length > 0) {
      console.log(chalk.red('Failed to compile.\n'));
      console.log(messages.errors.join('\n\n'));
      return;
    }
    if (messages.warnings.length > 0) {
      console.log(chalk.yellow('Compiled with warnings.\n'));
      console.log(messages.warnings.join('\n\n'));
      return;
    }
    console.log(chalk.green('Compiled successfully!'));
    console.log();
    console.log(`You can now view ${chalk.bold(appName)} in the browser.`);
    console.log();
    console.log(`- ${chalk.bold('Local:')}   ${localUrl}`);
    lanUrl && console.log(`- ${chalk.bold('Lan:')}     ${lanUrl}`);
    console.log();
  });

  const server = new WebpackDevServer(compiler, devServerConfig);

  server.listen(config.port, '0.0.0.0', (error) => {
    if (error) {
      return console.log(error);
    }
    if (isInteractive) {
      clearConsole();
      console.log(chalk.cyan('Starting the development server...\n'));
      isOpen && openBrowser(localUrl);
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

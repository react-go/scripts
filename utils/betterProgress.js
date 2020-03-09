const webpack = require('webpack');
const ora = require('ora');
const clearConsole = require('react-dev-utils/clearConsole');

function BetterProgressWebpackPlugin() {
  if (!process.stderr.isTTY) {
    return () => {};
  }

  const spinner = ora('Compiling\n').start();

  return new webpack.ProgressPlugin((percentage, message, ...args) => {
    let text = `[${(percentage * 100).toFixed(2)}%]`;
    text += ` ${message}`;
    text += ` ${args.slice(0, 2).join(' ')}`;
    spinner.text = text;
    if (percentage === 1) {
      spinner.stop();
    }
  });
}

module.exports = BetterProgressWebpackPlugin;

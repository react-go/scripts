const webpack = require('webpack');
const ora = require('ora');
const chalk = require('chalk');

function BetterProgressWebpackPlugin() {
  if (!process.stderr.isTTY) {
    return () => {};
  }

  const spinner = ora({ text: 'Compiling...', spinner: 'monkey' }).start();

  return new webpack.ProgressPlugin((percentage, message, ...args) => {
    let text = chalk.cyan(`[${(percentage * 100).toFixed(2)}%]`);
    text += ` ${message}`;
    text += ` ${args.slice(0, 2).join(' ')}`;
    spinner.text = text;
    if (percentage === 1) {
      spinner.stop();
    }
  });
}

module.exports = BetterProgressWebpackPlugin;

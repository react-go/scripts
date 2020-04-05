const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const loadConfig = require('./loadConfig');

const appDirectory = fs.realpathSync(process.cwd());
const userConfigPath = path.resolve(appDirectory, './react-go.config.js');

let userConfig = {};

if (fs.existsSync(userConfigPath)) {
  userConfig = require(userConfigPath);
}
if (!_.isPlainObject(userConfig)) {
  throw new Error('react-go.config.js must export plain object');
}

module.exports = {
  open: true,
  port: 8000,
  dist: './dist',
  publicPath: '/',
  proxy: {},
  ...loadConfig(userConfig, appDirectory),
  root: appDirectory,
};

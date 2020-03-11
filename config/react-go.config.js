const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const appDirectory = fs.realpathSync(process.cwd());
const userConfigPath = path.resolve(appDirectory, './react-go.config.js');

let USER_CONFIG = {};

if (fs.existsSync(userConfigPath)) {
  USER_CONFIG = require(userConfigPath);
}

if (!_.isPlainObject(USER_CONFIG)) {
  throw new Error('react-go.config.js must export plain object');
}

const DEFAULT_CONFIG = {
  root: appDirectory,
  open: true, // string | boolean
  port: 8000,
  dist: './dist',
  publicPath: '/',
  antd: false, // string | boolean
  proxy: {},
};

module.exports = _.merge(DEFAULT_CONFIG, _.omit(USER_CONFIG, ['root', 'isTS']));

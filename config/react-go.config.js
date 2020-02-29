const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const appDirectory = fs.realpathSync(process.cwd());

const USER_CONFIG = require(path.resolve(appDirectory, './react-go.config.js'));

if (!_.isPlainObject(USER_CONFIG)) {
  throw new Error('react-go.config.js must export plain object');
}

const DEFAULT_CONFIG = {
  root: appDirectory,
  isTS: fs.existsSync(path.resolve(appDirectory, './tsconfig.json')),
  port: 8000,
  dist: './dist',
  publicPath: '/',
  antd: false, // string | false | true
};

module.exports = _.merge(DEFAULT_CONFIG, _.omit(USER_CONFIG, ['root', 'isTS']));

const path = require('path');
const _ = require('lodash');

const loadConfig = (config, appDirectory) => {
  let rawConfig = {};

  if (_.isPlainObject(config)) {
    rawConfig = config;
  }
  if (typeof config === 'string') {
    if (config.startsWith('.')) {
      rawConfig = require(path.resolve(appDirectory, config));
    } else {
      rawConfig = require(config);
    }
  }

  const { babel, postcss, webpack, presets, ...restConfig } = rawConfig;

  let babelPresets = [];
  let babelPlugins = [];
  let postcssPlugins = [];
  const webpackChains = [];

  if (babel && babel.presets) {
    babelPresets.push(...babel.presets);
  }
  if (babel && babel.plugins) {
    babelPlugins.push(...babel.plugins);
  }
  if (postcss && postcss.plugins) {
    postcssPlugins.push(...postcss.plugins);
  }
  if (webpack) {
    webpackChains.push(webpack);
  }

  if (Array.isArray(presets)) {
    presets.forEach((preset) => {
      const presetConfig = loadConfig(preset, appDirectory);
      babelPresets = [...presetConfig.babel.presets, ...babelPresets];
      babelPlugins = [...presetConfig.babel.plugins, ...babelPlugins];
      postcssPlugins = [...presetConfig.postcss.plugins, ...postcssPlugins];
      webpackChains.push(...presetConfig.webpackChains);
    })
  }

  return {
    babel: {
      presets: babelPresets,
      plugins: babelPlugins,
    },
    postcss: {
      plugins: postcssPlugins,
    },
    webpackChains: webpackChains.reverse(),
    ...restConfig,
  };
};

module.exports = loadConfig;

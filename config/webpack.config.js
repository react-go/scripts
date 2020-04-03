const Config = require('webpack-chain');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const BetterProgressWebpackPlugin = require('../utils/betterProgress');
const paths = require('./paths');
const ReactGoConfig = require('./react-go.config');
const applyStyleLoaders = require('./applyStyleLoaders');
const babelConfigFactory = require('./babel.config');
const { getClientEnvironment, stringify } = require('./env');

const cssRegex = /\.css$/;
const sassRegex = /\.(scss|sass)$/;
const cssModulesQuery = /css_modules/;

/**
 * get webpack config
 * @param {'none' | 'development' | 'production'} [mode = 'development'] webpack mode
 * @param {boolean} [sourcemap] should generate sourcemap
 * @param {string} [appEnv] custom environment variable
 */
const getConfig = ({
  mode = 'development',
  sourcemap = false,
  appEnv,
}) => {
  const isDevMode = mode === 'development';

  const env = getClientEnvironment();
  const stringifiedEnv = stringify({ ...env, APP_ENV: appEnv });

  const config = new Config();

  config.mode(mode);
  config.bail(!isDevMode);
  config.devtool(sourcemap ? 'cheap-module-source-map' : false);
  config.stats('none');

  // entry
  if (isDevMode) {
    config.entry('main').add(require.resolve('react-dev-utils/webpackHotDevClient'));
  }
  config.entry('main').add(paths.appIndex);

  // output
  config.output
    .path(paths.appDist)
    .pathinfo(isDevMode)
    .filename(isDevMode ? 'static/js/bundle.js' : 'static/js/[name].[contenthash:8].js')
    .chunkFilename(isDevMode ? 'static/js/[name].chunk.js' : 'static/js/[name].[contenthash:8].js')
    .publicPath(ReactGoConfig.publicPath.endsWith('/') ? ReactGoConfig.publicPath : `${ReactGoConfig.publicPath}/`)
    .globalObject('this')
    .futureEmitAssets(true);

  // resolve
  config.resolve.extensions.merge(['.js', '.jsx', '.ts', '.tsx', '.json', '.mjs']);

  // optimization
  config.optimization
    .minimize(!isDevMode)
    .minimizer('terser')
      .use(require.resolve('terser-webpack-plugin'), [{
        terserOptions: {
          parser: {
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
          },
          mangle: {
            safari10: true,
          },
          output: {
            ecma: 5,
            comments: 'some',
            ascii_only: true,
          },
        },
        extractComments: false,
        sourceMap: sourcemap,
      }])
      .end()
    .minimizer('optimize-css-assets')
      .use(require.resolve('optimize-css-assets-webpack-plugin'), [{
        cssProcessorOptions: {
          parser: require('postcss-safe-parser'),
          map: sourcemap ? { inline: false, annotation: true } : false,
        },
        cssProcessorPluginOptions: {
          preset: ['default', { minifyFontValues: { removeQuotes: true } }],
        },
      }])
      .end()
    .splitChunks({
      chunks: 'all',
      name: false,
    })
    .runtimeChunk({ name: entrypoint => `runtime-${entrypoint.name}` });

  // rules
  config.module.rule('require-ensure')
    .parser({ requireEnsure: false });
  config.module.rule('eslint')
    .test(/\.(js|jsx|ts|tsx|mjs)$/)
    .include
      .add(paths.appSrc)
      .end()
    .enforce('pre')
    .use('eslint-loader')
      .loader(require.resolve('eslint-loader'))
      .options({
        cache: true,
        eslintPath: require.resolve('eslint'),
        resolvePluginsRelativeTo: __dirname,
        formatter: require.resolve('react-dev-utils/eslintFormatter'),
        baseConfig: {
          extends: require.resolve('@react-go/eslint-config'),
          parser: require.resolve('babel-eslint'),
        },
        useEslintrc: false,
      });

  // compile rules
  const compileRule = config.module.rule('compile');

  // images
  compileRule.oneOf('compile:image')
    .test([/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/])
    .use('url-loader')
      .loader(require.resolve('url-loader'))
      .options({ name: 'static/media/[name].[hash:8].[ext]' });
  // js
  compileRule.oneOf('compile:js')
    .test(/\.(js|jsx|ts|tsx|mjs)$/)
    .include.add(paths.appSrc).end()
    .use('babel-loader')
      .loader(require.resolve('babel-loader'))
      .options({
        cacheDirectory: true,
        cacheCompression: false,
        configFile: false,
        babelrc: false,
        ...babelConfigFactory(ReactGoConfig.babel),
        sourceMaps: sourcemap,
        inputSourceMap: sourcemap,
      });
  // css with css modules
  applyStyleLoaders(
    compileRule.oneOf('compile:css').test(cssRegex).resourceQuery(cssModulesQuery),
    { isDevMode, sourcemap, modules: true, usePostCSS: true },
  );
  // css without css modules
  applyStyleLoaders(
    compileRule.oneOf('compile:css:modules').test(cssRegex).set('sideEffects', true),
    { isDevMode, sourcemap, modules: false, usePostCSS: true },
  );

  const sassLoader = ['sass-loader', { implementation: require('sass') }];
  // sass with css modules
  applyStyleLoaders(
    compileRule.oneOf('compile:sass:modules').test(sassRegex).resourceQuery(cssModulesQuery),
    { isDevMode, sourcemap, modules: true, usePostCSS: true },
    sassLoader,
  );
  // sass without css modules
  applyStyleLoaders(
    compileRule.oneOf('compile:sass').test(sassRegex).set('sideEffects', true),
    { isDevMode, sourcemap, modules: false, usePostCSS: true },
    sassLoader,
  );
  // Make sure to add the new loaders before `compile:file`
  // files
  compileRule.oneOf('compile:file')
    .exclude
      .add(/\.(js|jsx|ts|tsx|mjs)$/)
      .add(/\.html$/)
      .add(/\.json$/)
      .end()
    .use('file-loader')
      .loader(require.resolve('file-loader'))
      .options({ name: 'static/media/[name].[hash:8].[ext]' });


  // plugins
  config.plugin('html-webpack-plugin')
    .use(HtmlWebpackPlugin, [{ inject: true, template: paths.appIndexHtml }]);
  config.plugin('webpack-ignore-plugin')
    .use(webpack.IgnorePlugin, [/^\.\/locale$/, /moment$/]);
  config.plugin('better-progress-plugin')
    .use(BetterProgressWebpackPlugin);
  config.plugin('webpack-define-plugin')
    .use(webpack.DefinePlugin, [stringifiedEnv]);

  if (isDevMode) {
    config.plugin('webpack-hot-module-replacement-plugin')
      .use(webpack.HotModuleReplacementPlugin);
  } else {
    config.plugin('mini-css-extract-plugin')
      .use(
        MiniCssExtractPlugin,
        [{
          filename: 'static/css/[name].[contenthash:8].css',
          chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
        }]
      );
  }

  // custom webpack config
  ReactGoConfig.webpackChains.forEach((webpackChain) => {
    webpackChain(config, { mode, sourcemap, applyStyleLoaders });
  });

  return config.toConfig();
};

module.exports = getConfig;

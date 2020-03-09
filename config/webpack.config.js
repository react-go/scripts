const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const safePostCssParser = require('postcss-safe-parser');
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent');

const BetterProgressWebpackPlugin = require('../utils/betterProgress');
const getClientEnvironment = require('./env');
const config = require('./react-go.config');
const paths = require('./paths');
const babelConfigFactory = require('./babel.config');

const useAntd = Boolean(config.antd);

const cssRegex = /\.css$/;
const sassRegex = /\.(scss|sass)$/;

module.exports = ({ mode }) => {
  const isDev = mode === 'development';
  const isProd = mode === 'production';
  const generateSourceMap = !isProd;

  const env = getClientEnvironment();

  const getStyleLoaders = (cssOptions, preProcessor) => {
    const loaders = [
      isProd ? MiniCssExtractPlugin.loader : require.resolve('style-loader'),
      {
        loader: require.resolve('css-loader'),
        options: {
          sourceMap: generateSourceMap,
          ...cssOptions,
        },
      },
      {
        loader: require.resolve('postcss-loader'),
        options: {
          sourceMap: generateSourceMap,
          ident: 'postcss',
          plugins: () => [
            require('postcss-flexbugs-fixes'),
            require('postcss-preset-env')({
              stage: 3,
              autoprefixer: {
                flexbox: 'no-2009',
              },
            }),
          ],
        },
      },
    ];
    if (preProcessor) {
      loaders.push(preProcessor);
    }
    return loaders;
  };

  return {
    mode,
    bail: isProd,
    devtool: generateSourceMap ? 'cheap-module-source-map' : false,
    entry: [
      !isProd && require.resolve('react-dev-utils/webpackHotDevClient'),
      paths.appIndex,
    ].filter(Boolean),
    output: {
      path: isProd ? paths.appDist : undefined,
      pathinfo: !isProd,
      filename: isProd
        ? 'static/js/[name].[contenthash:8].js'
        : 'static/js/bundle.js',
      chunkFilename: isProd
        ? 'static/js/[name].[contenthash:8].js'
        : 'static/js/[name].chunk.js',
      futureEmitAssets: true,
      publicPath: config.publicPath,
      globalObject: 'this',
    },
    stats: 'none',
    optimization: {
      minimize: isProd,
      minimizer: [
        new TerserPlugin({
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
          sourceMap: generateSourceMap,
        }),
        new OptimizeCSSAssetsPlugin({
          cssProcessorOptions: {
            parser: safePostCssParser,
            map: generateSourceMap
              ? { inline: false, annotation: true }
              : false,
          },
          cssProcessorPluginOptions: {
            preset: ['default', { minifyFontValues: { removeQuotes: true } }],
          },
        }),
      ],
      splitChunks: {
        chunks: 'all',
        name: false,
      },
      runtimeChunk: {
        name: entrypoint => `runtime-${entrypoint.name}`,
      },
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.wasm', '.mjs'],
      alias: {
        '@': paths.appSrc,
      },
    },
    module: {
      strictExportPresence: true,
      rules: [
        {
          parser: { requireEnsure: false },
        },
        {
          test: /\.(js|jsx|ts|tsx|mjs)$/,
          include: paths.appSrc,
          enforce: 'pre',
          loader: require.resolve('eslint-loader'),
          options: {
            cache: true,
            eslintPath: require.resolve('eslint'),
            resolvePluginsRelativeTo: __dirname,
            formatter: require.resolve('react-dev-utils/eslintFormatter'),
            baseConfig: {
              extends: require.resolve('./eslint.config.js'),
              parser: require.resolve('babel-eslint'),
            },
            useEslintrc: false,
          },
        },
        {
          oneOf: [
            {
              test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
              loader: require.resolve('url-loader'),
              options: {
                limit: 10000,
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
            {
              test: /\.(js|jsx|ts|tsx|mjs)$/,
              include: paths.appSrc,
              loader: require.resolve('babel-loader'),
              options: {
                cacheDirectory: true,
                cacheCompression: false,
                configFile: false,
                babelrc: false,
                ...babelConfigFactory({ antd: useAntd }),
                sourceMaps: generateSourceMap,
                inputSourceMap: generateSourceMap,
              },
            },
            {
              test: cssRegex,
              resourceQuery: /css_modules/,
              use: getStyleLoaders({
                importLoaders: 1,
                modules: {
                  getLocalIdent: getCSSModuleLocalIdent,
                },
              }),
            },
            {
              test: cssRegex,
              use: getStyleLoaders({ importLoaders: 1 }),
              sideEffects: true,
            },
            {
              test: sassRegex,
              resourceQuery: /css_modules/,
              use: getStyleLoaders(
                {
                  importLoaders: 2,
                  modules: {
                    getLocalIdent: getCSSModuleLocalIdent,
                  },
                },
                {
                  loader: require.resolve('sass-loader'),
                  options: {
                    implementation: require('sass'),
                  },
                },
              ),
            },
            {
              test: sassRegex,
              use: getStyleLoaders(
                { importLoaders: 2 },
                {
                  loader: require.resolve('sass-loader'),
                  options: {
                    implementation: require('sass'),
                  },
                },
              ),
              sideEffects: true,
            },
            useAntd && {
              test: /\.less$/,
              include: /node_modules\/antd/,
              use: [
                {
                  loader: isProd ? MiniCssExtractPlugin.loader : 'style-loader',
                },
                {
                  loader: require.resolve('css-loader'),
                  options: {
                    importLoaders: 1,
                    sourceMap: generateSourceMap,
                  },
                },
                {
                  loader: require.resolve('less-loader'),
                  options: {
                    modifyVars:
                      config.antd === true
                        ? {}
                        : require(path.resolve(paths.appRoot, config.antd)),
                    javascriptEnabled: true,
                    sourceMap: generateSourceMap,
                  },
                },
              ],
            },
            {
              loader: require.resolve('file-loader'),
              exclude: [/\.(js|jsx|ts|tsx|mjs)$/, /\.html$/, /\.json$/],
              options: {
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
          ].filter(Boolean),
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({ inject: true, template: paths.appIndexHtml }),
      new webpack.DefinePlugin(env.stringified),
      !isProd && new webpack.HotModuleReplacementPlugin(),
      isProd &&
        new MiniCssExtractPlugin({
          filename: 'static/css/[name].[contenthash:8].css',
          chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
        }),
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      new BetterProgressWebpackPlugin(),
    ].filter(Boolean),
  };
};

module.exports = function applyStyleLoaders(
  rule,
  options,
  ...extraLoaders
) {
  const { isDevMode, sourcemap, modules, usePostCSS } = options;

  const importLoaders = extraLoaders
    ? extraLoaders.length + (usePostCSS ? 1 : 0)
    : usePostCSS ? 1 : 0;

  let cssLoaderOptions = {
    sourceMap: sourcemap,
    importLoaders,
  };
  if (modules) {
    cssLoaderOptions = {
      ...cssLoaderOptions,
      localsConvention: 'camelCase',
      modules: {
        getLocalIdent: require('../utils/getCSSModuleLocalIdent'),
      },
    };
  }

  rule.before('compile:file');

  rule
    .use('style-loader')
      .loader(isDevMode
        ? require.resolve('style-loader')
        : require.resolve('mini-css-extract-plugin/dist/loader')
      )
      .end()
    .use('css-loader')
      .loader(require.resolve('css-loader'))
      .options(cssLoaderOptions)
      .end();

  if (usePostCSS) {
    rule.use('postcss-loader')
      .loader(require.resolve('postcss-loader'))
      .options({
        sourceMap: sourcemap,
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
      })
      .end();
  }

  if (extraLoaders) {
    extraLoaders.forEach(extraLoader => {
      const loaderName = extraLoader[0];
      const loaderOptions = extraLoader[1] || {};

      rule.use(loaderName)
        .loader(require.resolve(loaderName))
        .options(loaderOptions)
        .end();
    });
  }
};

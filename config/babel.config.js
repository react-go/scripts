/**
 * get Babel config
 * @param {array} [presets] extra Babel presets
 * @param {array} [plugins] extra Babel plugins
 * @returns Babel configuration object
 */
module.exports = (babelConfig, isDevMode) => {
  const { presets = [], plugins = [] } = babelConfig;
  return {
    presets: [
      require.resolve('@babel/preset-env'),
      require.resolve('@babel/preset-react'),
      ...presets,
    ],
    plugins: [
      isDevMode && [require.resolve('react-refresh/babel')],
      [require.resolve('@babel/plugin-proposal-class-properties'), { loose: true }],
      [
        require.resolve('@react-go/babel-plugin-auto-css-modules'),
        { flag: 'css_modules', extensions: ['.css', '.scss', '.sass'] },
      ],
      ...plugins,
    ].filter(Boolean),
  };
};

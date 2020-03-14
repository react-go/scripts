/**
 * @param {Boolean|Object} [antd]
 */
module.exports = ({ antd }) => {
  const useAntd = Boolean(antd);
  const isAntdMobile = antd && antd.mobile;
  return {
    presets: [
      require.resolve('@babel/preset-env'),
      require.resolve('@babel/preset-react'),
    ],
    plugins: [
      require.resolve('@babel/plugin-proposal-class-properties'),
      [require.resolve('@babel/plugin-proposal-decorators'), { decoratorsBeforeExport: true }],
      useAntd && [
        require.resolve('babel-plugin-import'),
        { libraryName: isAntdMobile ? 'antd-mobile' : 'antd', libraryDirectory: 'es', style: true },
      ],
      [
        require.resolve('@react-go/babel-plugin-auto-css-modules'),
        { flag: 'css_modules', extensions: ['.css', '.scss', '.sass'] },
      ]
    ].filter(Boolean),
  };
};

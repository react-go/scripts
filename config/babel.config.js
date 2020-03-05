/**
 * @param {Boolean} [antd]
 */
module.exports = ({ antd }) => {
  return {
    presets: [
      require.resolve('@babel/preset-env'),
      require.resolve('@babel/preset-react'),
    ],
    plugins: [
      require.resolve('@babel/plugin-proposal-class-properties'),
      [require.resolve('@babel/plugin-proposal-decorators'), { decoratorsBeforeExport: true }],
      antd && [
        require.resolve('babel-plugin-import'),
        { libraryName: 'antd', libraryDirectory: 'es', style: true },
      ],
      require.resolve('../utils/autoCSSModules'),
    ].filter(Boolean),
  };
};

/**
 * @param {Boolean} [antd]
 */
module.exports = ({ antd }) => {
  return {
    presets: [
      '@babel/preset-env',
      '@babel/preset-react',
    ],
    plugins: [
      '@babel/plugin-proposal-class-properties',
      ['@babel/plugin-proposal-decorators', { decoratorsBeforeExport: true }],
      antd && [
        'import',
        { libraryName: 'antd', libraryDirectory: 'es', style: true },
      ],
    ].filter(Boolean),
  };
};

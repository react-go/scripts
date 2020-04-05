const fs = require('fs');
const path = require('path');
const gzipSize = require('gzip-size');
const fileSize = require('filesize');
const stripAnsi = require('strip-ansi');
const chalk = require('chalk');

const fileSizeReporter = (webpackStats, appDist) => {
  const assets = webpackStats.toJson({ all: false, assets: true }).assets
    .filter(asset => /\.(js|css)$/.test(asset.name))
    .map(asset => {
      const fileContent = fs.readFileSync(path.resolve(appDist, asset.name));
      const size = gzipSize.sync(fileContent);
      return {
        folder: path.join(
          path.basename(appDist),
          path.dirname(asset.name)
        ),
        name: path.basename(asset.name),
        size,
        sizeLabel: fileSize(size),
      };
    })
    .sort((a, b) => b.size - a.size);
  const longestSizeLabelLength = Math.max.apply(
    null,
    assets.map(a => stripAnsi(a.sizeLabel).length),
  );
  assets.forEach((asset) => {
    let sizeLabel = asset.sizeLabel;
    const sizeLength = stripAnsi(sizeLabel).length;
    if (sizeLength < longestSizeLabelLength) {
      const rightPadding = ' '.repeat(longestSizeLabelLength - sizeLength);
      sizeLabel += rightPadding;
    }
    console.log(`  ${sizeLabel}  ${chalk.dim(asset.folder + path.sep) + chalk.cyan(asset.name)}`)
  });
};

module.exports = fileSizeReporter;

const { merge } = require('webpack-merge');
const common = require('./webpack.common');
// const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
  },
  output: {
    clean: true,
  },
  optimization: {
    minimize: true,
    minimizer: [
      new OptimizeCSSAssetsPlugin({}),
      '...',
    ],
  },
});

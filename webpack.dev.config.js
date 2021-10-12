const merge = require('webpack-merge');
const common = require('./webpack.common.js');

var config = merge(common, {
  mode: "development",
  devtool: "eval-source-map",
});

module.exports = config;

const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

const config = merge(common, {
  mode: "development",
  devtool: "eval-source-map",
});

module.exports = config;

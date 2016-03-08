var webpack = require("webpack");

var config = {
  entry: {
    app: [
      'webpack/hot/dev-server',
      "./src/index.ts"
    ]
  },
  output: {
    filename: "circulation-web.js",
    publicPath: 'http://localhost:8090/dist',
    library: "CirculationWeb",
    libraryTarget: "umd"
  },
  plugins: [
    new webpack.DefinePlugin({ "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV) })
  ],
  module: {
    loaders: [
      {
        test: /\.tsx?$/,
        exclude: [/node_modules/],
        loader: 'ts-loader'
      },
      {
        test: /\.json$/,
        loaders: ['json-loader']
      }
    ],
  },
  resolve: {
    extensions: ["", ".js", ".ts", ".tsx"]
  }
};

module.exports = config;
var webpack = require("webpack");
var path = require("path");

var config = {
  entry: {
    app: [
      'webpack/hot/dev-server',
      "./src/index.tsx"
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
      },
      {
        test: /\.css$/,
        loader: 'style!css'
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader?limit=100000'
      }
    ],
  },
  resolve: {
    extensions: ["", ".js", ".ts", ".tsx"],
    root: path.resolve(__dirname, "node_modules")
  }
};

module.exports = config;
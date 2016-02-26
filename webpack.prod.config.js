var webpack = require("webpack");

var config = {
  entry: {
    app: [
      "./src/index.ts"
    ]
  },
  output: {
    path: "./lib",
    filename: "index.js",
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
        loader: 'json-loader'
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
    extensions: ["", ".js", ".ts", ".tsx"]
  }
};

module.exports = config;
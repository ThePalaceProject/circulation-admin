/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
/* eslint-enable @typescript-eslint/no-var-requires */

module.exports = {
  entry: {
    // app.css must be listed first so Tailwind v4's @theme CSS-variable block
    // (injected via @import "tailwindcss") is available before app.scss runs.
    app: [
      "./src/stylesheets/app.css",
      "./src/stylesheets/app.scss",
      "./src/index.tsx",
    ],
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "circulation-admin.js",
    library: "CirculationAdmin",
    libraryTarget: "umd",
  },
  plugins: [
    new CleanWebpackPlugin(),
    // jsdom is needed for server rendering, but causes errors
    // in the browser even if it is never used, so we ignore it:
    new webpack.IgnorePlugin({ resourceRegExp: /jsdom$/ }),
    // Extract separate css file.
    new MiniCssExtractPlugin({ filename: "circulation-admin.css" }),
    // Set a local global variable in the app that will be used only
    // for testing AXE in development mode.
    new webpack.DefinePlugin({
      "process.env.TEST_AXE": JSON.stringify(process.env.TEST_AXE),
    }),
    // Publish the logo to dist.
    new CopyPlugin({
      patterns: ["src/images/PalaceCollectionManagerLogo.svg"],
    }),
  ],
  optimization: {
    minimizer: [new TerserPlugin({ terserOptions: { compress: false } })],
  },
  module: {
    rules: [
      {
        // Plain CSS files (e.g. app.css) — no sass-loader, just css-loader +
        // postcss-loader so that Tailwind v4's @import "tailwindcss" directive
        // reaches the PostCSS plugin intact.
        test: /\.css$/,
        exclude: /node_modules/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
      },
      {
        test: /\.scss$/,
        // postcss-loader runs after sass-loader converts SCSS → CSS,
        // allowing Tailwind utilities to be processed in the same pipeline.
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.tsx?$/,
        exclude: [/node_modules/],
        use: ["ts-loader"],
      },
      {
        test: /\.(ttf|woff|eot|woff2)(\?[\s\S]+)?$/,
        type: "asset/resource",
      },
      {
        test: /\.(svg|png|gif|jpg)(\?[\s\S]+)?$/,
        use: ["url-loader?limit=100000"],
      },
    ],
  },
  resolve: {
    alias: {
      react: path.resolve("./node_modules/react"),
    },
    extensions: [".ts", ".tsx", ".js", ".scss"],
    fallback: {
      stream: require.resolve("stream-browserify"),
      timers: require.resolve("timers-browserify"),
      url: require.resolve("url"),
    },
  },
};

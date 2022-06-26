const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const Webpack = require("webpack");
const autoprefixer = require("autoprefixer");

module.exports = ["source-map"].map((devtool) => ({
  mode: "production",
  entry: "./src/scripts/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "image-compare-viewer.min.js",
    library: "ImageCompare",
    libraryTarget: "umd",
    libraryExport: "default",
    umdNamedDefine: true,
  },
  devtool,
  optimization: {
    runtimeChunk: false,
  },
  plugins: [
    new Webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production"),
    }),
    new Webpack.optimize.ModuleConcatenationPlugin(),
    new MiniCssExtractPlugin({
      filename: "image-compare-viewer.min.css",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.s?css/i,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [[autoprefixer()]],
              },
            },
          },
          "sass-loader",
        ],
      },
    ],
  },
}));

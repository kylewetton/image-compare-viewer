const path = require("path");

module.exports = ["source-map"].map((devtool) => ({
  mode: "development",
  entry: "./src/scripts/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "image-compare-viewer.js",
    library: "imageCompareViewer",
  },
  devtool,
  optimization: {
    runtimeChunk: true,
  },
}));

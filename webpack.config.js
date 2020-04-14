const path = require("path");

module.exports = ["source-map"].map((devtool) => ({
  mode: "production",
  entry: "./src/scripts/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "image-compare-viewer.min.js",
    library: "imageCompareViewer",
    libraryTarget: "umd",
    libraryExport: "default",
    umdNamedDefine: true,
  },
  devtool,
  optimization: {
    runtimeChunk: false,
  },
}));

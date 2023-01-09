// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const isProduction = process.env.NODE_ENV == "production";

const stylesHandler = "style-loader";

const config = {
  entry: "./src/index.ts",
  output: {
    library: 'poky',
    libraryTarget: 'umd',
    filename: 'poky.js',
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: "ts-loader",
        exclude: ["/node_modules/", "/src/index"],
      },
    ],
  },
  resolve: {
    alias: {
      three: path.resolve('./node_modules/three')
    },
    extensions: [".tsx", ".ts", ".jsx", ".js", "..."],
  },
  externals: {
    three: 'three'
  }
};

module.exports = () => {
  if (isProduction) {
    config.mode = "production";
  } else {
    config.mode = "development";
  }
  return config;
};

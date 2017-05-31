var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: {
    "app" : "./app.js",
/*
    "vendor" : [
        "quill",
        "registry",
        "parchment"
    ]
*/
  },
  output: {
    path: __dirname + "/dist",
    filename: "bundle.js"
  },
  devtool: 'source-map',
  resolve: {
    alias: {
      'parchment': path.resolve(__dirname, 'node_modules/parchment/src/parchment.ts'),
      'registry': path.resolve(__dirname, 'node_modules/parchment/src/registry.ts'),
      'quill$': path.resolve(__dirname, 'node_modules/quill/quill.js'),
      'deep-equal$': path.resolve(__dirname, 'node_modules/deep-equal/index.js'),
      'katex': path.resolve(__dirname, 'node_modules/katex/dist/katex.js'),
    },
    extensions: ['.js', '.ts', '.svg']
  },
  plugins: [
/*
      new webpack.optimize.CommonsChunkPlugin(
          {'name': 'vendor', 'filename': 'vendor.bundle.js'}),
*/
  ],
  module: {
    rules: [{
      test: /\.js$/,
      use: [{
        loader: 'babel-loader',
        options: {
          presets: ['es2015']
        }
      }],
    }, {
      test: /\.ts$/,
      use: [{
        loader: 'ts-loader',
        options: {
          compilerOptions: {
            declaration: false,
            sourceMap: true,
            target: 'es5',
            module: 'commonjs',

            //debug features
            allowUnreachableCode: true,
          },
          transpileOnly: true
        }
      }]
    }, {
      test: /\.(svg|html)$/,
      use: [{
        loader: 'html-loader',
        options: {
          minimize: true
        }
      }]
    }]
  }
};

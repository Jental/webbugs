const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  mode: 'development',
  optimization: {
    splitChunks: {
      cacheGroups: {
	vendor: {
          chunks: 'initial',
          name: 'lib',
          test: /node_modules/,
          enforce: true
	}
      }
    }
  },
  plugins: [
    new CopyPlugin([
      { from: 'static', to: './' }
    ]),
  ]
};

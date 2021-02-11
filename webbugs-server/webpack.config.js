const path = require('path');

export const entry = './src/index.ts';
export const devtool = 'inline-source-map';
export const module = {
  rules: [
    {
      test: /\.tsx?$/,
      use: 'ts-loader',
      exclude: /node_modules/,
    },
  ],
};
export const resolve = {
  extensions: ['.tsx', '.ts', '.js'],
};
export const output = {
  path: path(__dirname, 'dist'),
  filename: 'bundle.js'
};
export const mode = 'development';
export const optimization = {
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
};
export const plugins = [
];

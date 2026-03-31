const path = require('path');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const { VanillaExtractPlugin } = require('@vanilla-extract/webpack-plugin');

module.exports = {
  webpack: {
    plugins: {
      add: [
        new VanillaExtractPlugin({
          identifiers: process.env.NODE_ENV === 'development' ? 'debug' : 'short',
        }),
      ],
    },
    configure: (webpackConfig) => {
      const moduleScopePlugin = webpackConfig.resolve.plugins.find(
        (plugin) => plugin instanceof ModuleScopePlugin
      );

      if (moduleScopePlugin) {
        const vanillaExtractPath = path.resolve(
          __dirname,
          'node_modules/@vanilla-extract/webpack-plugin'
        );

        if (!moduleScopePlugin.allowedPaths.includes(vanillaExtractPath)) {
          moduleScopePlugin.allowedPaths.push(vanillaExtractPath);
        }
      }

      return webpackConfig;
    },
  },
  jest: {
    configure: (jestConfig) => {
      jestConfig.transform = {
        '\\.css\\.ts$': '@vanilla-extract/jest-transform',
        ...jestConfig.transform,
      };

      return jestConfig;
    },
  },
};

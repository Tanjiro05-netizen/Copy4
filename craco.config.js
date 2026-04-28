const path = require('path');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const { VanillaExtractPlugin } = require('@vanilla-extract/webpack-plugin');
const WebpackObfuscator = require('webpack-obfuscator');
const { InjectManifest } = require('workbox-webpack-plugin');

const enableObfuscation = process.env.ENABLE_OBFUSCATION === 'true';
const enableServiceWorker = process.env.ENABLE_SERVICE_WORKER === 'true';

module.exports = {
  webpack: {
    plugins: {
      add: [
        new VanillaExtractPlugin({
          identifiers: process.env.NODE_ENV === 'development' ? 'debug' : 'short',
        }),
        ...(process.env.NODE_ENV === 'production'
          ? [
              ...(enableServiceWorker
                ? [
                    new InjectManifest({
                      swSrc: path.resolve(__dirname, 'src/service-worker.js'),
                      swDest: 'service-worker.js',
                      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
                    }),
                  ]
                : []),
              ...(enableObfuscation
                ? [
                    new WebpackObfuscator(
                      {
                        rotateStringArray: true,
                        stringArray: true,
                        stringArrayEncoding: ['base64'],
                        stringArrayThreshold: 0.75,
                        controlFlowFlattening: true,
                        controlFlowFlatteningThreshold: 0.5,
                        deadCodeInjection: true,
                        deadCodeInjectionThreshold: 0.2,
                        selfDefending: true,
                        identifierNamesGenerator: 'hexadecimal',
                        renameGlobals: false,
                        disableConsoleOutput: false,
                      },
                      ['*.chunk.js']
                    ),
                  ]
                : []),
            ]
          : []),
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

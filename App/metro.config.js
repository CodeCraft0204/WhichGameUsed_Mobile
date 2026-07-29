const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Large local image sets (photo editor backgrounds) can exhaust worker memory.
config.maxWorkers = 2;

config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true
    }
  })
};

// Bundle Education PDF guides as Metro assets.
if (!config.resolver.assetExts.includes('pdf')) {
  config.resolver.assetExts.push('pdf');
}

module.exports = config;

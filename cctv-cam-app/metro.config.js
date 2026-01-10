const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
 
const config = getDefaultConfig(__dirname);

// Add .tflite files to asset extensions
config.resolver.assetExts.push('tflite');

module.exports = withNativeWind(config, { input: './app/global.css' });

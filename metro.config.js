// Import Expo's helper that builds the default Metro bundler settings for this project
const { getDefaultConfig } = require('expo/metro-config');

// Create the default Metro config, using this folder (the project root) as the starting point
const config = getDefaultConfig(__dirname);

// Add "glb" to the list of file types Metro treats as assets, so 3D models like fish.glb can be loaded
config.resolver.assetExts.push('glb');

// Prefer Three.js's ESM entry over its deprecated CommonJS entry. The CommonJS
// build calls process.emitWarning(), which is not available in Expo Go's
// React Native runtime.
config.resolver.resolverMainFields = ['react-native', 'browser', 'module', 'main'];

// Export the updated config so Expo uses it when bundling the app
module.exports = config;

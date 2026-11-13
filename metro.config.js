// Import Expo's helper that builds the default Metro bundler settings for this project
const { getDefaultConfig } = require('expo/metro-config');

// Create the default Metro config, using this folder (the project root) as the starting point
const config = getDefaultConfig(__dirname);

// Add "glb" to the list of file types Metro treats as assets, so 3D models like fish.glb can be loaded
config.resolver.assetExts.push('glb');

// Export the updated config so Expo uses it when bundling the app
module.exports = config;

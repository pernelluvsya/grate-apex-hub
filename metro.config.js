const { getDefaultConfig } = require("expo/metro-config");
const config = getDefaultConfig(__dirname);
// Study guides are .html files shipped as assets (not bundled as code).
config.resolver.assetExts.push("html");
module.exports = config;

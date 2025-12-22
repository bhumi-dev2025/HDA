const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

// 1. ડિફોલ્ટ કોન્ફિગ મેળવો
const config = getDefaultConfig(__dirname);

// 2. Transformer અને Resolver છૂટા પાડો
const { transformer, resolver } = config;

// 3. SVG Transformer સેટઅપ કરો
config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};

config.resolver = {
  ...resolver,
  // SVG ને asset માંથી કાઢી નાખો
  assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
  // SVG ને source કોડમાં ઉમેરો
  sourceExts: [...resolver.sourceExts, "svg"],
};

// 4. છેલ્લે NativeWind સાથે એક્સપોર્ટ કરો
module.exports = withNativeWind(config, { input: './global.css' });
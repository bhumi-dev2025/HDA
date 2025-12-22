module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      'react-native-reanimated/plugin', // <--- આ લાઈન ઉમેરો (છેલ્લે હોવી જોઈએ)
    ],
  };
};
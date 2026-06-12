module.exports = function (api) {
  const isTest = process.env.NODE_ENV === 'test';
  api.cache(!isTest);
  return {
    presets: [require.resolve('expo/internal/babel-preset')],
    plugins: isTest ? [] : ['react-native-reanimated/plugin'],
  };
};

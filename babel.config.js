module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@navigators': './src/navigators',
            '@utils': './src/utils',
            '@assets': './src/assets',
            '@apis': './src/apis',
            '@constants': './src/constants',
            '@contexts': './src/contexts',
            '@hooks': './src/hooks',
            '@store': './src/store',
            '@styles': './src/styles',
          },
        },
      ],
    ],
  };
}; 
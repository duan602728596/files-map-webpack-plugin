module.exports = function(api) {
  api.cache(true);

  return {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            browsers: ['node 10']
          },
          debug: false,
          modules: 'commonjs',
          bugfixes: true
        }
      ]
    ],
    plugins: [
      '@babel/plugin-proposal-class-properties'
    ]
  };
};
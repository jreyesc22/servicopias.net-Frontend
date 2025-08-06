const path = require('path');
const webpack = require('webpack');

module.exports = {
  chainWebpack: config => {
    config.plugin('define').tap(definitions => {
      Object.assign(definitions[0], {
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
        __VUE_OPTIONS_API__: JSON.stringify(true),
        __VUE_PROD_DEVTOOLS__: JSON.stringify(false)
      });
      return definitions;
    });
  },

  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  },
};

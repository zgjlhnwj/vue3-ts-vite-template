module.exports = {
    plugins: {
      autoprefixer: {},
      'postcss-pxtorem': {
        rootValue: 16,
        propList: ['*'],
        exclude: /node_modules/i
      }
    }
  }  
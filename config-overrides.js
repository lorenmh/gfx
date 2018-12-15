const { injectBabelPlugin } = require('react-app-rewired');

module.exports = (config, env) => {
  config = injectBabelPlugin('babel-plugin-styled-components', config)
  return config;
}

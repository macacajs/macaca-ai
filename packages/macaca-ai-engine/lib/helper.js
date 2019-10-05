'use strict';

const utils = require('macaca-utils');

const _ = utils.merge({}, utils);

_.getConfigFromEnv = (config = {}, key, list) => {
  const _config = config[key] || {};
  const prefix = `MACACA_AI_ENGINE_${key.toUpperCase()}`;

  list.forEach(key => {
    _config[key] = null;
  });

  for (let key in _config) {
    const envKey = `${prefix}_${_.kebabCase(key).replace(/-/g, '_').toUpperCase()}`;
    _config[key] = process.env[envKey] || _config[key];
  }
  return _config;
};

module.exports = _;

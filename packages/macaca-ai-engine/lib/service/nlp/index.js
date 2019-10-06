'use strict';

// const MacacaNLP = require('./macaca');
const BaiduNLP = require('./baidu');
// const XFYunNLP = require('./xfyun');
const _ = require('../../helper');

class NLP {
  constructor(config) {
    config = _.getConfigFromEnv(config, 'baidunlp', [
      'appId',
      'accessKeyId',
      'secretAccessKey',
    ]);
    // this.client = new XFYunNLP(config);
    this.client = new BaiduNLP(config);
  }

  async depparser(text) {
    return await this.client.depparser(text);
  }
}

module.exports = NLP;


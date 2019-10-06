'use strict';

const OCR = require('./ocr');
const _ = require('../../helper');

class CV {
  constructor(config) {
    config = _.getConfigFromEnv(config, 'aliocr', [
      'accessKeyId',
      'secretAccessKey',
    ]);
    this.client = new OCR(config);
  }

  async ocr(url) {
    return await this.client.scan(url);
  }
}

module.exports = CV;

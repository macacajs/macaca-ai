'use strict';

const OCR = require('./ocr');

class CV {
  constructor(config) {
    this.client = new OCR();
  }

  async ocr(url) {
    return await this.client.scan(url);
  }
}

module.exports = CV;

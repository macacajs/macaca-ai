'use strict';

const Green = require('./green');

class OCR {
  constructor(config) {
    this.client = new Green(config);
  }

  async scan(url) {
    return await this.client.scan(url);
  }
}

module.exports = OCR;

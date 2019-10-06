'use strict';

const { nlp: AipNlpClient, } = require('baidu-aip-sdk');

class BaiduNLP {
  constructor(config) {
    const {
      appId: APP_ID,
      accessKeyId: API_KEY,
      secretAccessKey: SECRET_KEY,
    } = config;
    this.client = new AipNlpClient(APP_ID, API_KEY, SECRET_KEY);
  }

  /**
   * https://cloud.baidu.com/doc/NLP/s/yjwvylemg
   * @param {*} text
   */
  async depparser(text) {
    return await this.client.depparser(text);
  }
}

module.exports = BaiduNLP;

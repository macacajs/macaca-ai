'use strict';

const urllib = require('urllib');
const utility = require('utility');

class XFYun {
  constructor(config) {
    this.config = config;
  }

  /**
   * https://www.xfyun.cn/doc/nlp/dependencyParsing/API.html#%E6%8E%A5%E5%8F%A3%E8%BF%94%E5%9B%9E%E5%8F%82%E6%95%B0
   * @param {*} text
   */
  async depparser(text) {
    const {
      appId,
      apiKey,
    } = this.config;
    const gateway = 'http://ltpapi.xfyun.cn/v1/dp';
    const curTime = utility.timestamp();
    const param = utility.base64encode(JSON.stringify({ type: 'dependent', }));
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      'X-Appid': appId,
      'X-CurTime': curTime,
      'X-Param': param,
      'X-CheckSum': utility.md5(`${apiKey}${curTime}${param}`),
    };
    return await urllib.request(gateway, {
      method: 'POST',
      data: {
        text,
      },
      dataType: 'json',
      headers,
    });
  }
}

module.exports = XFYun;

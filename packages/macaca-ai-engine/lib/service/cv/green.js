'use strict';

const crypto = require('crypto');
const urllib = require('urllib');

const _ = require('../../helper');

/**
 * https://help.aliyun.com/document_detail/63005.html
 */
class Green {
  constructor(config) {
    const {
      accessKeyId,
      secretAccessKey,
    } = config;
    this.config = {
      gateway: 'https://green.cn-shanghai.aliyuncs.com',
      accessKeyId,
      secretAccessKey,
    };
  }

  async scan(url) {
    const res = await this.request('/green/image/scan', {
      scenes: [ 'ocr', ],
      tasks: [{
        url,
      }, ],
    });
    return _.get(res, '[0].results[0]');
  }

  async request(path, data) {
    const headers = {
      Date: new Date().toUTCString(),
      'Content-MD5': crypto
        .createHash('md5')
        .update(JSON.stringify(data))
        .digest()
        .toString('base64'),
      'x-acs-version': '2017-01-12',
      'x-acs-signature-nonce': _.uuid(),
      'x-acs-signature-version': '1.0',
      'x-acs-signature-method': 'HMAC-SHA1',
    };

    headers.authorization = this._genAuth(path, headers);

    const requestOpts = {
      contentType: 'json',
      dataType: 'json',
      method: 'POST',
      timeout: 3000,
      headers,
      data,
    };

    const url = `${this.config.gateway}${path}`;
    let res;

    try {
      res = await urllib.request(url, requestOpts);

      if (res.data && res.data.code === 200) {
        return res.data.data;
      }

      const error = new Error('GreenRequestError');
      error.name = `[GREEN] request error, ${res.status}`;
      error.data = data;
      error.url = url;
      throw error;
    } finally {
    }
  }

  _genAuth(path, headers) {
    const { accessKeyId, secretAccessKey, } = this.config;
    const signstr = [
      'POST',
      'application/json',
      headers['Content-MD5'],
      'application/json',
      headers.Date,
      `x-acs-signature-method:${headers['x-acs-signature-method']}`,
      `x-acs-signature-nonce:${headers['x-acs-signature-nonce']}`,
      `x-acs-signature-version:${headers['x-acs-signature-version']}`,
      `x-acs-version:${headers['x-acs-version']}`,
      path,
    ].join('\n');
    const authorization = crypto
      .createHmac('sha1', secretAccessKey)
      .update(signstr)
      .digest()
      .toString('base64');
    return `acs ${accessKeyId}:${authorization}`;
  }
}

module.exports = Green;

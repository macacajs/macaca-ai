'use strict';

const ALY = require('aliyun-sdk');
const { parse: urlParse, } = require('url');

const _ = require('../helper');

class ObjectStorage {
  constructor(config = {}) {
    config = _.getConfigFromEnv(config, 'alioss', [
      'accessKeyId',
      'secretAccessKey',
      'bucket',
      'endpoint',
    ]);
    config.endpoint = config.endpoint || 'http://oss-cn-hangzhou.aliyuncs.com';
    this.config = config;
    const {
      accessKeyId,
      secretAccessKey,
      endpoint,
    } = this.config;
    this.oss = new ALY.OSS({
      accessKeyId,
      secretAccessKey,
      endpoint,
      apiVersion: '2013-10-15',
    });
  }

  async putObject(data, name) {
    const filename = name || `${_.moment().format('YYYYMMDDhhmmss')}.jpg`;
    const {
      bucket,
      endpoint,
    } = this.config;
    return new Promise((resolve, reject) => {
      this.oss.putObject({
        Bucket: bucket,
        Key: filename,
        Body: data,
        AccessControlAllowOrigin: '',
        ContentType: 'text/plain',
        CacheControl: 'no-cache',
        ContentDisposition: '',
        ContentEncoding: 'utf-8',
        ServerSideEncryption: 'AES256',
        Expires: null,
      }, (err, data) => {
        if (err) {
          return reject(err);
        }
        const { host, } = urlParse(endpoint);
        const url = `https://${bucket}.${host}/${filename}`;
        resolve(url);
      });
    });
  }
}

module.exports = ObjectStorage;

'use strict';

const fs = require('fs');
const path = require('path');

const _ = require('./helper');
const Service = require('./service');

const handleMap = {
  get(obj) {
    const { items: data, } = obj;
    const VOB = data.find(item => item.deprel === 'VOB');
    return {
      api: 'get',
      params: [
        VOB.word,
      ],
    };
  },
  clickElement(obj) {
    const { items: data, } = obj;
    const attWord = data
      .filter(item => item.deprel === 'COO' || item.deprel === 'ATT')
      .map(item => item.word)
      .join('');
    const VOB = data.find(item => item.deprel === 'VOB');
    return {
      api: 'clickElement',
      params: [
        VOB.word,
        attWord,
      ],
    };
  },
  input(obj) {
    const { items: data, text, } = obj;
    const VOB = data.find(item => item.deprel === 'VOB');
    const POB = data.find(item => item.deprel === 'POB');
    const ATT = data.find(item => item.deprel === 'ATT');
    const cooWords = data
      .filter(item => item.deprel === 'COO')
      .map(item => item.word)
      .join('');
    const match1 = text.match(/在(\S+)输入框输入(\S+)/);
    if (match1) {
      return {
        api: 'input',
        params: [
          match1[1],
          match1[2],
        ],
      };
    }
    const matchIdex = ATT.word.match(/第(\S)个/);
    let index;
    if (matchIdex) {
      const indexWord = matchIdex[1];
      index = [
        '一',
        '二',
        '三',
        '四',
      ].indexOf(indexWord);
    }
    // 在第x个输入框输入xx
    return {
      api: 'input',
      params: [
        ATT.word,
        VOB.word,
        cooWords,
        {
          index,
          isInput: [ '输入框', ].includes(POB && POB.word),
        },
      ],
    };
  },
  sleep(obj) {
    const { items: data, } = obj;
    const VOB = data.find(item => item.deprel === 'VOB');
    const QUN = data.find(item => item.deprel === 'QUN');
    return {
      api: 'sleep',
      params: [
        VOB.word,
        QUN.word,
      ],
    };
  },
  scroll(obj) {
    const { items: data, } = obj;
    return {
      api: 'scroll',
      params: [
      ],
    };
  },
};

const caseFactory = obj => {
  const { items: data, } = obj;
  const HED = data.find(item => item.deprel === 'HED');
  let target;
  if ([ '访问', '打开', ].includes(HED.word)) {
    target = 'get';
  } else if ([ '单击', '点击', ].includes(HED.word)) {
    target = 'clickElement';
  } else if ([ '输入', '键入', ].includes(HED.word)) {
    target = 'input';
  } else if ([ '等待', '等', ].includes(HED.word)) {
    target = 'sleep';
  } else if ([ '滚', '滚动', ].includes(HED.word)) {
    target = 'scroll';
  }

  if (target) {
    return handleMap[target](obj);
  }
  console.log(obj);
};

class MacacaAIEngine {
  constructor(config) {
    this.service = Service(config);
  }

  async imageRecognize(base64) {
    const data = new Buffer.from(base64, 'base64');
    const url = await this.service.storage.putObject(data);
    const ocrRes = await this.service.cv.ocr(url);
    return ocrRes.ocrLocations;
  }

  async imageRecognizeFromPath(filePath) {
    const relativePath = path.resolve(filePath);
    if (!_.isExistedFile(relativePath)) {
      console.log(relativePath);
      return;
    }
    const bitmap = fs.readFileSync(filePath);
    return await this.imageRecognize(new Buffer(bitmap).toString('base64'));
  }

  async nlpConvert(text) {
    const res = await this.service.nlp.depparser(text);
    return caseFactory(res);
  }
}

module.exports = MacacaAIEngine;

'use strict';

const Promise = require('bluebird');

const _ = require('./helper');
const MacacaAIEngine = require('./engine');

require('dotenv').config();

module.exports = (wd, config = {}) => {
  const engine = new MacacaAIEngine(config);

  wd.addPromiseChainMethod('nlpSection', function(text) {
    const list = text
      .split('\n')
      .map(text => text.trim())
      .filter(text => text);
    return Promise.each(list, (text) => this.nlpLine(text));
  });

  wd.addPromiseChainMethod('nlpLine', function(text) {
    console.log(text);
    if (['拖动滑块验证', ].includes(text)) {
      return this
        .validateSlide();
    }
    return engine
      .nlpConvert(text)
      .then(data => {
        return (this[`nlp${_.upperFirst(data.api)}`] || this[data.api])
          .apply(this, data.params)
          .sleep(1000);
      });
  });

  wd.addPromiseChainMethod('nlpScroll', function() {
    return this
      .execute('window.scrollTo(0, document.body.clientHeight)');
  });

  wd.addPromiseChainMethod('nlpClickElement', function(text, att) {
    return this
      .elementByText(att || text)
      .execute('window.__macaca_current_element.click()');
  });

  wd.addPromiseChainMethod('nlpInput', function(target, content, extraTarget = '', extra = {}) {
    const { index, isInput, } = extra;
    if (isInput && !isNaN(index)) {
      return this
        .execute(`
          var __index = 0;
          var __result = {};
          document.querySelectorAll('input').forEach(elem => {
            var rect = elem.getBoundingClientRect();
            var isTextInput = elem.type === 'text' || elem.type === 'password';
            if (!isTextInput) return;
            var text = elem.placeholder || elem.innerText;
            if (${index} === __index) {
              __result = {
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height,
                text: text.trim(),
                type: elem.nodeName.toLowerCase(),
              };
            }
          });
          return JSON.stringify(__result);
        `)
        .then(res => {
          const element = JSON.parse(res);
          console.log(element);
          const ratio = 1;
          const { x, y, width, height, } = element;
          const xx = (x + width / 2) / ratio;
          const yy = (y + height / 2) / ratio;
          const scripts = `window.__macaca_current_element = document.elementFromPoint(${xx}, ${yy})`;
          console.log(scripts);
          return this
            .execute(scripts)
            .formInput(content);
        });
    }
    console.log(`${target}${extraTarget}`, content);
    return this
      .elementByText(`${target}${extraTarget}`)
      .formInput(content);
  });

  wd.addPromiseChainMethod('nlpSleep', function(q, num) {
    return this
      .sleep(num * 1000);
  });

  wd.addPromiseChainMethod('elementByText', function(text, options = {}) {
    const { index = 0, } = options;
    const elemList = [
      'a',
      'button',
      'input',
      'textarea',
      'label',
    ];
    return new Promise(resolve => {
      const s = `
        var __result = [];
        document.querySelectorAll('${elemList.join(',')}').forEach(elem => {
          var rect = elem.getBoundingClientRect();
          var text = elem.placeholder || elem.innerText;
          if (!text) return;
          __result.push({
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
            text: text.trim(),
            type: elem.nodeName.toLowerCase(),
          });
        });
        return JSON.stringify(__result);
      `;
      console.log(s);
      this
        .execute(s)
        .then(res => {
          const data = JSON.parse(res);
          const elements = data
            .filter(item => item.text.replace(/\s/g, '').includes(text));
          const element = elements[index];
          if (element) {
            const ratio = 1;
            const { x, y, width, height, } = element;
            const xx = (x + width / 2) / ratio;
            const yy = (y + height / 2) / ratio;
            const scripts = `window.__macaca_current_element = document.elementFromPoint(${xx}, ${yy})`;
            console.log(scripts);
            return this
              .execute(scripts)
              .then(() => {
                resolve();
              });
          }
          this
            .takeScreenshot()
            .then((base64) => {
              engine
                .imageRecognize(base64)
                .then(data => {
                  console.log(data);
                  const items = data
                    .filter(item => item.text.replace(/\s/g, '').includes(text));
                  const item = items[index];
                  if (item) {
                    const ratio = 2;
                    const { x, y, w, h, } = item;
                    const xx = (x + w / 2) / ratio;
                    const yy = (y + h / 2) / ratio;
                    const scripts = `window.__macaca_current_element = document.elementFromPoint(${xx}, ${yy})`;
                    console.log(scripts);
                    this
                      .execute(scripts)
                      .then(() => {
                        resolve();
                      });
                  }
                });
            });
        });
    });
  });
};

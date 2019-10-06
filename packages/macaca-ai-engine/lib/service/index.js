'use strict';

const Storage = require('./storage');
const NLP = require('./nlp');
const CV = require('./cv');

module.exports = config => {
  return {
    storage: new Storage(config),
    nlp: new NLP(config),
    cv: new CV(config),
  };
};

'use strict';

const Storage = require('./storage');
const NLP = require('./nlp');
const CV = require('./cv');

exports.storage = new Storage();
exports.nlp = new NLP();
exports.cv = new CV();

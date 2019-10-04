'use strict';

const assert = require('assert');

const Storage = require('../../lib/service/storage');

describe('./test/service/storage.test.js', () => {
  let res, storage;
  describe('constructor', () => {
    it('should be ok', () => {
      assert(Storage);
    });
  });

  describe('methods', () => {
    beforeEach(() => {
      storage = new Storage();
    });
    it('should be ok', async () => {
      res = await storage.putObject();
      console.log(res);
    });
  });
});

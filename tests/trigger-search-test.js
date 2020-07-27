"use strict";
const triggerStore = require("../bot/store/triggerStore.js");
const assert = require('assert').strict;

// stubs for bot functions
const stubs = require("./stubs.js");
const { bot, db } = stubs;

/* global it, describe, before, after */
describe("Fuzzy Search tests", function() {
  before(async () => {
    await triggerStore.initSync(bot, db);
  });

  it("One pass search should return an array of results no more than 50", async () => {
    const results = triggerStore.search("prop", 50);
    assert.ok(Array.isArray(results), 'results is not an array');
    assert.ok(results.length <= 50, 'result has more than 50 items');
    results.forEach(item => assert.strictEqual(typeof item, 'string'));
  });

  it("Recursive search should return an array of results no more than 50", async () => {
    const results = triggerStore.recursiveSearch("propcalwnca4n", 50);
    assert.ok(Array.isArray(results), 'results is not an array');
    assert.ok(results.length <= 50, 'result has more than 50 items');
    results.forEach(item => assert.strictEqual(typeof item, 'string'));
  });
});

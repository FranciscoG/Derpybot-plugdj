"use strict";
const triggerStore = require(process.cwd() + "/bot/store/triggerStore.js");
const repo = require(process.cwd() + "/repo");
const chai = require("chai");
const expect = chai.expect;

// stubs for bot functions
const stubs = require("./stubs.js");
const { bot, db } = stubs;

/* global it, describe, before, after */
describe("Fuzzy Search tests", function() {
  before(async () => {
    await triggerStore.initSync(bot, db);
  });

  it("One pass search should return an array of results no more than 50", async () => {
    var results = triggerStore.search("prop", 50);
    expect(results).to.be.an("array");
    expect(results).to.have.lengthOf.at.most(50);
    results.forEach(item => expect(item).to.be.a("string"));
  });

  it("Recursive search should return an array of results no more than 50", async () => {
    var results = triggerStore.recursiveSearch("propcalwnca4n", 50);

    expect(results).to.be.an("array");
    expect(results).to.have.lengthOf.at.most(50);
    results.forEach(item => expect(item).to.be.a("string"));
  });
});

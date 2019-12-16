"use strict";
const triggerStore = require(process.cwd() + "/bot/store/triggerStore.js");
const { handleCommands } = require(process.cwd() + "/bot/events/chat-command.js");
const chai = require("chai");
const expect = chai.expect;
const should = chai.should;

// stubs for bot functions
const stubs = require("./stubs.js");
const { bot, db } = stubs;

const makeData = require("./sample-chat-command");

/* global it, describe, before */
describe("Trigger tests", function() {
  before(async () => {
    await triggerStore.initSync(bot, db);
  });

  it("should grab a simple non-pointing trigger from the database", done => {
    const data = makeData();
    data.command = "beepboop";
    data.trigger = data.command;

    let result = handleCommands(bot, db, data);
    expect(result).to.be.string;
    done();
  });

  it("should return unrecognized trigger string", done => {
    const data = makeData();
    data.command = "fleebleflarpflopflooblenSnap";
    data.trigger = data.command;

    let result = handleCommands(bot, db, data);
    expect(result).to.include(`is not a recognized trigger`);
    done();
  });
});

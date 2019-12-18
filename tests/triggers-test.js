"use strict";
const triggerStore = require(process.cwd() + "/bot/store/triggerStore.js");
const { handleCommands } = require(process.cwd() +
  "/bot/events/chat-command.js");
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

    let result = handleCommands(bot, db, data);
    expect(result).to.be.string;
    done();
  });

  it("should return unrecognized trigger string", done => {
    const data = makeData();
    data.command = "fleebleflarpflopflooblenSnap";

    let result = handleCommands(bot, db, data);
    expect(result).to.include(`is not a recognized trigger`);
    done();
  });

  it("Bot sending a +prop chat msg should not be able to award points", done => {
    const data = makeData();
    data.command = "prap";
    data.from.username = "TestBot";

    bot.onSendChat(msg => {
      expect(msg).to.include(`not allowed to award points`);
    });

    let result = handleCommands(bot, db, data);
    expect(result).to.include(`+prop`);
    done();
  });

  it("triggers ending with +prop should add a prop to the dj", done => {
    const data = makeData();
    data.command = "prap";
    data.from.username = "SomeRando";
    
    // prap will return 1 line and then the triggerPoint will return the 
    // line about user getting a point
    let i = 0;
    bot.onSendChat(msg => {
      console.log(msg);
      if (i === 0) { 
        i++;
        return; 
      }
      expect(msg).to.include('@testDJname now has');
      done();
    });

    let result = handleCommands(bot, db, data);
    expect(result).to.include(`+prop`);
  
  });
});

"use strict";
const triggerStore = require(process.cwd() + "/bot/store/triggerStore.js");
const repo = require(process.cwd()+'/repo');
const { handleCommands } = require(process.cwd() +"/bot/events/chat-command.js");
const chai = require("chai");
const expect = chai.expect;
const should = chai.should;

// stubs for bot functions
const stubs = require("./stubs.js");
const { bot, db } = stubs;

const makeData = require('./data/command-event-data');

/* global it, describe, before, after */
describe("Trigger tests", function() {
  before(async () => {
    await triggerStore.initSync(bot, db);
    await repo.logUser(db, bot.dj);
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
    // make the "from" person the bot
    data.from = bot.getUser();

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
    
    // prap will invoke 2 separate calls to sendChat.  
    // the first one we can ignore because it's the trigger message
    // the 2nd one is the one we want because it's the success msg from adding a trigger
    let i = 0;
    bot.onSendChat(msg => {
      if (i === 0) { 
        i++;
        return; 
      }
      expect(msg).to.include(`@${bot.dj.username} now has`);
      done();
    });

    let result = handleCommands(bot, db, data);
    expect(result).to.include(`+prop`);
  
  });

  after(async function() {
    const ref = db.ref('users').child(bot.dj.id);
    await ref.set(null);
  });
});

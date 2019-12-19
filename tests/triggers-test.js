"use strict";
const triggerStore = require(process.cwd() + "/bot/store/triggerStore.js");
const triggerCommand = require(process.cwd() + "/bot/commands/triggers/trigger.js");
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
describe("Triggers commands from chat tests", function() {
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
    // the 2nd one is the one we want because it's the success msg adding props to the dj
    let i = 0;
    bot.onSendChat(msg => {
      // console.log(msg);
      if (i === 0) { 
        i++;
        return; 
      }
      expect(msg).to.include(`now has 1 props :fist:`);
      done();
    });

    let result = handleCommands(bot, db, data);
    expect(result).to.include(`+prop`);
  
  });

  it("Trigger +prop from same user can not give another prop", done => {
    const data = makeData();
    data.command = "prap";
    
    // prap will invoke 2 separate calls to sendChat.  
    // the first one we can ignore because it's the trigger message
    // the 2nd one is the one we want because it's the success msg adding props to the dj
    let i = 0;
    bot.onSendChat(msg => {
      // console.log(msg);
      if (i === 0) { 
        i++;
        return; 
      }
      expect(msg).to.include(`you have already given a :fist: for this song`);
      done();
    });

    let result = handleCommands(bot, db, data);
    expect(result).to.include(`+prop`);
  
  });

  it("Trigger +prop from different user adds another prop point", done => {
    const data = makeData();
    data.command = "prap";
    data.from.username = "AnotherPerson";
    data.from.id = "1234";
    
    // prap will invoke 2 separate calls to sendChat.  
    // the first one we can ignore because it's the trigger message
    // the 2nd one is the one we want because it's the success msg adding props to the dj
    let i = 0;
    bot.onSendChat(msg => {
      // console.log(msg);
      if (i === 0) { 
        i++;
        return; 
      }
      expect(msg).to.include(`now has 2 props :fist:`);
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

describe("Creating, Updating, Deleting Triggers", function(){
  const triggerName = 'temp_test_trigger_019';

  before(async () => {
    await triggerStore.initSync(bot, db);
    const trig = await repo.getTriggerAsync(db, triggerName);
    if (trig) {
      var key = Object.keys(trig)[0];
      repo.deleteTrigger(db, key);
    }
  });

  it("should show help if just !trigger was sent", done => {
    const data = makeData();
    data.from.role = 1000; // make them a resDJ so they can add new triggers

    bot.onSendChat(msg => {
      expect(msg).to.equal('*create/update:* !trigger trigger_name trigger_text');
      done();
    });

    triggerCommand(bot, db, data);
  });


  it("should create a new trigger", done => {
    const data = makeData();
    
    data.args = [
      triggerName,
      'this', 'is', 'a', 'test'
    ];

    bot.onSendChat(msg => {
      expect(msg).to.equal(`trigger for *!${triggerName}* created, try it out!`);
      done();
      bot.onSendChat(null);
    });

    triggerCommand(bot, db, data);
  });

  it("newly CREATED trigger should exist in the TriggerStore", done => {
    const data = makeData();
    data.command = triggerName;

    let result = handleCommands(bot, db, data);
    expect(result).to.be.string;
    expect(result).to.equal("this is a test");
    done();
  });

  it("Trying to update a trigger but without proper access fails", done => {
    const data = makeData();
    
    data.args = [
      triggerName,
      'this', 'is', 'not', 'a', 'test'
    ];

    bot.onSendChat(msg => {
      expect(msg).to.equal(`Sorry only Mods and above can update or delete a triggers`);
      done();
      bot.onSendChat(null);
    });

    triggerCommand(bot, db, data);
  });

  it("Successfully update a trigger", done => {
    const data = makeData();
    data.from.role = 3000; // room manager
    
    data.args = [
      triggerName,
      'this', 'is', 'not', 'a', 'test'
    ];

    bot.onSendChat(msg => {
      expect(msg).to.equal(`trigger for *!${triggerName}* updated!`);
      done();
      bot.onSendChat(null);
    });

    triggerCommand(bot, db, data);
  });

  it("newly UPDATED trigger should exist in the TriggerStore", done => {
    const data = makeData();
    data.command = triggerName;

    let result = handleCommands(bot, db, data);
    expect(result).to.be.string;
    expect(result).to.equal("this is not a test");
    done();
  });

  after(async function(){
    const trig = await repo.getTriggerAsync(db, triggerName);
    if (trig) {
      var key = Object.keys(trig)[0];
      repo.deleteTrigger(db, key);
    }
  });
});
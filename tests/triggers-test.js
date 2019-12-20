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

  it("should grab a simple non-pointing trigger from the database", async () => {
    const data = makeData();
    data.command = "beepboop";

    let result = await handleCommands(bot, db, data);
    expect(result).to.be.an('array');
    result.forEach(item => expect(item).to.be.a('string'));
  });

  it("should return unrecognized trigger string", async () => {
    const data = makeData();
    data.command = "fleebleflarpflopflooblenSnap";

    let result = await handleCommands(bot, db, data);
    expect(result).to.be.an('array');
    result.forEach(item => expect(item).to.be.a('string'));
    expect(result.join(' ')).to.include(`is not a recognized trigger`);
  });

  it("Bot sending a +prop chat msg should not be able to award points", async () => {
    const data = makeData();
    data.command = "prap";
    data.from = bot.getUser(); // make the "from" person the bot

    let result = await handleCommands(bot, db, data);
    expect(result).to.be.an('array');
    result.forEach(item => expect(item).to.be.a('string'));
    expect(result).to.include('I am not allowed to award points');
  });

  it("triggers ending with +prop should add a prop to the dj", async () => {
    const data = makeData();
    data.command = "prap";
    
    let result = await handleCommands(bot, db, data);
    expect(result.join(' ')).to.include(`now has 1 props :fist:`);
  });

  it("Trigger +prop from same user can not give another prop", async () => {
    const data = makeData();
    data.command = "prap";
      
    let result = await handleCommands(bot, db, data);
    expect(result.join(' ')).to.include(`you have already given a :fist: for this song`);
  });

  it("Trigger +prop from different user adds another prop point", async () => {
    const data = makeData();
    data.command = "prap";
    data.from.username = "AnotherPerson";
    data.from.id = "1234";
        
    let result = await handleCommands(bot, db, data);
    expect(result.join(' ')).to.include(`now has 2 props :fist:`);  
  });

  after(async function() {
    const ref = db.ref('users').child(bot.dj.id);
    await ref.set(null);
  });
});

// describe("Creating, Updating, Deleting Triggers", function(){
//   const triggerName = 'temp_test_trigger_019';

//   before(async () => {
//     await triggerStore.initSync(bot, db);
//     const trig = await repo.getTriggerAsync(db, triggerName);
//     if (trig) {
//       var key = Object.keys(trig)[0];
//       repo.deleteTrigger(db, key);
//     }
//   });

//   it("should show help if just !trigger was sent", async () => {
//     const data = makeData();
//     data.from.role = 1000; // make them a resDJ so they can add new triggers
    
//     triggerCommand(bot, db, data);
//     expect(msg).to.equal('*create/update:* !trigger trigger_name trigger_text');
//   });


//   it("should create a new trigger", async () => {
//     const data = makeData();
    
//     data.args = [
//       triggerName,
//       'this', 'is', 'a', 'test'
//     ];

//     bot.onSendChat(msg => {
//       expect(msg).to.equal(`trigger for *!${triggerName}* created, try it out!`);
//       ;
//       bot.onSendChat(null);
//     });

//     triggerCommand(bot, db, data);
//   });

//   it("newly CREATED trigger should exist in the TriggerStore", async () => {
//     const data = makeData();
//     data.command = triggerName;

//     let result = await handleCommands(bot, db, data);
//     expect(result).to.be.string;
//     expect(result).to.equal("this is a test");
//     ;
//   });

//   it("Trying to update a trigger but without proper access fails", async () => {
//     const data = makeData();
    
//     data.args = [
//       triggerName,
//       'this', 'is', 'not', 'a', 'test'
//     ];

//     bot.onSendChat(msg => {
//       expect(msg).to.equal(`Sorry only Mods and above can update or delete a triggers`);
//       ;
//       bot.onSendChat(null);
//     });

//     triggerCommand(bot, db, data);
//   });

//   it("Successfully update a trigger", async () => {
//     const data = makeData();
//     data.from.role = 3000; // room manager
    
//     data.args = [
//       triggerName,
//       'this', 'is', 'not', 'a', 'test'
//     ];

//     bot.onSendChat(msg => {
//       expect(msg).to.equal(`trigger for *!${triggerName}* updated!`);
//       ;
//       bot.onSendChat(null);
//     });

//     triggerCommand(bot, db, data);
//   });

//   it("newly UPDATED trigger should exist in the TriggerStore", async () => {
//     const data = makeData();
//     data.command = triggerName;

//     let result = await handleCommands(bot, db, data);
//     expect(result).to.be.string;
//     expect(result).to.equal("this is not a test");
//     ;
//   });

//   after(async function(){
//     const trig = await repo.getTriggerAsync(db, triggerName);
//     if (trig) {
//       var key = Object.keys(trig)[0];
//       repo.deleteTrigger(db, key);
//     }
//   });
// });
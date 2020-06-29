"use strict";
const triggerStore = require(process.cwd() + "/bot/store/triggerStore.js");
const triggerCommand = require(process.cwd() + "/bot/commands/triggers/trigger.js");
const repo = require(process.cwd() + "/repo");

const chai = require("chai");
const expect = chai.expect;

// stubs for bot functions
const stubs = require("./stubs.js");
const { bot, db } = stubs;

const makeData = require("./data/command-event-data");

/* global it, describe, before, after */
describe("Creating, Updating, Deleting Triggers", function(){
  const triggerName = 'temp_test_trigger_019';

  before(async () => {
    await triggerStore.initSync(bot, db);
    const [err, trig] = await repo.getTrigger(db, triggerName);
    if (trig) {
      var key = Object.keys(trig)[0];
      repo.deleteTrigger(db, key);
    }
  });

  it("should show help if just !trigger was sent", async () => {
    const data = makeData();
    data.from.role = 1000; // make them a resDJ so they can add new triggers

    triggerCommand(bot, db, data);
    expect(msg).to.equal('*create/update:* !trigger trigger_name trigger_text');
  });

  it("should create a new trigger", async () => {
    const data = makeData();

    data.args = [
      triggerName,
      'this', 'is', 'a', 'test'
    ];

    bot.onSendChat(msg => {
      expect(msg).to.equal(`trigger for *!${triggerName}* created, try it out!`);
      ;
      bot.onSendChat(null);
    });

    triggerCommand(bot, db, data);
  });

  it("newly CREATED trigger should exist in the TriggerStore", async () => {
    const data = makeData();
    data.command = triggerName;

    let result = await handleCommands(bot, db, data);
    expect(result).to.be.string;
    expect(result).to.equal("this is a test");
    ;
  });

  it("Trying to update a trigger but without proper access fails", async () => {
    const data = makeData();

    data.args = [
      triggerName,
      'this', 'is', 'not', 'a', 'test'
    ];

    bot.onSendChat(msg => {
      expect(msg).to.equal(`Sorry only Mods and above can update or delete a triggers`);
      ;
      bot.onSendChat(null);
    });

    triggerCommand(bot, db, data);
  });

  it("Successfully update a trigger", async () => {
    const data = makeData();
    data.from.role = 3000; // room manager

    data.args = [
      triggerName,
      'this', 'is', 'not', 'a', 'test'
    ];

    bot.onSendChat(msg => {
      expect(msg).to.equal(`trigger for *!${triggerName}* updated!`);
      ;
      bot.onSendChat(null);
    });

    triggerCommand(bot, db, data);
  });

  it("newly UPDATED trigger should exist in the TriggerStore", async () => {
    const data = makeData();
    data.command = triggerName;

    let result = await handleCommands(bot, db, data);
    expect(result).to.be.string;
    expect(result).to.equal("this is not a test");
    ;
  });

  after(async function(){
    const trig = await repo.getTriggerAsync(db, triggerName);
    if (trig) {
      var key = Object.keys(trig)[0];
      repo.deleteTrigger(db, key);
    }
  });
});

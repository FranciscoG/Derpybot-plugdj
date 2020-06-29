"use strict";
const triggerStore = require(process.cwd() + "/bot/store/triggerStore.js");
const triggerCommand = require(process.cwd() + "/bot/commands/triggers/trigger.js");
const triggerRepo = require("../repos/triggers.js");
const assert = require("assert");

const chai = require("chai");
const expect = chai.expect;

// stubs for bot functions
const stubs = require("./stubs.js");
const { bot, db } = stubs;

const makeData = require("./data/command-event-data");

/* global it, describe, before, after */
describe.only("Creating, Updating, Deleting Triggers", function () {
  const triggerName = "temp_test_trigger_019";

  before(async () => {
    await triggerStore.initSync(bot, db);
    const [err, trig] = await triggerRepo.getTrigger(db, triggerName);
    if (trig) {
      triggerRepo.deleteTrigger(db, trig);
    }
  });

  it("should show help if just !trigger was sent", async () => {
    const data = makeData();
    data.from.role = 1000; // make them a resDJ so they can add new triggers

    const msg = await triggerCommand(bot, db, data);
    expect(msg).to.include("!trigger trigger_name trigger_text");
  });

  it("should create a new trigger", async () => {
    const data = makeData();

    data.args = [triggerName, "this", "is", "a", "test"];

    bot.onSendChat((msg) => {
      expect(msg).to.include(`trigger for *!${triggerName}* created`);
      bot.onSendChat(null);
    });

    await triggerCommand(bot, db, data);
  });

  it("newly CREATED trigger should exist in the TriggerStore", async () => {
    const trig = triggerStore.get(triggerName);
    expect(trig).to.be.an("object");
    expect(trig.data.Returns).to.equal("this is a test");
  });

  it("Trying to update a trigger but without proper access fails", async () => {
    const data = makeData();

    data.args = [triggerName, "this", "is", "not", "a", "test"];

    bot.onSendChat((msg) => {
      expect(msg).to.equal(`Sorry only Mods and above can update or delete a triggers`);
      bot.onSendChat(null);
    });

    await triggerCommand(bot, db, data);
  });

  it("Successfully update a trigger", async () => {
    const data = makeData();
    data.from.role = 3000; // room manager

    data.args = [triggerName, "this", "is", "not", "a", "test"];

    bot.onSendChat((msg) => {
      expect(msg).to.equal(`trigger for *!${triggerName}* updated!`);
      bot.onSendChat(null);
    });

    await triggerCommand(bot, db, data);
  });

  it("newly UPDATED trigger should exist in the TriggerStore", async () => {
    const trig = triggerStore.get(triggerName);
    expect(trig).to.be.an("object");
    expect(trig.data.Returns).to.equal("this is not a test");
  });
});

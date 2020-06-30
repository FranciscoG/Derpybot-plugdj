"use strict";
const triggerStore = require(process.cwd() + "/bot/store/triggerStore.js");
const triggerCommand = require(process.cwd() + "/bot/commands/triggers/trigger.js");
const triggerRepo = require("../repos/triggers.js");

const chai = require("chai");
const expect = chai.expect;

// stubs for bot functions
const stubs = require("./stubs.js");
const userObjects = require("./data/user-objects");
const { bot, db } = stubs;

const makeData = require("./data/command-event-data");

async function deleteTrigByName(triggerName) {
  const [err, trig] = await triggerRepo.getTrigger(db, triggerName);
  if (trig) {
    await triggerRepo.deleteTrigger(db, trig);
  }
}

/* global it, describe, before, after */
describe("Creating, Updating, Deleting Triggers", function () {
  const triggerName = "temp_test_trigger_001";

  before(async () => {
    await triggerStore.initSync(bot, db);
    await deleteTrigByName(triggerName);
  });

  it("should show help if just !trigger was sent", async () => {
    const data = makeData();
    data.from.role = 1000; // make them a resDJ so they can add new triggers

    const msg = await triggerCommand(bot, db, data);
    expect(msg).to.include("!trigger trigger_name trigger_text");
  });

  it("can not create a trigger with invalid characters", async () => {
    const data = makeData();
    data.args = ['[])', "this", "is", "a", "test"];
    const msg = await triggerCommand(bot, db, data);
    expect(msg).to.equal(`Trigger names can NOT contain the following characters: . $ [ ] # /`);
  });

  it("should create a new trigger", async () => {
    const data = makeData();
    data.args = [triggerName, "this", "is", "a", "test"];
    const msg = await triggerCommand(bot, db, data);
    expect(msg).to.include(`trigger for *!${triggerName}* created`);
  });

  it("Trying to update a trigger but without proper access fails", async () => {
    const data = makeData();

    // change to a user with only ResDJ role
    data.from = userObjects.rando;

    // try updating
    data.args = [triggerName, "this", "is", "not", "a", "test"];
    const msg = await triggerCommand(bot, db, data);
    expect(msg).to.equal(`Sorry only Mods and above can update or delete a triggers`);
  });

  it("Successfully update a trigger", async () => {
    const data = makeData();
    data.from.role = 3000; // room manager
    data.args = [triggerName, "this", "is", "not", "a", "test"];
    const msg = await triggerCommand(bot, db, data);
    expect(msg).to.equal(`trigger for *!${triggerName}* updated!`);
  });
});

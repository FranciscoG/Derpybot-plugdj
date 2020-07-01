"use strict";
const propifyCommand = require(process.cwd() + "/bot/commands/triggers/propify.js");
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
describe.only("Creating, Updating, Deleting Triggers", function () {
  const triggerName = "temp_test_trigger_002";

  before(async () => {
    await deleteTrigByName(triggerName);

    const data = makeData();
    data.args = [triggerName, "cool", "song"];
    await triggerCommand(bot, db, data);
  });

  it("should show help if just !trigger was sent", async () => {
    const data = makeData();
    const msg = await propifyCommand(bot, db, data);
    expect(msg).to.include("!propify <trigger_name>");
  });

  // resdj min role
  it("Only ResDJ and up can propify a trigger", async () => {
    const data = makeData();
    data.from = userObjects.rando2;
    data.args = [triggerName];
    const msg = await propifyCommand(bot, db, data);
    expect(msg).to.equal(`Sorry only Resident DJs or above can !propify`);
  });

  // propify's a trigger
  it("Successfully propify", async () => {
    const data = makeData();
    data.args = [triggerName];
    const msg = await propifyCommand(bot, db, data);
    expect(msg).to.equal(`trigger *!${triggerName}* propified!`);
  });

  // adds a propify emoji to a trigger
  // changes a propify emoji
});

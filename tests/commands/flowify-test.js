"use strict";
const assert = require("assert").strict;
const flowifyCommand = require(process.cwd() + "/bot/commands/triggers/flowify.js");
const triggerCommand = require(process.cwd() + "/bot/commands/triggers/trigger.js");
const triggerRepo = require("../../repos/triggers.js");

// stubs for bot functions
const stubs = require("../stubs.js");
const userObjects = require("../data/user-objects");
const { bot, db } = stubs;

const makeData = require("../data/command-event-data");

async function deleteTrigByName(triggerName) {
  const [err, trig] = await triggerRepo.getTrigger(db, triggerName);
  if (trig) {
    await triggerRepo.deleteTrigger(db, trig);
  }
}

/* global it, describe, before, after */
describe("!flowify tests", function () {
  const triggerName = "temp_test_trigger_003";

  before(async () => {
    await deleteTrigByName(triggerName);
  });

  it("should show help if just !trigger was sent", async () => {
    const data = makeData();
    const msg = await flowifyCommand(bot, db, data);
    assert.ok(msg.includes("!flowify <trigger_name>"));
  });

  it("Can't flowify a trigger that does not exist", async () => {
    const data = makeData();
    data.args = [triggerName];
    const msg = await flowifyCommand(bot, db, data);
    assert.ok(msg.includes(`Trigger ${triggerName} does not exist`));
  });

  // resdj min role
  it("Only ResDJ and up can flowify a trigger", async () => {
    const data = makeData();
    data.user = userObjects.rando2;
    data.args = [triggerName];
    const msg = await flowifyCommand(bot, db, data);
    assert.strictEqual(msg, `Sorry only Resident DJs or above can !flowify`);
  });

  // flowify's a trigger
  it("Successfully flowify", async () => {
    // create trigger
    const data0 = makeData();
    data0.args = [triggerName, "cool", "song"];
    await triggerCommand(bot, db, data0);

    // now flowify it
    const data = makeData();
    data.args = [triggerName];
    const msg = await flowifyCommand(bot, db, data);
    assert.strictEqual(msg, `trigger *!${triggerName}* flowified!`);

    const [err, trig] = await triggerRepo.getTrigger(db, triggerName);
    assert.strictEqual(trig.givesFlow, true);
  });

  it("set a custom emoji for flow", async () => {
    const data = makeData();
    data.args = [triggerName, "taco"];
    const msg = await flowifyCommand(bot, db, data);
    assert.strictEqual(msg, `trigger *!${triggerName}* flowified!`);

    const [err, trig] = await triggerRepo.getTrigger(db, triggerName);
    assert.strictEqual(trig.flowEmoji, "taco");
  });

  it("change custom emoji for flow", async () => {
    const data = makeData();
    data.args = [triggerName, "phone"];
    const msg = await flowifyCommand(bot, db, data);
    assert.strictEqual(msg, `trigger *!${triggerName}* flowified!`);

    const [err, trig] = await triggerRepo.getTrigger(db, triggerName);
    assert.strictEqual(trig.flowEmoji, "phone");
  });
});

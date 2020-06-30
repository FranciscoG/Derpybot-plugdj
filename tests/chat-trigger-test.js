"use strict";
const triggerStore = require(process.cwd() + "/bot/store/triggerStore.js");
const repo = require(process.cwd() + "/repo");
const { handleCommands } = require(process.cwd() + "/bot/events/chat-command.js");
const chai = require("chai");
const expect = chai.expect;

// stubs for bot functions
const stubs = require("./stubs.js");
const { bot, db } = stubs;

const makeData = require("./data/command-event-data");

/* global it, describe, before, after */
describe("Triggers commands from chat tests", function () {
  before(async () => {
    await triggerStore.initSync(bot, db);
    await repo.logUser(db, bot.dj);
  });

  it("should grab a simple non-pointing trigger from the database", async () => {
    const data = makeData();
    data.command = "beepboop";

    let result = await handleCommands(bot, db, data);
    expect(result).to.be.an("array");
    result.forEach((item) => expect(item).to.be.a("string"));
  });

  it("should return unrecognized trigger string", async () => {
    const data = makeData();
    data.command = "fleebleflarpflopflooblenSnap";

    let result = await handleCommands(bot, db, data);
    expect(result).to.be.an("array");
    result.forEach((item) => expect(item).to.be.a("string"));
    expect(result.join(" ")).to.include(`is not a recognized trigger`);
  });

  it("Bot sending a propping chat msg should not be able to award points", async () => {
    const data = makeData();
    data.command = "prap";
    data.from = bot.getUser(); // make the "from" person the bot

    let result = await handleCommands(bot, db, data);
    expect(result).to.be.an("array");
    result.forEach((item) => expect(item).to.be.a("string"));
    expect(result).to.include("I am not allowed to award points");
  });

  it("Propping triggers should add a prop to the dj", async () => {
    const data = makeData();
    data.command = "prap";

    let result = await handleCommands(bot, db, data);
    expect(result.join(" ")).to.include(`now has 1 props :taco:`);
  });

  it("Propping same user should not be allowed within the same song", async () => {
    const data = makeData();
    data.command = "prap";

    let result = await handleCommands(bot, db, data);
    expect(result.join(" ")).to.include(`you have already given a :taco: for this song`);
  });

  it("Prop from different user adds another prop point", async () => {
    const data = makeData();
    data.command = "prap";
    data.from.username = "AnotherPerson";
    data.from.id = "1234";

    let result = await handleCommands(bot, db, data);
    expect(result.join(" ")).to.include(`now has 2 props :taco:`);
  });

  after(async function () {
    const ref = db.ref("users").child(bot.dj.id);
    await ref.set(null);
  });
});

describe("Trigger code tests", function () {
  before(async () => {
    await triggerStore.initSync(bot, db);
    await repo.logUser(db, bot.dj);
  });

  it("Special trigger code should return result", async () => {
    const data = makeData();
    data.command = "dadjoke";

    let result = await handleCommands(bot, db, data);
    expect(result).to.be.an("array");
    result.forEach((item) => expect(item).to.be.a("string"));
  });
});
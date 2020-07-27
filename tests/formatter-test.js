"use strict";
const assert = require("assert").strict;
const makeData = require("./data/command-event-data");

// stubs for bot functions
const stubs = require("./stubs.js");
const bot = stubs.bot;

// DJ = testDJname;
const data = makeData();

// require our file to test
const triggerFormatter = require("../bot/utilities/trigger-formatter.js");

/* global it, describe */
describe("Trigger Formatter tests", function () {
  it("Should show the first argument", function (done) {
    var text = "hello @%0|dj%";
    data.args = ["you"];
    var parsed = triggerFormatter(text, bot, data);
    assert.strictEqual(parsed, "hello @you");
    done();
  });

  it("only show the defaults", function (done) {
    data.args = [];

    var text = "hello %0|dj%, do you know %1|me%, because %1|me% am %2|amazing%";
    var parsed = triggerFormatter(text, bot, data);
    assert.strictEqual(
      parsed,
      `hello ${bot.dj.username}, do you know ${data.from.username}, because ${data.from.username} am amazing`
    );
    done();
  });

  it("Should do replacement with all args given in order", function (done) {
    var text = "%0% %1% %2% %3% %4% %5% %6% %7%";
    data.args = ["this", "is", "a", "test", "of", "the", "trigger", "system"];
    var parsed = triggerFormatter(text, bot, data);
    assert.strictEqual(parsed, "this is a test of the trigger system");
    done();
  });

  it("mixing reserved words with interpolated n", function (done) {
    var text = "hey you %dj%, %0% said to %me% that you suck";
    data.args = ["yoda"];
    var parsed = triggerFormatter(text, bot, data);
    assert.strictEqual(
      parsed,
      `hey you @${bot.dj.username}, yoda said to ${data.from.username} that you suck`
    );
    done();
  });

  it("with and without reserved word defaults", function (done) {
    var text = "hey %0|dj%, you are pretty %1|cool%";
    data.args = ["brad"];
    var parsed = triggerFormatter(text, bot, data);
    assert.strictEqual(parsed, "hey brad, you are pretty cool");

    data.args = ["brad", "dumb"];
    parsed = triggerFormatter(text, bot, data);
    assert.strictEqual(parsed, "hey brad, you are pretty dumb");
    done();
  });

  it("out of order in the text", function (done) {
    var text = "%0% hated her %2% because it was full of %3% and %1%";
    data.args = ["sally", "bees", "head", "doodoo"];
    var parsed = triggerFormatter(text, bot, data);
    assert.strictEqual(parsed, "sally hated her head because it was full of doodoo and bees");
    done();
  });

  it("shoud format this properly", function (done) {
    const text = "your ambient song is too cool not to yoink %dj%. *nature noise* ";
    var parsed = triggerFormatter(text, bot, data);
    assert.strictEqual(
      parsed,
      `your ambient song is too cool not to yoink @${bot.dj.username}. *nature noise* `
    );
    done();
  });
});
